/**
 * Side-by-side form compare stats for fixture detail (Futbol24-style manual check).
 * Derived from home/away venue form slices in fixtureContexts.
 */

import { isFixtureTeam } from '@/lib/fixture-match-history';
import type { WebMatchRow } from '@/lib/fixture-key-signals';

export type TeamFormCompareStats = {
  matches: number;
  goalsScored: number;
  goalsConceded: number;
  goalsScoredPerGame: number;
  goalsConcededPerGame: number;
  cleanSheets: number;
  over25Games: number;
  bttsGames: number;
};

export type FormCompareRow = {
  id: string;
  label: string;
  homeValue: number;
  awayValue: number;
  format: 'int' | 'decimal';
};

function teamGoalsInRow(row: WebMatchRow, teamName: string): { scored: number; conceded: number } | null {
  if (isFixtureTeam(row.homeTeam, teamName)) {
    return { scored: row.homeGoals, conceded: row.awayGoals };
  }
  if (isFixtureTeam(row.awayTeam, teamName)) {
    return { scored: row.awayGoals, conceded: row.homeGoals };
  }
  return null;
}

/** Aggregate scored/conceded for a team across their form sample rows. */
export function teamFormCompareStats(matches: WebMatchRow[], teamName: string): TeamFormCompareStats {
  let goalsScored = 0;
  let goalsConceded = 0;
  let cleanSheets = 0;
  let over25Games = 0;
  let bttsGames = 0;
  let counted = 0;

  for (const row of matches) {
    const goals = teamGoalsInRow(row, teamName);
    if (!goals) continue;
    counted += 1;
    goalsScored += goals.scored;
    goalsConceded += goals.conceded;
    if (goals.conceded === 0) cleanSheets += 1;
    if (row.homeGoals + row.awayGoals > 2) over25Games += 1;
    if (row.homeGoals > 0 && row.awayGoals > 0) bttsGames += 1;
  }

  const matchesN = counted;
  const goalsScoredPerGame = matchesN > 0 ? goalsScored / matchesN : 0;
  const goalsConcededPerGame = matchesN > 0 ? goalsConceded / matchesN : 0;

  return {
    matches: matchesN,
    goalsScored,
    goalsConceded,
    goalsScoredPerGame,
    goalsConcededPerGame,
    cleanSheets,
    over25Games,
    bttsGames,
  };
}

export function buildFormCompareRows(home: TeamFormCompareStats, away: TeamFormCompareStats): FormCompareRow[] {
  return [
    { id: 'matches', label: 'Matches', homeValue: home.matches, awayValue: away.matches, format: 'int' },
    { id: 'scored', label: 'Goals scored', homeValue: home.goalsScored, awayValue: away.goalsScored, format: 'int' },
    { id: 'conceded', label: 'Goals conceded', homeValue: home.goalsConceded, awayValue: away.goalsConceded, format: 'int' },
    {
      id: 'scored-pg',
      label: 'Scored per game',
      homeValue: home.goalsScoredPerGame,
      awayValue: away.goalsScoredPerGame,
      format: 'decimal',
    },
    {
      id: 'conceded-pg',
      label: 'Conceded per game',
      homeValue: home.goalsConcededPerGame,
      awayValue: away.goalsConcededPerGame,
      format: 'decimal',
    },
    { id: 'clean', label: 'Clean sheets', homeValue: home.cleanSheets, awayValue: away.cleanSheets, format: 'int' },
    { id: 'o25', label: 'Over 2.5 games', homeValue: home.over25Games, awayValue: away.over25Games, format: 'int' },
    { id: 'btts', label: 'BTTS games', homeValue: home.bttsGames, awayValue: away.bttsGames, format: 'int' },
  ];
}

export function formatCompareValue(value: number, format: 'int' | 'decimal'): string {
  if (format === 'int') return String(Math.round(value));
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') || '0';
}
