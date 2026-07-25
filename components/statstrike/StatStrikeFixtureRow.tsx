'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import type { StatStrikeBoardRow } from '@/lib/statstrike/models';
import { formatKickoffLocal, scoreLabel } from '@/lib/statstrike/board-merge';
import { isResultFinishedStatus, predictionResultForFixture, bttsPredictionResultForFixture, marketResultBadgeLabel } from '@/lib/statstrike/correctness';
import { displayBandRows } from '@/lib/statstrike/goal-band-cascade';
import { isLiveStatus } from '@/lib/statstrike/parse-selection';

type Props = {
  row: StatStrikeBoardRow;
  compact?: boolean;
  starred?: boolean;
  /** Premium stub — star opens App Store gate until Stripe (or toggles when personal unlocked). */
  onStarClick?: () => void;
};

export function StatStrikeFixtureRow({ row, compact = false, starred = false, onStarClick }: Props) {
  const {
    fixture,
    prediction,
    bttsPrediction,
    bestPerformingLeague,
    fromYesterday,
    trackRecordDisplay,
    keySignalLines,
  } = row;
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const live = isLiveStatus(fixture.status);
  const finished = isResultFinishedStatus(fixture.status);
  const won = predictionResultForFixture(fixture, prediction);
  const bttsWon = bttsPredictionResultForFixture(fixture, bttsPrediction);
  const score = scoreLabel(fixture);
  const band = prediction?.recommendedLevel || prediction?.level || '—';
  const bttsBand = bttsPrediction?.recommendedLevel || bttsPrediction?.level || null;
  const cascade = prediction?.goalBandCascade ?? null;
  const cascadeRows = cascade ? displayBandRows(cascade) : [];
  const leagueLabel = [fixture.league.country, fixture.league.name].filter(Boolean).join(' · ');
  const confidencePct =
    prediction && prediction.totalCriteria > 0
      ? Math.round((prediction.matchedCriteria / prediction.totalCriteria) * 100)
      : null;
  const bttsConfidencePct =
    bttsPrediction && bttsPrediction.totalCriteria > 0
      ? Math.round((bttsPrediction.matchedCriteria / bttsPrediction.totalCriteria) * 100)
      : null;

  return (
    <li
      className={
        compact
          ? 'border-b border-black/5 last:border-b-0'
          : 'rounded-xl border border-black/10 bg-white/80 shadow-sm'
      }
    >
      <div
        className={`flex items-start gap-1 ${compact ? 'px-2 py-1' : 'px-2 py-2'}`}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className={`min-w-0 flex-1 flex items-start justify-between gap-2 text-left transition-colors hover:bg-black/[0.03] rounded-lg ${
            compact ? 'px-1 py-1' : 'px-1 py-1'
          }`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80 truncate">
              {leagueLabel || 'League'}
              {bestPerformingLeague ? ' · Best performing' : ''}
              {fromYesterday ? ' · Carry-over' : ''}
            </p>
            <p className={`mt-0.5 font-semibold text-black/90 leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
              {fixture.homeTeam.name}{' '}
              <span className="font-normal text-black/80">v</span> {fixture.awayTeam.name}
            </p>
            <p className="mt-1 text-xs tabular-nums text-black/70">
              {formatKickoffLocal(fixture.kickoffMs)}
            </p>
            <div className="mt-1.5 flex flex-col items-start gap-1">
              {cascade ? (
                <span
                  className="inline-flex max-w-full items-center rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-black leading-none tracking-wide text-white shadow-sm"
                  aria-label="Goal band cascade"
                >
                  Goal Band Cascade
                </span>
              ) : null}
              <span className="inline-flex max-w-full items-center rounded-full bg-sky-400 px-2 py-0.5 text-[10px] font-black leading-tight tracking-wide text-black shadow-sm">
                {band}
              </span>
              {bttsBand ? (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-lime-400 px-2 py-0.5 text-[10px] font-black leading-tight tracking-wide text-black shadow-sm">
                  <span>{bttsBand}</span>
                  {finished && bttsWon != null ? (
                    <span
                      className={`rounded-full px-1 py-px text-[9px] font-black tracking-wide ${
                        bttsWon ? 'bg-white text-black' : 'bg-black/25 text-white'
                      }`}
                    >
                      {bttsWon ? 'BTTS WIN' : 'BTTS FT'}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end text-right gap-1">
            {score ? (
              <p className="text-sm font-bold tabular-nums text-black/90">{score}</p>
            ) : null}
            {finished && prediction ? (
              <p
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black tracking-wide ${
                  won === true ? 'bg-amber-300 text-black' : 'bg-black/25 text-white'
                }`}
              >
                {marketResultBadgeLabel(band, won)}
              </p>
            ) : null}
            {finished && bttsBand ? (
              <p
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black tracking-wide ${
                  bttsWon === true ? 'bg-amber-300 text-black' : 'bg-black/25 text-white'
                }`}
              >
                {marketResultBadgeLabel(bttsBand, bttsWon, { bttsMarket: true })}
              </p>
            ) : null}
            {live ? (
              <span
                className="mt-1 inline-flex items-center rounded-full bg-[#0d9488] px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wide text-white"
                aria-label={
                  fixture.elapsed != null ? `Live ${fixture.elapsed} minutes` : 'Live'
                }
              >
                LIVE{fixture.elapsed != null ? ` ${fixture.elapsed}'` : ''}
              </span>
            ) : fixture.status && fixture.status !== 'NS' && !finished ? (
              <span className="mt-1 text-[10px] font-semibold text-black/80">{fixture.status}</span>
            ) : null}
            <p className="mt-1.5 text-[10px] font-semibold text-[#0b3d5c]/70">
              {open ? 'Hide detail ▴' : 'Detail ▾'}
            </p>
          </div>
        </button>
        {onStarClick && !compact ? (
          <button
            type="button"
            aria-label={starred ? 'Remove from Your Picks' : 'Add to Your Picks (Premium)'}
            aria-pressed={starred}
            className={`shrink-0 self-start rounded-lg px-2 py-1 text-base leading-none hover:bg-black/[0.04] ${
              starred ? 'text-amber-500' : 'text-black/75 hover:text-amber-500'
            }`}
            onClick={onStarClick}
          >
            {starred ? '★' : '☆'}
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          id={panelId}
          className={`border-t border-black/5 bg-black/[0.02] ${compact ? 'px-3 py-2.5' : 'px-3 py-3'}`}
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs text-black/70">
            <dt className="font-semibold text-black/80">Forecast</dt>
            <dd>{band}</dd>
            {finished ? (
              <>
                <dt className="font-semibold text-black/80">Result</dt>
                <dd>{won == null ? fixture.status : marketResultBadgeLabel(band, won)}</dd>
              </>
            ) : null}
            {bttsBand ? (
              <>
                <dt className="font-semibold text-black/80">BTTS</dt>
                <dd>
                  {bttsBand}
                  {finished && bttsWon != null
                    ? ` · ${marketResultBadgeLabel(bttsBand, bttsWon, { bttsMarket: true })}`
                    : ''}
                </dd>
              </>
            ) : null}
            {bttsConfidencePct != null ? (
              <>
                <dt className="font-semibold text-black/80">BTTS conf.</dt>
                <dd className="tabular-nums">
                  {bttsPrediction!.matchedCriteria}/{bttsPrediction!.totalCriteria} ({bttsConfidencePct}
                  %)
                </dd>
              </>
            ) : null}
            {prediction?.recommendedLevel && prediction.recommendedLevel !== prediction.level ? (
              <>
                <dt className="font-semibold text-black/80">Primary</dt>
                <dd>{prediction.level}</dd>
              </>
            ) : null}
            {confidencePct != null ? (
              <>
                <dt className="font-semibold text-black/80">Criteria</dt>
                <dd className="tabular-nums">
                  {prediction!.matchedCriteria}/{prediction!.totalCriteria} ({confidencePct}%)
                </dd>
              </>
            ) : null}
            {prediction?.bookmakerOdds != null ? (
              <>
                <dt className="font-semibold text-black/80">Odds</dt>
                <dd className="tabular-nums">{prediction.bookmakerOdds.toFixed(2)}</dd>
              </>
            ) : null}
            {prediction?.sourceLabel ? (
              <>
                <dt className="font-semibold text-black/80">Source</dt>
                <dd>{prediction.sourceLabel}</dd>
              </>
            ) : null}
            {fixture.venue ? (
              <>
                <dt className="font-semibold text-black/80">Venue</dt>
                <dd>{fixture.venue}</dd>
              </>
            ) : null}
            <dt className="font-semibold text-black/80">Status</dt>
            <dd className="tabular-nums">
              {fixture.status ?? 'NS'}
              {live && fixture.elapsed != null ? ` · ${fixture.elapsed}'` : ''}
              {score ? ` · ${score}` : ''}
            </dd>
          </dl>
          {cascadeRows.length > 0 ? (
            <div className="mt-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">
                Goal Band Cascade
              </p>
              <ul className="mt-1.5 space-y-1">
                {cascadeRows.map((bandRow) => (
                  <li
                    key={bandRow.bandKey}
                    className="flex items-center justify-between gap-2 text-xs text-black/80"
                  >
                    <span className="font-medium text-black/90">{bandRow.label}</span>
                    {bandRow.decimalOdds != null && bandRow.decimalOdds > 1 ? (
                      <span className="tabular-nums font-semibold text-black/70">
                        {bandRow.decimalOdds.toFixed(2)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {trackRecordDisplay ? (
            <div className="mt-2.5 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">
                {trackRecordDisplay.title}
              </p>
              <p className="text-xs tabular-nums text-black/75">
                {trackRecordDisplay.forecastCount} archived forecast
                {trackRecordDisplay.forecastCount === 1 ? '' : 's'}
              </p>
              <p className="text-xs tabular-nums text-black/75">
                {Math.round(trackRecordDisplay.winRate)}% recent performance
              </p>
              <p className="text-xs font-semibold text-black/85">
                {trackRecordDisplay.isQualified ? 'Qualified League ✓' : 'League tracked'}
              </p>
              {trackRecordDisplay.helperText ? (
                <p className="text-[11px] text-black/60">{trackRecordDisplay.helperText}</p>
              ) : null}
            </div>
          ) : null}
          {(keySignalLines && keySignalLines.length > 0) ||
          (prediction?.significantStats && prediction.significantStats.length > 0) ? (
            <div className="mt-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">
                Key signals
              </p>
              {(keySignalLines && keySignalLines.length > 0) ? (
                <ul className="mt-1 space-y-1">
                  {keySignalLines.slice(0, compact ? 4 : 8).map((stat) => (
                    <li key={stat} className="text-xs leading-snug text-black/70">
                      · {stat}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-xs text-black/65">No stat breakdown available for this pick.</p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-black/80">No key signals uploaded for this pick.</p>
          )}
          {!compact ? (
            <p className="mt-3">
              <Link
                href={`/statstrike/fixture/${fixture.id}?date=${encodeURIComponent(row.selectionDateKey)}`}
                className="text-xs font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Open full detail →
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
