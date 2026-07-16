'use client';

import type { StatStrikeBoardRow } from '@/lib/statstrike/models';
import { formatKickoffLocal, scoreLabel } from '@/lib/statstrike/board-merge';
import { isLiveStatus } from '@/lib/statstrike/parse-selection';

type Props = {
  row: StatStrikeBoardRow;
  compact?: boolean;
};

export function StatStrikeFixtureRow({ row, compact = false }: Props) {
  const { fixture, prediction, bestPerformingLeague, fromYesterday } = row;
  const live = isLiveStatus(fixture.status);
  const score = scoreLabel(fixture);
  const band = prediction?.recommendedLevel || prediction?.level || '—';
  const leagueLabel = [fixture.league.country, fixture.league.name].filter(Boolean).join(' · ');

  return (
    <li
      className={
        compact
          ? 'border-b border-black/5 px-3 py-2.5 last:border-b-0'
          : 'rounded-xl border border-black/10 bg-white/80 px-3 py-3 shadow-sm'
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-black/45 truncate">
            {leagueLabel || 'League'}
            {bestPerformingLeague ? ' · Best performing' : ''}
            {fromYesterday ? ' · Carry-over' : ''}
          </p>
          <p className={`mt-0.5 font-semibold text-black/90 leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
            {fixture.homeTeam.name}{' '}
            <span className="font-normal text-black/40">v</span> {fixture.awayTeam.name}
          </p>
          <p className="mt-1 text-xs tabular-nums text-black/50">
            {formatKickoffLocal(fixture.kickoffMs)}
            {live ? (
              <span className="ml-2 font-semibold text-emerald-700">
                LIVE{fixture.elapsed != null ? ` ${fixture.elapsed}'` : ''}
              </span>
            ) : fixture.status && fixture.status !== 'NS' ? (
              <span className="ml-2 text-black/40">{fixture.status}</span>
            ) : null}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {score ? (
            <p className="text-sm font-bold tabular-nums text-black/90">{score}</p>
          ) : null}
          <p className="mt-1 inline-flex max-w-[9.5rem] rounded-md bg-[#0b3d5c]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#0b3d5c] leading-tight">
            {band}
          </p>
          {prediction && prediction.matchedCriteria > 0 ? (
            <p className="mt-1 text-[10px] tabular-nums text-black/40">
              {prediction.matchedCriteria}/{prediction.totalCriteria || 11}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
