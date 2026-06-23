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
  /** Shown when RTDB slice not uploaded yet (Phase 2 Mac). */
  comingSoon?: boolean;
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
    {
      id: 'awayVenue',
      label: `@${awayTeam}`,
      matches: [],
      comingSoon: true,
    },
  ];
}

export function teamFormPickerOptions(
  context: FixtureContextExport,
  side: 'home' | 'away',
): MatchHistoryPickerOption<TeamFormFilter>[] {
  const homeSlices = {
    all: [] as WebMatchRow[],
    home: context.homeLast6,
    away: [] as WebMatchRow[],
  };
  const awaySlices = {
    all: [] as WebMatchRow[],
    home: [] as WebMatchRow[],
    away: context.awayLast6,
  };
  const slices = side === 'home' ? homeSlices : awaySlices;
  const defaultFilter: TeamFormFilter = side === 'home' ? 'home' : 'away';

  return (['all', 'home', 'away'] as const).map((id) => ({
    id,
    label: id === 'all' ? 'All' : id === 'home' ? 'Home' : 'Away',
    matches: slices[id],
    comingSoon: slices[id].length === 0 && id !== defaultFilter,
  }));
}

export function defaultH2hFilter(): H2hFilter {
  return 'all';
}

export function defaultTeamFormFilter(side: 'home' | 'away'): TeamFormFilter {
  return side === 'home' ? 'home' : 'away';
}
