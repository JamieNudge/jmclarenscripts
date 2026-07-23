import { isWinningForecast, predictionResultForFixture } from '@/lib/statstrike/correctness';
import type { StatStrikeDailySelection, StatStrikePredictionLevel } from '@/lib/statstrike/models';
import {
  predictionFromBTTSPick,
  type BTTSSelectionPick,
} from '@/lib/statstrike/btts-selections';
import { isBestPerformingLeague } from '@/lib/statstrike/parse-selection';

/** Settled or pending app-level track row derived from a selections day. */
export type StatStrikeTrackRecord = {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  country: string;
  kickoffMs: number;
  tipBand: StatStrikePredictionLevel;
  homeScore: number | null;
  awayScore: number | null;
  /** null when not finished / unscorable. */
  isCorrect: boolean | null;
  bestPerformingLeague: boolean;
  hasGoalBandCascade: boolean;
  decimalOdds: number | null;
  selectionDateKey: string;
};

export type BestPerformingSevenDayDigest = {
  windowDays: number;
  completedCount: number;
  correctCount: number;
  hitRatePercent: number;
  oddsPickCount: number;
  flatStakeROIPercent: number | null;
  bestLeagueTitle: string | null;
  bestLeagueHitRatePercent: number | null;
  bestLeagueSampleSize: number | null;
  bestBandTitle: string | null;
  bestBandHitRatePercent: number | null;
  bestBandSampleSize: number | null;
};

export type GoalBandCascadeSuccessRate = {
  correct: number;
  total: number;
  percentage: number;
};

export type GoalBandCascadeOverGoalsRate = {
  level: 'Over 2.5' | 'Over 3.5' | 'Over 4.5';
  minGoals: number;
  hits: number;
  total: number;
  percentage: number;
};

function startOfLocalDayMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Build track rows from one daily selection (predicted fixtures only). */
export function recordsFromSelection(
  sel: StatStrikeDailySelection,
  dateKey: string,
): StatStrikeTrackRecord[] {
  const out: StatStrikeTrackRecord[] = [];
  const lp = sel.leaguePerformance ?? {};

  for (const fixture of sel.fixtures) {
    const prediction = sel.predictionsByFixtureId.get(fixture.id);
    if (!prediction || prediction.matchedCriteria <= 0) continue;

    const tipBand = prediction.recommendedLevel || prediction.level;
    const isCorrect = predictionResultForFixture(fixture, prediction);

    out.push({
      fixtureId: fixture.id,
      homeTeam: fixture.homeTeam.name,
      awayTeam: fixture.awayTeam.name,
      league: fixture.league.name,
      country: fixture.league.country,
      kickoffMs: fixture.kickoffMs,
      tipBand,
      homeScore: fixture.homeScore ?? null,
      awayScore: fixture.awayScore ?? null,
      isCorrect,
      bestPerformingLeague: isBestPerformingLeague(fixture, lp),
      hasGoalBandCascade: prediction.goalBandCascade != null,
      decimalOdds: prediction.bookmakerOdds ?? null,
      selectionDateKey: dateKey,
    });
  }

  return out;
}

/**
 * BTTS track rows joined to the same-day selection fixture (scores + league).
 * Skips picks whose fixture is not on that day's `/selections` board (iOS parity).
 */
export function recordsFromBTTSSelections(
  picks: Map<number, BTTSSelectionPick> | BTTSSelectionPick[],
  sel: StatStrikeDailySelection | null,
  dateKey: string,
): StatStrikeTrackRecord[] {
  if (!sel) return [];
  const pickList = picks instanceof Map ? Array.from(picks.values()) : picks;
  const out: StatStrikeTrackRecord[] = [];
  const lp = sel.leaguePerformance ?? {};
  const fixtureById = new Map(sel.fixtures.map((f) => [f.id, f]));

  for (const pick of pickList) {
    const fixture = fixtureById.get(pick.fixtureId);
    if (!fixture) continue;
    const prediction = predictionFromBTTSPick(pick);
    const isCorrect = predictionResultForFixture(fixture, prediction);
    out.push({
      fixtureId: fixture.id,
      homeTeam: fixture.homeTeam.name,
      awayTeam: fixture.awayTeam.name,
      league: fixture.league.name,
      country: fixture.league.country,
      kickoffMs: fixture.kickoffMs,
      tipBand: pick.level,
      homeScore: fixture.homeScore ?? null,
      awayScore: fixture.awayScore ?? null,
      isCorrect,
      bestPerformingLeague: isBestPerformingLeague(fixture, lp),
      hasGoalBandCascade: false,
      decimalOdds: null,
      selectionDateKey: dateKey,
    });
  }

  return out;
}

/**
 * Rolling 7-day proof digest for Best Performing picks (iOS BestPerformingDigest.make).
 * Uses fixture kickoff calendar day in local TZ for the window (browser).
 */
