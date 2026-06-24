'use client';

import {
  formatCompactMatchDate,
  groupMatchesByMonth,
  isFixtureTeam,
  subjectOutcome,
  type TeamMatchOutcome,
} from '@/lib/fixture-match-history';
import type { WebMatchRow } from '@/lib/fixture-key-signals';

function outcomeStyles(outcome: TeamMatchOutcome): string {
  if (outcome === 'w') return 'bg-emerald-500/85';
  if (outcome === 'l') return 'bg-red-500/85';
  return 'bg-white/35';
}

function TeamCell({ name, emphasize, compact }: { name: string; emphasize: boolean; compact?: boolean }) {
  return (
    <span
      className={`block truncate ${emphasize ? 'font-semibold text-white' : 'text-white/88'}`}
      title={compact ? name : undefined}
    >
      {name}
    </span>
  );
}

function ScoreCell({
  row,
  fixtureHome,
  fixtureAway,
}: {
  row: WebMatchRow;
  fixtureHome: string;
  fixtureAway: string;
}) {
  const homeWins = row.homeGoals > row.awayGoals;
  const awayWins = row.awayGoals > row.homeGoals;
  const homeBold = homeWins || (!homeWins && !awayWins && isFixtureTeam(row.homeTeam, fixtureHome));
  const awayBold = awayWins || (!homeWins && !awayWins && isFixtureTeam(row.awayTeam, fixtureAway));

  return (
    <span className="tabular-nums whitespace-nowrap">
      <span className={homeBold ? 'font-bold text-white' : 'text-white/90'}>{row.homeGoals}</span>
      <span className="text-white/70 mx-0.5">-</span>
      <span className={awayBold ? 'font-bold text-white' : 'text-white/90'}>{row.awayGoals}</span>
    </span>
  );
}

export function MatchHistoryTable({
  matches,
  fixtureHome,
  fixtureAway,
  subjectTeam,
  density = 'default',
}: {
  matches: WebMatchRow[];
  fixtureHome: string;
  fixtureAway: string;
  /** When set, show W/D/L indicator for this team per row. */
  subjectTeam?: string;
  density?: 'default' | 'compact';
}) {
  if (matches.length === 0) {
    return <p className={`text-white/65 py-2 ${density === 'compact' ? 'text-xs' : 'text-sm'}`}>No games in this sample.</p>;
  }

  const groups = groupMatchesByMonth(matches);
  const compact = density === 'compact';

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table
        className={`w-full border-collapse ${compact ? 'min-w-0 table-fixed text-xs' : 'min-w-[520px] text-sm'}`}
      >
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wide text-white/55 border-b border-white/10">
            <th className={`pb-2 pr-2 font-semibold ${compact ? 'w-[72px]' : 'w-[88px] pr-3'}`}>Date</th>
            <th className={`pb-2 pr-2 font-semibold ${compact ? 'w-[44px]' : 'w-[72px] pr-3'}`}>League</th>
            <th className={`pb-2 pr-2 font-semibold ${compact ? 'w-[28%]' : ''}`}>Home</th>
            <th className={`pb-2 pr-1 font-semibold text-center ${compact ? 'w-[44px]' : 'w-[52px] pr-2'}`}>Score</th>
            <th className={`pb-2 pr-1 font-semibold ${compact ? 'w-[28%]' : 'pr-2'}`}>Away</th>
            {subjectTeam ? <th className={`pb-2 ${compact ? 'w-6' : 'w-8'}`} aria-label="Result" /> : null}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <MonthGroupRows
              key={group.monthKey}
              monthKey={group.monthKey}
              matches={group.matches}
              fixtureHome={fixtureHome}
              fixtureAway={fixtureAway}
              subjectTeam={subjectTeam}
              compact={compact}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthGroupRows({
  monthKey,
  matches,
  fixtureHome,
  fixtureAway,
  subjectTeam,
  compact = false,
}: {
  monthKey: string;
  matches: WebMatchRow[];
  fixtureHome: string;
  fixtureAway: string;
  subjectTeam?: string;
  compact?: boolean;
}) {
  const cellPy = compact ? 'py-1.5' : 'py-2';

  return (
    <>
      <tr>
        <td
          colSpan={subjectTeam ? 6 : 5}
          className={`pt-2 pb-0.5 text-[10px] font-semibold text-white/50 tabular-nums ${compact ? '' : 'pt-3 pb-1 text-[11px]'}`}
        >
          {monthKey}
        </td>
      </tr>
      {matches.map((row) => {
        const outcome = subjectTeam ? subjectOutcome(row, subjectTeam) : null;
        const rowKey = `${row.dateCompact}-${row.homeTeam}-${row.awayTeam}-${row.homeGoals}-${row.awayGoals}`;
        return (
          <tr key={rowKey} className="border-b border-white/[0.06] last:border-0">
            <td className={`${cellPy} pr-2 tabular-nums text-white/85 whitespace-nowrap`}>
              {formatCompactMatchDate(row.dateCompact)}
            </td>
            <td className={`${cellPy} pr-2 text-white/75 whitespace-nowrap truncate`} title={row.leagueCode}>
              {row.leagueCode}
            </td>
            <td className={`${cellPy} pr-2 min-w-0`}>
              <TeamCell
                name={row.homeTeam}
                emphasize={isFixtureTeam(row.homeTeam, fixtureHome)}
                compact={compact}
              />
            </td>
            <td className={`${cellPy} pr-1 text-center`}>
              <ScoreCell row={row} fixtureHome={fixtureHome} fixtureAway={fixtureAway} />
            </td>
            <td className={`${cellPy} pr-1 min-w-0`}>
              <TeamCell
                name={row.awayTeam}
                emphasize={isFixtureTeam(row.awayTeam, fixtureAway)}
                compact={compact}
              />
            </td>
            {subjectTeam ? (
              <td className={`${cellPy} text-center`}>
                {outcome ? (
                  <span
                    className={`inline-block rounded-sm ${outcomeStyles(outcome)} ${compact ? 'h-2 w-2' : 'h-2.5 w-2.5'}`}
                    title={outcome === 'w' ? 'Win' : outcome === 'l' ? 'Loss' : 'Draw'}
                    aria-label={outcome === 'w' ? 'Win' : outcome === 'l' ? 'Loss' : 'Draw'}
                  />
                ) : null}
              </td>
            ) : null}
          </tr>
        );
      })}
    </>
  );
}
