'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { formatKickoffLocal, scoreLabel } from '@/lib/statstrike/board-merge';
import { isResultFinishedStatus, predictionResultForFixture } from '@/lib/statstrike/correctness';
import { displayBandRows } from '@/lib/statstrike/goal-band-cascade';
import type { StatStrikeFixture, StatStrikePrediction } from '@/lib/statstrike/models';
import { isBestPerformingLeague, isLiveStatus, parseDailySelection } from '@/lib/statstrike/parse-selection';
import { selectionsPathForDateKey, ukSelectionDateKey } from '@/lib/statstrike/uk-date';

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
      bestPerformingLeague: boolean;
      selectionDateKey: string;
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
        const snap = await get(ref(db, selectionsPathForDateKey(dateKey)));
        const sel = parseDailySelection(snap.val());
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
        if (!cancelled) {
          setState({
            status: 'ready',
            fixture,
            prediction,
            bestPerformingLeague: isBestPerformingLeague(fixture, sel.leaguePerformance),
            selectionDateKey: dateKey,
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

  const { fixture, prediction, bestPerformingLeague } = state;
  const live = isLiveStatus(fixture.status);
  const finished = isResultFinishedStatus(fixture.status);
  const won = predictionResultForFixture(fixture, prediction);
  const score = scoreLabel(fixture);
  const band = prediction?.recommendedLevel || prediction?.level || '—';
  const cascade = prediction?.goalBandCascade ?? null;
  const cascadeRows = cascade ? displayBandRows(cascade) : [];
  const leagueLabel = [fixture.league.country, fixture.league.name].filter(Boolean).join(' · ');
  const confidencePct =
    prediction && prediction.totalCriteria > 0
      ? Math.round((prediction.matchedCriteria / prediction.totalCriteria) * 100)
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
        {cascade ? (
          <span className="mt-1.5 inline-flex rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            Goal Band Cascade
          </span>
        ) : null}
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
              {won === true ? 'WIN' : 'FT'}
            </span>
          ) : null}
        </div>
        <p className="mt-3 inline-flex rounded-md bg-[#0b3d5c]/10 px-2 py-1 text-sm font-semibold text-[#0b3d5c]">
          {band}
        </p>
      </header>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-[#0b3d5c]">Forecast detail</h2>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm text-black/75">
          <dt className="font-semibold text-black/80">Tip</dt>
          <dd>{band}</dd>
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

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-black/70">Key signals</h2>
        {prediction?.significantStats && prediction.significantStats.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {prediction.significantStats.map((stat) => (
              <li key={stat} className="text-sm leading-snug text-black/75">
                · {stat}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-black/65">No key signals uploaded for this pick.</p>
        )}
      </section>
    </article>
  );
}

export function resolveFixtureDetailDateKey(searchDate: string | null | undefined): string {
  if (searchDate && /^\d{4}-\d{2}-\d{2}$/.test(searchDate)) return searchDate;
  return ukSelectionDateKey();
}
