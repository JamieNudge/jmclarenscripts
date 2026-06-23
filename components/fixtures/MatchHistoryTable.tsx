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

function TeamCell({ name, emphasize }: { name: string; emphasize: boolean }) {
  return (
    <span className={emphasize ? 'font-semibold text-white' : 'text-white/88'}>
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
}: {
  matches: WebMatchRow[];
  fixtureHome: string;
  fixtureAway: string;
  /** When set, show W/D/L indicator for this team per row. */
  subjectTeam?: string;
}) {
  if (matches.length === 0) {
    return <p className="text-sm text-white/65 py-2">No games in this sample.</p>;
  }

  const groups = groupMatchesByMonth(matches);

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full min-w-[520px] text-sm border-collapse">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wide text-white/55 border-b border-white/10">
            <th className="pb-2 pr-3 font-semibold w-[88px]">Date</th>
            <th className="pb-2 pr-3 font-semibold w-[72px]">League</th>
            <th className="pb-2 pr-3 font-semibold">Home</th>
            <th className="pb-2 pr-2 font-semibold w-[52px] text-center">Score</th>
            <th className="pb-2 pr-2 font-semibold">Away</th>
            {subjectTeam ? <th className="pb-2 w-8" aria-label="Result" /> : null}
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
}: {
  monthKey: string;
  matches: WebMatchRow[];
  fixtureHome: string;
  fixtureAway: string;
  subjectTeam?: string;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={subjectTeam ? 6 : 5}
          className="pt-3 pb-1 text-[11px] font-semibold text-white/50 tabular-nums"
        >
          {monthKey}
        </td>
      </tr>
      {matches.map((row) => {
        const outcome = subjectTeam ? subjectOutcome(row, subjectTeam) : null;
        const rowKey = `${row.dateCompact}-${row.homeTeam}-${row.awayTeam}-${row.homeGoals}-${row.awayGoals}`;
        return (
          <tr key={rowKey} className="border-b border-white/[0.06] last:border-0">
            <td className="py-2 pr-3 tabular-nums text-white/85 whitespace-nowrap">
              {formatCompactMatchDate(row.dateCompact)}
            </td>
            <td className="py-2 pr-3 text-xs text-white/75 whitespace-nowrap">{row.leagueCode}</td>
            <td className="py-2 pr-3 min-w-0">
              <TeamCell name={row.homeTeam} emphasize={isFixtureTeam(row.homeTeam, fixtureHome)} />
            </td>
            <td className="py-2 pr-2 text-center">
              <ScoreCell row={row} fixtureHome={fixtureHome} fixtureAway={fixtureAway} />
            </td>
            <td className="py-2 pr-2 min-w-0">
              <TeamCell name={row.awayTeam} emphasize={isFixtureTeam(row.awayTeam, fixtureAway)} />
            </td>
            {subjectTeam ? (
              <td className="py-2 text-center">
                {outcome ? (
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-sm ${outcomeStyles(outcome)}`}
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
