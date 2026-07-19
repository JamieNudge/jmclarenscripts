import type { StatStrikeDailySelection, StatStrikePredictionLevel } from '@/lib/statstrike/models';
import type { StatStrikeTrackRecord } from '@/lib/statstrike/track-record';
import { recordsFromSelection } from '@/lib/statstrike/track-record';

/** UK selection days loaded for streak + competition ranking. */
export const HOMEPAGE_METRICS_WINDOW_DAYS = 30;

/** Minimum settled tips before a competition can be “best”. */
export const HOMEPAGE_BEST_COMPETITION_MIN_SAMPLE = 20;

export const HOMEPAGE_FRESH_MS = 30 * 60 * 1000;
export const HOMEPAGE_DELAYED_MS = 2 * 60 * 60 * 1000;

export type HomepageModelStatusKind = 'live' | 'delayed' | 'stale' | 'unknown';

export type HomepageHotStreakFixture = {
  fixtureId: number;
  competition: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  kickoffMs: number;
  forecast: StatStrikePredictionLevel;
  homeScore: number;
  awayScore: number;
  successful: boolean;
  selectionDateKey: string;
};

export type HomepageHotStreak = {
  count: number;
  startedAt: string | null;
  lastUpdatedAt: string | null;
  latest: HomepageHotStreakFixture | null;
  fixtures: HomepageHotStreakFixture[];
};

export type HomepageBestCompetition = {
  competitionId: string;
  competitionName: string;
  country: string;
  sampleSize: number;
  successfulForecasts: number;
  performanceRate: number;
  platformAverage: number;
  periodLabel: string;
  lastUpdatedAt: string | null;
} | null;

export type HomepageModelStatus = {
  status: HomepageModelStatusKind;
  lastForecastUpdate: string | null;
  forecastsGeneratedToday: number;
  activeCompetitions: number;
  resultsProcessedToday: number;
  modelVersion: string | null;
};

export type HomepageMetricsSnapshot = {
  generatedAt: string;
  successDefinition: string;
  hotStreak: HomepageHotStreak;
  bestCompetition: HomepageBestCompetition;
  modelStatus: HomepageModelStatus;
};

export const HOMEPAGE_SUCCESS_DEFINITION =
  'A successful forecast is one fixture tip on the StatStrike board whose recommended tip band (for example Over 2.5 Goals) matched the confirmed full-time total goals. The hot streak is the longest consecutive run of successes across all competitions in the recent window (ties prefer the most recent run). Postponed, abandoned, and unfinished fixtures are excluded.';

