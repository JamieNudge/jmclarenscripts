'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { formatKickoffLocal, scoreLabel } from '@/lib/statstrike/board-merge';
import {
  bttsPredictionResultForFixture,
  isResultFinishedStatus,
  marketResultBadgeLabel,
  predictionResultForFixture,
} from '@/lib/statstrike/correctness';
import { displayBandRows } from '@/lib/statstrike/goal-band-cascade';
import type { StatStrikeFixture, StatStrikePrediction } from '@/lib/statstrike/models';
import { parseBTTSSelectionsPayload, predictionFromBTTSPick } from '@/lib/statstrike/btts-selections';
import { isBestPerformingLeague, enrichBoardRowDisplay, isLiveStatus, parseDailySelection } from '@/lib/statstrike/parse-selection';
import { bttsSelectionsPathForDateKey, selectionsPathForDateKey } from '@/lib/statstrike/uk-date';

type Props = {
  fixtureId: number;
  dateKey: string;
};

type DetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'missing' }
  | {
      status: 'ready';
      fixture: StatStrikeFixture;
      prediction: StatStrikePrediction | null;
      bttsPrediction: StatStrikePrediction | null;
      bestPerformingLeague: boolean;
      selectionDateKey: string;
      trackRecordDisplay: {
        title: string;
        helperText: string | null;
        forecastCount: number;
        winRate: number;
        isQualified: boolean;
      } | null;
      keySignalLines: string[];
    };

