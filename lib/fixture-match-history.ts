/**
 * Match history tables for fixture detail — H2H and team form slices from fixtureContexts.
 */

import {
  matchSampleDateSpan,
  type FixtureContextExport,
  type WebMatchRow,
} from '@/lib/fixture-key-signals';

export type H2hFilter = 'all' | 'homeVenue' | 'awayVenue';
export type TeamFormFilter = 'all' | 'home' | 'away';

export type MatchHistoryPickerOption<T extends string> = {
  id: T;
  label: string;
  matches: WebMatchRow[];
};

export type TeamMatchOutcome = 'w' | 'd' | 'l';

/** Display ddMMyy as dd.MM.yyyy (e.g. 200226 → 20.02.2026). */
export function formatCompactMatchDate(compact: string): string {
  const m = compact.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (!m) return compact;
  return `${m[1]}.${m[2]}.20${m[3]}`;
}

/** Month header from ddMMyy (e.g. 02.2026). */
export function monthYearLabelFromCompact(compact: string): string | null {
  const m = compact.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (!m) return null;
  return `${m[2]}.20${m[3]}`;
}

export type MatchMonthGroup = {
  monthKey: string;
  matches: WebMatchRow[];
};

export function groupMatchesByMonth(matches: WebMatchRow[]): MatchMonthGroup[] {
  const map = new Map<string, WebMatchRow[]>();
  for (const row of matches) {
    const key = monthYearLabelFromCompact(row.dateCompact) ?? 'unknown';
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return Array.from(map.entries()).map(([monthKey, group]) => ({ monthKey, matches: group }));
}

export function matchHistorySummary(matches: WebMatchRow[]): string | null {
  if (matches.length === 0) return null;
  const span = matchSampleDateSpan(matches);
  const count = `${matches.length} game${matches.length === 1 ? '' : 's'}`;
  return span ? `${count} · ${span}` : count;
}

export function subjectOutcome(row: WebMatchRow, subjectTeam: string): TeamMatchOutcome | null {
  const norm = subjectTeam.trim().toLowerCase();
  const isHome = row.homeTeam.trim().toLowerCase() === norm;
  const isAway = row.awayTeam.trim().toLowerCase() === norm;
  if (!isHome && !isAway) return null;
  const scored = isHome ? row.homeGoals : row.awayGoals;
  const conceded = isHome ? row.awayGoals : row.homeGoals;
  if (scored > conceded) return 'w';
  if (scored < conceded) return 'l';
  return 'd';
}

function normTeam(name: string): string {
  return name.trim().toLowerCase();
}

export function isFixtureTeam(name: string, fixtureTeam: string): boolean {
  return normTeam(name) === normTeam(fixtureTeam);
}

export function h2hPickerOptions(
  context: FixtureContextExport,
  homeTeam: string,
  awayTeam: string,
): MatchHistoryPickerOption<H2hFilter>[] {
  return [
    { id: 'all', label: 'All', matches: context.h2hLast6 },
    { id: 'homeVenue', label: `@${homeTeam}`, matches: context.h2hHomeVenueLast6 },
    { id: 'awayVenue', label: `@${awayTeam}`, matches: context.h2hAwayVenueLast6 },
  ];
}

export function teamFormPickerOptions(
  context: FixtureContextExport,
  side: 'home' | 'away',
): MatchHistoryPickerOption<TeamFormFilter>[] {
  const homeSlices = {
    all: context.homeAllLast6,
    home: context.homeLast6,
    away: context.homeAwayLast6,
  };
  const awaySlices = {
    all: context.awayAllLast6,
    home: context.awayHomeLast6,
    away: context.awayLast6,
  };
  const slices = side === 'home' ? homeSlices : awaySlices;

  return (['all', 'home', 'away'] as const).map((id) => ({
    id,
    label: id === 'all' ? 'All' : id === 'home' ? 'Home' : 'Away',
    matches: slices[id],
  }));
}

export function defaultH2hFilter(): H2hFilter {
  return 'all';
}

export function defaultTeamFormFilter(side: 'home' | 'away'): TeamFormFilter {
  return side === 'home' ? 'home' : 'away';
}

/** Pick first filter option that has rows (fallback when default slice missing on older uploads). */
export function resolveInitialFilter<T extends string>(
  options: MatchHistoryPickerOption<T>[],
  preferred: T,
): T {
  const preferredOption = options.find((o) => o.id === preferred);
  if (preferredOption && preferredOption.matches.length > 0) return preferred;
  const withData = options.find((o) => o.matches.length > 0);
  return withData?.id ?? preferred;
}

export function contextHasMatchHistory(context: FixtureContextExport): boolean {
  return (
    context.h2hLast6.length > 0 ||
    context.h2hHomeVenueLast6.length > 0 ||
    context.h2hAwayVenueLast6.length > 0 ||
    context.homeLast6.length > 0 ||
    context.homeAwayLast6.length > 0 ||
    context.homeAllLast6.length > 0 ||
    context.awayLast6.length > 0 ||
    context.awayHomeLast6.length > 0 ||
    context.awayAllLast6.length > 0
  );
}
