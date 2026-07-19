import { isResultFinishedStatus } from '@/lib/statstrike/correctness';
import type { StatStrikeBoardRow } from '@/lib/statstrike/models';
import { isLiveStatus } from '@/lib/statstrike/parse-selection';
import { scoreLabel } from '@/lib/statstrike/board-merge';
import type { FixtureListItem } from '@/lib/fixtures-browser';

export const HOMEPAGE_FORECAST_PREVIEW_LIMIT = 3;

function byKickoffAsc(a: StatStrikeBoardRow, b: StatStrikeBoardRow): number {
  if (a.fixture.kickoffMs !== b.fixture.kickoffMs) {
    return a.fixture.kickoffMs - b.fixture.kickoffMs;
  }
  return a.fixture.id - b.fixture.id;
}

function byKickoffDesc(a: StatStrikeBoardRow, b: StatStrikeBoardRow): number {
  return byKickoffAsc(b, a);
}

function isUpcomingNotStarted(row: StatStrikeBoardRow, nowMs: number): boolean {
  const status = row.fixture.status ?? 'NS';
  if (isLiveStatus(status) || isResultFinishedStatus(status)) return false;
  // Only true not-started / scheduled — skip cancelled etc.
  if (status !== 'NS' && status !== '' && status != null && status !== 'TBD') {
    return false;
  }
  return row.fixture.kickoffMs >= nowMs - 3 * 3_600_000;
}

/**
 * Homepage “Today’s forecasts” mix:
 * 1. Up to `limit` live fixtures (earliest kickoff first)
 * 2. Fill with most recent FT/AET/PEN results
 * 3. If still short, next upcoming not-started tips
 *
 * Examples: 3 live; 0 live → 3 FT; 1 live → that live + 2 recent FT.
 */
export function pickHomepageForecastPreview(
  rows: StatStrikeBoardRow[],
  opts?: { limit?: number; nowMs?: number },
): StatStrikeBoardRow[] {
  const limit = opts?.limit ?? HOMEPAGE_FORECAST_PREVIEW_LIMIT;
  const nowMs = opts?.nowMs ?? Date.now();
  if (limit <= 0 || rows.length === 0) return [];

  const live = rows.filter((r) => isLiveStatus(r.fixture.status)).sort(byKickoffAsc);
  const finished = rows
    .filter((r) => isResultFinishedStatus(r.fixture.status))
    .sort(byKickoffDesc);
  const upcoming = rows.filter((r) => isUpcomingNotStarted(r, nowMs)).sort(byKickoffAsc);

  const out: StatStrikeBoardRow[] = [];
  const seen = new Set<number>();

  const push = (list: StatStrikeBoardRow[]) => {
    for (const row of list) {
      if (out.length >= limit) break;
      if (seen.has(row.fixture.id)) continue;
      seen.add(row.fixture.id);
      out.push(row);
    }
  };

  push(live);
  push(finished);
  push(upcoming);
  return out;
}

/** Adapt a board row for {@link GoalLabV2FixtureCard}. */
export function boardRowToFixtureListItem(row: StatStrikeBoardRow): FixtureListItem {
  const { fixture, prediction } = row;
  const country = fixture.league.country?.trim() || null;
  const league = fixture.league.name?.trim() || null;
  const leagueKey =
    country && league ? `${country} · ${league}` : league || country || 'Other';
  const band = prediction?.recommendedLevel || prediction?.level || null;
  const score = scoreLabel(fixture);

  return {
    fixtureId: fixture.id,
    home: fixture.homeTeam.name,
    away: fixture.awayTeam.name,
    leagueKey,
    country,
    league,
    kickoffMs: fixture.kickoffMs,
    scoreDisplay: score ?? '–',
    pick: {
      id: fixture.id,
      fixtureId: fixture.id,
      homeTeam: fixture.homeTeam.name,
      awayTeam: fixture.awayTeam.name,
      country: country ?? undefined,
      league: league ?? undefined,
      status: fixture.status ?? undefined,
      homeScore: fixture.homeScore ?? undefined,
      awayScore: fixture.awayScore ?? undefined,
      // GoalLab cards read band via recommendedBandLabelForPick (predictedBand / forecastType).
      predictedBand: band ?? undefined,
      forecastType: band ?? undefined,
      recommendedLevel: band ?? undefined,
      level: band ?? undefined,
      bookmakerOdds: prediction?.bookmakerOdds ?? undefined,
      significantStats: prediction?.significantStats,
    },
  };
}

export function statStrikeFixtureHref(fixtureId: number, selectionDateKey: string): string {
  return `/statstrike/fixture/${fixtureId}?date=${encodeURIComponent(selectionDateKey)}`;
}