export function StatStrikeFixtureDetail({ fixtureId, dateKey }: Props) {
  const [state, setState] = useState<DetailState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isFirebaseClientConfigured()) {
        if (!cancelled) setState({ status: 'error', message: 'Firebase is not configured.' });
        return;
      }
      const db = getFirebaseRealtimeDb();
      if (!db) {
        if (!cancelled) setState({ status: 'error', message: 'Firebase database unavailable.' });
        return;
      }

      try {
        const [selSnap, bttsSnap] = await Promise.all([
          get(ref(db, selectionsPathForDateKey(dateKey))),
          get(ref(db, bttsSelectionsPathForDateKey(dateKey))),
        ]);
        const sel = parseDailySelection(selSnap.val());
        if (!sel) {
          if (!cancelled) setState({ status: 'missing' });
          return;
        }
        const fixture = sel.fixtures.find((f) => f.id === fixtureId);
        if (!fixture) {
          if (!cancelled) setState({ status: 'missing' });
          return;
        }
        const prediction = sel.predictionsByFixtureId.get(fixtureId) ?? null;
        const display = enrichBoardRowDisplay(fixture, prediction, sel);
        const bttsPick = parseBTTSSelectionsPayload(bttsSnap.val())?.picksByFixtureId.get(fixtureId);
        const bttsPrediction = bttsPick ? predictionFromBTTSPick(bttsPick) : null;
        if (!cancelled) {
          setState({
            status: 'ready',
            fixture,
            prediction,
            bttsPrediction,
            bestPerformingLeague: isBestPerformingLeague(fixture, sel.leaguePerformance),
            selectionDateKey: dateKey,
            trackRecordDisplay: display.trackRecordDisplay,
            keySignalLines: display.keySignalLines,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: e instanceof Error ? e.message : 'Failed to load fixture',
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fixtureId, dateKey]);

  if (state.status === 'loading') {
    return <p className="text-sm text-black/70">Loading fixture…</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm text-red-700">{state.message}</p>;
  }
  if (state.status === 'missing') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-black/70">Fixture not found for {dateKey}.</p>
        <Link href="/statstrike" className="text-sm font-semibold text-[#0b3d5c] hover:underline">
          ← Back to board
        </Link>
      </div>
    );
  }

  const { fixture, prediction, bttsPrediction, bestPerformingLeague, trackRecordDisplay, keySignalLines } =
    state;
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
    <article className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link href="/statstrike" className="text-xs font-semibold text-[#0b3d5c] hover:underline">
          ← Board
        </Link>
        <p className="text-[11px] tabular-nums text-black/65">{state.selectionDateKey}</p>
      </div>

      <header className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-black/70">
          {leagueLabel || 'League'}
          {bestPerformingLeague ? ' · Best performing' : ''}
        </p>
        <h1 className="mt-2 text-xl font-bold text-black/90 leading-snug">
          {fixture.homeTeam.name}{' '}
          <span className="font-normal text-black/70">v</span> {fixture.awayTeam.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-black/75">
          <span className="tabular-nums">{formatKickoffLocal(fixture.kickoffMs)}</span>
          {live ? (
            <span className="inline-flex items-center rounded-full bg-[#0d9488] px-1.5 py-0.5 text-[10px] font-bold text-white">
              LIVE{fixture.elapsed != null ? ` ${fixture.elapsed}'` : ''}
            </span>
          ) : null}
          {score ? <span className="font-bold tabular-nums text-black/90">{score}</span> : null}
          {finished ? (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
                won === true ? 'bg-amber-300 text-black' : 'bg-black/25 text-white'
              }`}
            >
              {marketResultBadgeLabel(band, won)}
            </span>
          ) : null}
          {finished && bttsBand ? (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
                bttsWon === true ? 'bg-amber-300 text-black' : 'bg-black/25 text-white'
              }`}
            >
              {marketResultBadgeLabel(bttsBand, bttsWon, { bttsMarket: true })}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-col items-start gap-1.5">
          {cascade ? (
            <span className="inline-flex rounded-full bg-violet-500 px-2.5 py-1 text-[11px] font-black tracking-wide text-white shadow-sm">
              Goal Band Cascade
            </span>
          ) : null}
          <span className="inline-flex rounded-full bg-sky-400 px-2.5 py-1 text-sm font-black tracking-wide text-black shadow-sm">
            {band}
          </span>
          {bttsBand ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-2.5 py-1 text-sm font-black tracking-wide text-black shadow-sm">
              <span>{bttsBand}</span>
              {finished && bttsWon != null ? (
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
                    bttsWon ? 'bg-white text-black' : 'bg-black/25 text-white'
                  }`}
                >
                  {bttsWon ? 'BTTS WIN' : 'BTTS FT'}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      </header>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-[#0b3d5c]">Forecast detail</h2>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm text-black/75">
          <dt className="font-semibold text-black/80">Tip</dt>
          <dd>{band}</dd>
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
                {bttsPrediction!.matchedCriteria}/{bttsPrediction!.totalCriteria} ({bttsConfidencePct}%)
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
      </section>

      {cascadeRows.length > 0 ? (
        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <h2 className="text-[10px] font-semibold uppercase tracking-wide text-black/70">
            Goal Band Cascade
          </h2>
          <ul className="mt-2 space-y-1.5">
            {cascadeRows.map((bandRow) => (
              <li
                key={bandRow.bandKey}
                className="flex items-center justify-between gap-2 text-sm text-black/80"
              >
                <span className="font-medium text-black/90">{bandRow.label}</span>
                {bandRow.decimalOdds != null && bandRow.decimalOdds > 1 ? (
                  <span className="tabular-nums font-semibold">{bandRow.decimalOdds.toFixed(2)}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-2">
        {trackRecordDisplay ? (
          <>
            <h2 className="text-[10px] font-semibold uppercase tracking-wide text-black/70">
              {trackRecordDisplay.title}
            </h2>
            <p className="text-sm tabular-nums text-black/75">
              {trackRecordDisplay.forecastCount} archived forecast
              {trackRecordDisplay.forecastCount === 1 ? '' : 's'}
            </p>
            <p className="text-sm tabular-nums text-black/75">
              {Math.round(trackRecordDisplay.winRate)}% recent performance
            </p>
            <p className="text-sm font-semibold text-black/85">
              {trackRecordDisplay.isQualified ? 'Qualified League ✓' : 'League tracked'}
            </p>
            {trackRecordDisplay.helperText ? (
              <p className="text-xs text-black/60">{trackRecordDisplay.helperText}</p>
            ) : null}
            <div className="h-1 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-[#0b3d5c]"
                style={{
                  width: `${Math.max(4, Math.min(100, trackRecordDisplay.winRate))}%`,
                }}
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-[10px] font-semibold uppercase tracking-wide text-black/70">
              League track record
            </h2>
            <p className="text-sm text-black/65">Building — no archived forecasts yet</p>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-black/70">Key signals</h2>
        {keySignalLines.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {keySignalLines.map((stat) => (
              <li key={stat} className="flex items-start gap-2 text-sm leading-snug text-black/75">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
                {stat}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-black/65">No stat breakdown available for this pick.</p>
        )}
      </section>
    </article>
  );
}
