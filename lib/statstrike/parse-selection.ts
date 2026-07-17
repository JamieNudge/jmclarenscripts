import { leaguePerformanceLookupKey } from '@/lib/best-picks-firebase';
import { parseGoalBandCascade } from '@/lib/statstrike/goal-band-cascade';
import type {
  StatStrikeDailySelection,
  StatStrikeFixture,
  StatStrikeLeague,
  StatStrikePrediction,
  StatStrikeTeam,
} from '@/lib/statstrike/models';

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asString(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

function parseTeam(v: unknown, fallbackName = 'Unknown'): StatStrikeTeam {
  const o = asRecord(v);
  return {
    id: asNumber(o?.id) ?? 0,
    name: asString(o?.name) ?? fallbackName,
    logo: asString(o?.logo),
  };
}

function parseLeague(v: unknown): StatStrikeLeague {
  const o = asRecord(v);
  return {
    id: asNumber(o?.id) ?? 0,
    name: asString(o?.name) ?? 'League',
    country: asString(o?.country) ?? '',
    logo: asString(o?.logo),
  };
}

function parseKickoffMs(dateVal: unknown): number {
  if (typeof dateVal === 'number' && Number.isFinite(dateVal)) {
    return dateVal < 10_000_000_000 ? dateVal * 1000 : dateVal;
  }
  if (typeof dateVal === 'string') {
    const t = Date.parse(dateVal);
    if (!Number.isNaN(t)) return t;
  }
  const o = asRecord(dateVal);
  if (o) {
    const sec = asNumber(o._seconds) ?? asNumber(o.seconds);
    if (sec != null) return sec * 1000;
  }
  return 0;
}

function parseScores(o: Record<string, unknown>): { home: number | null; away: number | null } {
  let home = asNumber(o.homeScore) ?? asNumber(o.home_score);
  let away = asNumber(o.awayScore) ?? asNumber(o.away_score);
  if (home == null || away == null) {
    const goals = asRecord(o.goals);
    if (goals) {
      home = home ?? asNumber(goals.home);
      away = away ?? asNumber(goals.away);
    }
  }
  if (home == null || away == null) {
    const score = asRecord(o.score);
    const ft = asRecord(score?.fulltime);
    if (ft) {
      home = home ?? asNumber(ft.home);
      away = away ?? asNumber(ft.away);
    }
  }
  return { home, away };
}

export function parseFixture(raw: unknown): StatStrikeFixture | null {
  const o = asRecord(raw);
  if (!o) return null;
  const id = asNumber(o.id);
  if (id == null) return null;
  const kickoffMs = parseKickoffMs(o.date);
  const scores = parseScores(o);
  return {
    id,
    date: kickoffMs ? new Date(kickoffMs).toISOString() : asString(o.date) ?? '',
    kickoffMs,
    homeTeam: parseTeam(o.homeTeam, 'Home'),
    awayTeam: parseTeam(o.awayTeam, 'Away'),
    league: parseLeague(o.league),
    venue: asString(o.venue),
    status: asString(o.status),
    elapsed: asNumber(o.elapsed),
    homeScore: scores.home,
    awayScore: scores.away,
  };
}

function parsePredictionPayload(raw: unknown): StatStrikePrediction | null {
  const o = asRecord(raw);
  if (!o) return null;
  const level = asString(o.level) ?? asString(o.recommendedLevel);
  if (!level) return null;
  const matched = asNumber(o.matchedCriteria) ?? 0;
  const total = asNumber(o.totalCriteria) ?? 11;
  const sig = Array.isArray(o.significantStats)
    ? o.significantStats.filter((s): s is string => typeof s === 'string')
    : [];
  const goalBandCascade = parseGoalBandCascade(o.goalBandCascade);
  return {
    level,
    recommendedLevel: asString(o.recommendedLevel),
    matchedCriteria: matched,
    totalCriteria: total,
    significantStats: sig,
    bookmakerOdds: asNumber(o.bookmakerOdds),
    sourceLabel: asString(o.sourceLabel),
    goalBandCascade,
  };
}

export function parseDailySelection(raw: unknown): StatStrikeDailySelection | null {
  const o = asRecord(raw);
  if (!o) return null;

  const fixturesRaw = o.fixtures;
  const fixtures: StatStrikeFixture[] = [];
  if (Array.isArray(fixturesRaw)) {
    for (const f of fixturesRaw) {
      const parsed = parseFixture(f);
      if (parsed) fixtures.push(parsed);
    }
  }

  const predictionsByFixtureId = new Map<number, StatStrikePrediction>();
  const predsRaw = o.predictions;
  if (Array.isArray(predsRaw)) {
    for (const p of predsRaw) {
      const pr = asRecord(p);
      if (!pr) continue;
      const fixtureId = asNumber(pr.fixtureId) ?? asNumber(pr.fixtureID);
      if (fixtureId == null) continue;
      const prediction = parsePredictionPayload(pr.prediction) ?? parsePredictionPayload(pr);
      if (prediction) predictionsByFixtureId.set(fixtureId, prediction);
    }
  }

  const leaguePerformance: Record<string, number> = {};
  const lp = asRecord(o.leaguePerformance);
  if (lp) {
    for (const [k, v] of Object.entries(lp)) {
      const n = asNumber(v);
      if (n != null) leaguePerformance[k] = n;
    }
  }

  const date = asString(o.date) ?? '';
  if (!fixtures.length && !predictionsByFixtureId.size) {
    // Empty node is still a valid "no fixtures yet" selection if date exists; treat missing payload as null.
    if (!date && raw == null) return null;
  }

  return {
    date,
    fixtures,
    predictionsByFixtureId,
    leaguePerformance,
  };
}

export function isBestPerformingLeague(
  fixture: StatStrikeFixture,
  leaguePerformance: Record<string, number>,
  threshold = 70,
): boolean {
  const key = leaguePerformanceLookupKey(fixture.league.country, fixture.league.name);
  const rate = leaguePerformance[key];
  if (rate != null && rate >= threshold) return true;
  // Fallback: some uploads use league name only
  const byName = leaguePerformance[fixture.league.name];
  return byName != null && byName >= threshold;
}

export const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'P', 'LIVE', 'BT', 'INT']);
export const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN', 'PST', 'CANC', 'SUSP', 'ABD', 'AWD', 'WO']);

export function isLiveStatus(status: string | null | undefined): boolean {
  return LIVE_STATUSES.has(status ?? '');
}

export function isFinishedStatus(status: string | null | undefined): boolean {
  return FINISHED_STATUSES.has(status ?? '');
}