function toIso(ms: number | null | undefined): string | null {
  if (ms == null || !Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

function competitionKey(country: string, league: string): string {
  const c = country.trim();
  const l = league.trim();
  return c ? `${c} - ${l}` : l;
}

function recordToStreakFixture(r: StatStrikeTrackRecord): HomepageHotStreakFixture | null {
  if (r.isCorrect == null || r.homeScore == null || r.awayScore == null) return null;
  return {
    fixtureId: r.fixtureId,
    competition: r.league,
    country: r.country,
    homeTeam: r.homeTeam,
    awayTeam: r.awayTeam,
    kickoffMs: r.kickoffMs,
    forecast: r.tipBand,
    homeScore: r.homeScore,
    awayScore: r.awayScore,
    successful: r.isCorrect === true,
    selectionDateKey: r.selectionDateKey,
  };
}

/**
 * Longest consecutive successful **fixture-tip** run across the whole app
 * (every competition), in kickoff order. Ties prefer the most recent run.
 * Unsettled fixtures are skipped (they do not break a run).
 */
export function computeHotStreak(records: StatStrikeTrackRecord[]): HomepageHotStreak {
  // Prefer the latest selection-day copy when a fixture id appears more than once.
  const byId = new Map<number, StatStrikeTrackRecord>();
  for (const r of records) {
    if (r.isCorrect == null || r.homeScore == null || r.awayScore == null) continue;
    const prev = byId.get(r.fixtureId);
    if (!prev || r.selectionDateKey >= prev.selectionDateKey) {
      byId.set(r.fixtureId, r);
    }
  }

  const settled = Array.from(byId.values()).sort(
    (a, b) => a.kickoffMs - b.kickoffMs || a.fixtureId - b.fixtureId,
  );

  let best: StatStrikeTrackRecord[] = [];
  let current: StatStrikeTrackRecord[] = [];

  for (const r of settled) {
    if (r.isCorrect === true) {
      current.push(r);
      // Prefer longer; if equal length, prefer this (more recent) run.
      if (current.length >= best.length) {
        best = current.slice();
      }
    } else {
      current = [];
    }
  }

  // Newest first for the drawer / “latest” summary.
  const newestFirst = best.slice().reverse();
  const fixtures = newestFirst
    .map(recordToStreakFixture)
    .filter((f): f is HomepageHotStreakFixture => f != null);

  const latest = fixtures[0] ?? null;
  const oldest = fixtures.length ? fixtures[fixtures.length - 1] : null;

  return {
    count: fixtures.length,
    startedAt: oldest ? toIso(oldest.kickoffMs) : null,
    lastUpdatedAt: latest ? toIso(latest.kickoffMs) : null,
    latest,
    fixtures,
  };
}

/**
 * Best competition over the loaded window: accuracy among leagues with
 * at least `minSample` settled tips. Ties → larger sample → more recent last kickoff.
 */
export function computeBestCompetition(
  records: StatStrikeTrackRecord[],
  opts?: { minSample?: number; windowDays?: number },
): HomepageBestCompetition {
  const minSample = opts?.minSample ?? HOMEPAGE_BEST_COMPETITION_MIN_SAMPLE;
  const windowDays = opts?.windowDays ?? HOMEPAGE_METRICS_WINDOW_DAYS;
  const periodLabel = `Last ${windowDays} days · min ${minSample} settled`;

  const settled = records.filter(
    (r) => r.isCorrect != null && r.homeScore != null && r.awayScore != null,
  );
  if (!settled.length) return null;

  const platformCorrect = settled.filter((r) => r.isCorrect === true).length;
  const platformAverage = platformCorrect / settled.length;

  type Agg = {
    country: string;
    league: string;
    sample: number;
    wins: number;
    lastKickoffMs: number;
  };
  const byKey = new Map<string, Agg>();

  for (const r of settled) {
    const key = competitionKey(r.country, r.league);
    const cur = byKey.get(key) ?? {
      country: r.country,
      league: r.league,
      sample: 0,
      wins: 0,
      lastKickoffMs: 0,
    };
    cur.sample += 1;
    if (r.isCorrect === true) cur.wins += 1;
    if (r.kickoffMs > cur.lastKickoffMs) cur.lastKickoffMs = r.kickoffMs;
    byKey.set(key, cur);
  }

  const eligible = Array.from(byKey.entries())
    .map(([id, a]) => ({ id, ...a, rate: a.wins / a.sample }))
    .filter((a) => a.sample >= minSample);

  if (!eligible.length) return null;

  eligible.sort((a, b) => {
    if (b.rate !== a.rate) return b.rate - a.rate;
    if (b.sample !== a.sample) return b.sample - a.sample;
    return b.lastKickoffMs - a.lastKickoffMs;
  });

  const top = eligible[0];
  return {
    competitionId: top.id,
    competitionName: top.league,
    country: top.country,
    sampleSize: top.sample,
    successfulForecasts: top.wins,
    performanceRate: top.rate,
    platformAverage,
    periodLabel,
    lastUpdatedAt: toIso(top.lastKickoffMs),
  };
}

export function modelStatusFromFreshness(
  lastUpdatedMs: number | null,
  nowMs: number = Date.now(),
): HomepageModelStatusKind {
  if (lastUpdatedMs == null || !Number.isFinite(lastUpdatedMs)) return 'unknown';
  const age = nowMs - lastUpdatedMs;
  if (age < HOMEPAGE_FRESH_MS) return 'live';
  if (age < HOMEPAGE_DELAYED_MS) return 'delayed';
  return 'stale';
}

export function computeModelStatus(
  todaySelection: StatStrikeDailySelection | null,
  todayRecords: StatStrikeTrackRecord[],
  nowMs: number = Date.now(),
): HomepageModelStatus {
  const lastMs = todaySelection?.lastUpdatedMs ?? null;
  const competitions = new Set(
    todayRecords.map((r) => competitionKey(r.country, r.league)).filter(Boolean),
  );

  return {
    status: modelStatusFromFreshness(lastMs, nowMs),
    lastForecastUpdate: toIso(lastMs),
    forecastsGeneratedToday: todayRecords.length,
    activeCompetitions: competitions.size,
    resultsProcessedToday: todayRecords.filter((r) => r.isCorrect != null).length,
    modelVersion: todaySelection?.version ?? null,
  };
}

export function buildHomepageMetricsSnapshot(args: {
  records: StatStrikeTrackRecord[];
  todaySelection: StatStrikeDailySelection | null;
  todayDateKey: string;
  now?: Date;
  windowDays?: number;
  minSample?: number;
}): HomepageMetricsSnapshot {
  const now = args.now ?? new Date();
  const windowDays = args.windowDays ?? HOMEPAGE_METRICS_WINDOW_DAYS;
  const minSample = args.minSample ?? HOMEPAGE_BEST_COMPETITION_MIN_SAMPLE;
  const todayRecords = args.todaySelection
    ? recordsFromSelection(args.todaySelection, args.todayDateKey)
    : args.records.filter((r) => r.selectionDateKey === args.todayDateKey);

  return {
    generatedAt: now.toISOString(),
    successDefinition: HOMEPAGE_SUCCESS_DEFINITION,
    hotStreak: computeHotStreak(args.records),
    bestCompetition: computeBestCompetition(args.records, { minSample, windowDays }),
    modelStatus: computeModelStatus(args.todaySelection, todayRecords, now.getTime()),
  };
}
