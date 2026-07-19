import { leaguePerformanceLookupKey } from '@/lib/best-picks-firebase';
import { parseGoalBandCascade } from '@/lib/statstrike/goal-band-cascade';
import type {
  StatStrikeDailySelection,
  StatStrikeFixture,
  StatStrikeFixtureStatsSummary,
  StatStrikeLeague,
  StatStrikeLeagueTrackRecord,
  StatStrikePrediction,
  StatStrikeTeam,
} from '@/lib/statstrike/models';
import {
  resolvedDisplayKeySignals,
  trackRecordDisplayForFixture,
} from '@/lib/statstrike/display-signals';

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

/** RTDB / Swift ISO8601 string, epoch ms, or epoch seconds. */
export function parseSelectionLastUpdatedMs(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Heuristic: seconds vs milliseconds.
    return value < 1e12 ? Math.round(value * 1000) : Math.round(value);
  }
  if (typeof value === 'string' && value.trim()) {
    const asNum = Number(value);
    if (Number.isFinite(asNum) && value.trim() !== '') {
      return asNum < 1e12 ? Math.round(asNum * 1000) : Math.round(asNum);
    }
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : null;
  }
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

function parseLeagueTrackRecordEntry(v: unknown): StatStrikeLeagueTrackRecord | null {
  const o = asRecord(v);
  if (!o) return null;
  const forecastCount = asNumber(o.forecastCount);
  const winRate = asNumber(o.winRate);
  if (forecastCount == null || winRate == null) return null;
  return {
    forecastCount,
    winRate,
    avgCriteria: asNumber(o.avgCriteria) ?? 0,
    isQualified: o.isQualified === true,
  };
}

function parseLeagueTrackRecordMap(raw: unknown): Record<string, StatStrikeLeagueTrackRecord> {
  const o = asRecord(raw);
  if (!o) return {};
  const out: Record<string, StatStrikeLeagueTrackRecord> = {};
  for (const [k, v] of Object.entries(o)) {
    const rec = parseLeagueTrackRecordEntry(v);
    if (rec) out[k] = rec;
  }
  return out;
}

function parseFixtureStatsSummary(row: Record<string, unknown>): StatStrikeFixtureStatsSummary {
  const n = (k: string) => asNumber(row[k]) ?? 0;
  return {
    h2hLast6Over25Percent: n('h2hLast6Over25Percent'),
    h2hHomeVenueLast6Over25Percent: n('h2hHomeVenueLast6Over25Percent'),
    bttsHomeVenueLast6Percent: n('bttsHomeVenueLast6Percent'),
    homeTeamLast6HomeOver25Percent: n('homeTeamLast6HomeOver25Percent'),
    awayTeamLast6AwayOver25Percent: n('awayTeamLast6AwayOver25Percent'),
    homeConcessionLast6HomePercent: n('homeConcessionLast6HomePercent'),
    awayConcessionLast6AwayPercent: n('awayConcessionLast6AwayPercent'),
    homeAvgGoalsLast6Home: n('homeAvgGoalsLast6Home'),
    awayAvgGoalsLast6Away: n('awayAvgGoalsLast6Away'),
    h2hHomeVenueAvgGoals: n('h2hHomeVenueAvgGoals'),
    h2hAllVenuesAvgGoals: n('h2hAllVenuesAvgGoals'),
  };
}

function parseStatsByFixtureId(raw: unknown): Map<number, StatStrikeFixtureStatsSummary> {
  const out = new Map<number, StatStrikeFixtureStatsSummary>();
  const rows: Record<string, unknown>[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const r = asRecord(item);
      if (r) rows.push(r);
    }
  } else {
    const o = asRecord(raw);
    if (o) {
      for (const v of Object.values(o)) {
        const r = asRecord(v);
        if (r) rows.push(r);
      }
    }
  }
  for (const r of rows) {
    const fixture = asRecord(r.fixture);
    const id = asNumber(fixture?.id) ?? asNumber(r.fixtureId) ?? asNumber(r.fixtureID);
    if (id == null) continue;
    out.set(id, parseFixtureStatsSummary(r));
  }
  return out;
}

export function enrichBoardRowDisplay(
  fixture: StatStrikeFixture,
  prediction: StatStrikePrediction | null,
  sel: StatStrikeDailySelection,
): {
  trackRecordDisplay: StatStrikeBoardRowTrackRecord | null;
  keySignalLines: string[];
} {
  const stats = sel.statsByFixtureId.get(fixture.id) ?? null;
  const tr = trackRecordDisplayForFixture(
    fixture,
    prediction,
    sel.leagueTrackRecord,
    sel.leagueBandTrackRecord,
  );
  return {
    trackRecordDisplay: tr
      ? {
          title: tr.title,
          helperText: tr.helperText,
          forecastCount: tr.trackRecord.forecastCount,
          winRate: tr.trackRecord.winRate,
          isQualified: tr.trackRecord.isQualified,
        }
      : null,
    keySignalLines: resolvedDisplayKeySignals(prediction, stats),
  };
}

export type StatStrikeBoardRowTrackRecord = {
  title: string;
  helperText: string | null;
  forecastCount: number;
  winRate: number;
  isQualified: boolean;
};

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

  const leagueTrackRecord = parseLeagueTrackRecordMap(o.leagueTrackRecord);
  const leagueBandTrackRecord = parseLeagueTrackRecordMap(o.leagueBandTrackRecord);
  const statsByFixtureId = parseStatsByFixtureId(o.stats);

  const date = asString(o.date) ?? '';
  if (!fixtures.length && !predictionsByFixtureId.size) {
    if (!date && raw == null) return null;
  }

  const versionRaw = o.version;
  const version =
    typeof versionRaw === 'string'
      ? asString(versionRaw)
      : typeof versionRaw === 'number' && Number.isFinite(versionRaw)
        ? String(versionRaw)
        : null;

  return {
    date,
    fixtures,
    predictionsByFixtureId,
    leaguePerformance,
    leagueTrackRecord,
    leagueBandTrackRecord,
    statsByFixtureId,
    lastUpdatedMs: parseSelectionLastUpdatedMs(o.lastUpdated),
    version,
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