export function bestPerformingSevenDayDigest(
  records: StatStrikeTrackRecord[],
  now: Date = new Date(),
  windowDays = 7,
): BestPerformingSevenDayDigest | null {
  const endOfToday = startOfLocalDayMs(now);
  const windowStart = endOfToday - (windowDays - 1) * 86_400_000;

  const completed = records.filter((r) => {
    if (!r.bestPerformingLeague || r.isCorrect == null) return false;
    const day = startOfLocalDayMs(new Date(r.kickoffMs));
    return day >= windowStart && day <= endOfToday;
  });
  if (!completed.length) return null;

  const correctCount = completed.filter((r) => r.isCorrect === true).length;
  const hitRate = (correctCount / completed.length) * 100;

  const oddsRows = completed
    .map((r) => {
      if (r.decimalOdds == null || r.decimalOdds <= 1 || r.isCorrect == null) return null;
      return { won: r.isCorrect, odds: r.decimalOdds };
    })
    .filter((x): x is { won: boolean; odds: number } => x != null);

  let flatStakeROIPercent: number | null = null;
  if (oddsRows.length) {
    const profit = oddsRows.reduce((sum, row) => sum + (row.won ? row.odds - 1 : -1), 0);
    flatStakeROIPercent = (profit / oddsRows.length) * 100;
  }

  const leagueGroups = new Map<string, StatStrikeTrackRecord[]>();
  for (const r of completed) {
    const title = r.country.trim() ? `${r.country} · ${r.league}` : r.league;
    const list = leagueGroups.get(title) ?? [];
    list.push(r);
    leagueGroups.set(title, list);
  }

  const bestLeague = Array.from(leagueGroups.entries())
    .map(([title, rows]) => {
      if (rows.length < 2) return null;
      const wins = rows.filter((x) => x.isCorrect === true).length;
      return { title, hit: (wins / rows.length) * 100, count: rows.length };
    })
    .filter((x): x is { title: string; hit: number; count: number } => x != null)
    .sort((a, b) => (a.hit !== b.hit ? b.hit - a.hit : b.count - a.count))[0];

  const bandGroups = new Map<string, StatStrikeTrackRecord[]>();
  for (const r of completed) {
    const list = bandGroups.get(r.tipBand) ?? [];
    list.push(r);
    bandGroups.set(r.tipBand, list);
  }

  const bestBand = Array.from(bandGroups.entries())
    .map(([title, rows]) => {
      if (rows.length < 2) return null;
      const wins = rows.filter((x) => x.isCorrect === true).length;
      return { title, hit: (wins / rows.length) * 100, count: rows.length };
    })
    .filter((x): x is { title: string; hit: number; count: number } => x != null)
    .sort((a, b) => (a.hit !== b.hit ? b.hit - a.hit : b.count - a.count))[0];

  return {
    windowDays,
    completedCount: completed.length,
    correctCount,
    hitRatePercent: hitRate,
    oddsPickCount: oddsRows.length,
    flatStakeROIPercent,
    bestLeagueTitle: bestLeague?.title ?? null,
    bestLeagueHitRatePercent: bestLeague?.hit ?? null,
    bestLeagueSampleSize: bestLeague?.count ?? null,
    bestBandTitle: bestBand?.title ?? null,
    bestBandHitRatePercent: bestBand?.hit ?? null,
    bestBandSampleSize: bestBand?.count ?? null,
  };
}

export function bestPerformingDigestChipTitle(digest: BestPerformingSevenDayDigest): string {
  return `Best Performing last ${digest.windowDays} days : ${Math.round(digest.hitRatePercent)}% Win Rate`;
}

/** Settled GBC tips (consumer tip scored via isCorrect). */
export function goalBandCascadeSettledRecords(records: StatStrikeTrackRecord[]): StatStrikeTrackRecord[] {
  return records.filter(
    (r) => r.hasGoalBandCascade && r.isCorrect != null && r.homeScore != null && r.awayScore != null,
  );
}

export function goalBandCascadeSuccessRate(records: StatStrikeTrackRecord[]): GoalBandCascadeSuccessRate {
  const cohort = goalBandCascadeSettledRecords(records);
  if (!cohort.length) return { correct: 0, total: 0, percentage: 0 };
  const correct = cohort.filter((r) => r.isCorrect === true).length;
  return { correct, total: cohort.length, percentage: (correct / cohort.length) * 100 };
}

export function goalBandCascadeOverGoalsRates(
  records: StatStrikeTrackRecord[],
): GoalBandCascadeOverGoalsRate[] {
  const cohort = goalBandCascadeSettledRecords(records);
  const total = cohort.length;
  const levels: { level: GoalBandCascadeOverGoalsRate['level']; minGoals: number }[] = [
    { level: 'Over 2.5', minGoals: 3 },
    { level: 'Over 3.5', minGoals: 4 },
    { level: 'Over 4.5', minGoals: 5 },
  ];
  if (total === 0) {
    return levels.map((l) => ({ ...l, hits: 0, total: 0, percentage: 0 }));
  }
  return levels.map(({ level, minGoals }) => {
    const hits = cohort.filter((r) => (r.homeScore ?? 0) + (r.awayScore ?? 0) >= minGoals).length;
    return { level, minGoals, hits, total, percentage: (hits / total) * 100 };
  });
}

/** Re-settle a tip band against total goals (for personal store import). */
export function settleTipBand(
  tipBand: StatStrikePredictionLevel,
  homeScore: number | null,
  awayScore: number | null,
  finished: boolean,
): boolean | null {
  if (!finished || homeScore == null || awayScore == null) return null;
  return isWinningForecast(tipBand, homeScore, awayScore);
}
