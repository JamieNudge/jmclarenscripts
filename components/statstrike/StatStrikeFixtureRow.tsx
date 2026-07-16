'use client';

import { useId, useState } from 'react';
import type { StatStrikeBoardRow } from '@/lib/statstrike/models';
import { formatKickoffLocal, scoreLabel } from '@/lib/statstrike/board-merge';
import { isResultFinishedStatus, predictionResultForFixture } from '@/lib/statstrike/correctness';
import { isLiveStatus } from '@/lib/statstrike/parse-selection';

type Props = {
  row: StatStrikeBoardRow;
  compact?: boolean;
};

export function StatStrikeFixtureRow({ row, compact = false }: Props) {
  const { fixture, prediction, bestPerformingLeague, fromYesterday } = row;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const live = isLiveStatus(fixture.status);
  const finished = isResultFinishedStatus(fixture.status);
  const won = predictionResultForFixture(fixture, prediction);
  const score = scoreLabel(fixture);
  const band = prediction?.recommendedLevel || prediction?.level || '—';
  const leagueLabel = [fixture.league.country, fixture.league.name].filter(Boolean).join(' · ');
  const confidencePct =
    prediction && prediction.totalCriteria > 0
      ? Math.round((prediction.matchedCriteria / prediction.totalCriteria) * 100)
      : null;

  return (
    <li
      className={
        compact
          ? 'border-b border-black/5 last:border-b-0'
          : 'rounded-xl border border-black/10 bg-white/80 shadow-sm'
      }
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-start justify-between gap-2 text-left transition-colors hover:bg-black/[0.03] ${
          compact ? 'px-3 py-2' : 'px-3 py-3'
        }`}
      >
        <div className="min-w-0 flex-1">
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
            ) : fixture.status && fixture.status !== 'NS' && !finished ? (
              <span className="ml-2 text-black/40">{fixture.status}</span>
            ) : null}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {score ? (
            <p className="text-sm font-bold tabular-nums text-black/90">{score}</p>
          ) : null}
          {finished ? (
            <p
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black tracking-wide ${
                won === true ? 'bg-amber-300 text-black' : 'bg-black/25 text-white'
              }`}
            >
              {won === true ? 'WIN' : 'FT'}
            </p>
          ) : null}
          <p className="mt-1 inline-flex max-w-[9.5rem] rounded-md bg-[#0b3d5c]/10 px-1.5 py-0.5 text-[11px] font-semibold text-[#0b3d5c] leading-tight">
            {band}
          </p>
          <p className="mt-1.5 text-[10px] font-semibold text-[#0b3d5c]/70">
            {open ? 'Hide detail ▴' : 'Detail ▾'}
          </p>
        </div>
      </button>

      {open ? (
        <div
          id={panelId}
          className={`border-t border-black/5 bg-black/[0.02] ${compact ? 'px-3 py-2.5' : 'px-3 py-3'}`}
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs text-black/70">
            <dt className="font-semibold text-black/45">Forecast</dt>
            <dd>{band}</dd>
            {finished ? (
              <>
                <dt className="font-semibold text-black/45">Result</dt>
                <dd>{won === true ? 'WIN' : won === false ? 'FT' : fixture.status}</dd>
              </>
            ) : null}
            {prediction?.recommendedLevel && prediction.recommendedLevel !== prediction.level ? (
              <>
                <dt className="font-semibold text-black/45">Primary</dt>
                <dd>{prediction.level}</dd>
              </>
            ) : null}
            {confidencePct != null ? (
              <>
                <dt className="font-semibold text-black/45">Criteria</dt>
                <dd className="tabular-nums">
                  {prediction!.matchedCriteria}/{prediction!.totalCriteria} ({confidencePct}%)
                </dd>
              </>
            ) : null}
            {prediction?.bookmakerOdds != null ? (
              <>
                <dt className="font-semibold text-black/45">Odds</dt>
                <dd className="tabular-nums">{prediction.bookmakerOdds.toFixed(2)}</dd>
              </>
            ) : null}
            {prediction?.sourceLabel ? (
              <>
                <dt className="font-semibold text-black/45">Source</dt>
                <dd>{prediction.sourceLabel}</dd>
              </>
            ) : null}
            {fixture.venue ? (
              <>
                <dt className="font-semibold text-black/45">Venue</dt>
                <dd>{fixture.venue}</dd>
              </>
            ) : null}
            <dt className="font-semibold text-black/45">Status</dt>
            <dd className="tabular-nums">
              {fixture.status ?? 'NS'}
              {live && fixture.elapsed != null ? ` · ${fixture.elapsed}'` : ''}
              {score ? ` · ${score}` : ''}
            </dd>
          </dl>
          {prediction?.significantStats && prediction.significantStats.length > 0 ? (
            <div className="mt-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/45">
                Key signals
              </p>
              <ul className="mt-1 space-y-1">
                {prediction.significantStats.slice(0, compact ? 4 : 8).map((stat) => (
                  <li key={stat} className="text-xs leading-snug text-black/70">
                    · {stat}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-2 text-xs text-black/45">No key signals uploaded for this pick.</p>
          )}
        </div>
      ) : null}
    </li>
  );
}
