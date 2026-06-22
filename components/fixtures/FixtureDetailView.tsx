'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { onValue, ref } from 'firebase/database';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BestPicksHubWithSideAdLayout } from '@/components/best-picks/BestPicksHubWithSideAdLayout';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import { formatKickoffFromPickRecord, pickTeams, statStrikeRtdbPathsFromEnv } from '@/lib/best-picks-firebase';
import {
  FOOTBALL_PREDICTIONS_FIXTURES_PATH,
  FOOTBALL_PREDICTIONS_FIXTURES_TITLE,
} from '@/lib/football-predictions-brand';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import {
  findFixtureInExport,
  pickForecastDetailLines,
  pickScoreDisplay,
} from '@/lib/fixtures-browser';
import {
  buildKeySignalLines,
  findSelectionStatsForFixture,
  fixtureContextRtdbPath,
  modelScoreFromPick,
  parseFixtureContextFromRtdb,
  type KeySignalLine,
} from '@/lib/fixture-key-signals';

function pickText(v: unknown): string | null {
  if (typeof v === 'string') {
    const t = v.trim();
    return t ? t : null;
  }
  return null;
}

export function FixtureDetailView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const todayKey = useBestPicksLondonDateKey();
  const fixtureId = typeof params?.fixtureId === 'string' ? params.fixtureId : '';
  const dateKey = searchParams.get('date')?.trim() || todayKey;

  const [exportVal, setExportVal] = useState<unknown>(null);
  const [selectionVal, setSelectionVal] = useState<unknown>(null);
  const [contextVal, setContextVal] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { unanimousPath, selectionPath } = statStrikeRtdbPathsFromEnv(dateKey);
  const contextPath = fixtureId ? fixtureContextRtdbPath(dateKey, fixtureId) : '';
  const configured = isFirebaseClientConfigured();

  useEffect(() => {
    if (!configured || !fixtureId) {
      setLoading(false);
      setExportVal(null);
      setSelectionVal(null);
      setContextVal(null);
      setError(null);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let pending = 3;
    let exportDone = false;
    let selectionDone = false;
    let contextDone = false;

    const finishIfReady = () => {
      pending -= 1;
      if (pending <= 0) setLoading(false);
    };

    const exportRef = ref(db, unanimousPath);
    const selectionRef = ref(db, selectionPath);
    const contextRef = ref(db, contextPath);

    const unsubExport = onValue(
      exportRef,
      (snap) => {
        setError(null);
        setExportVal(snap.val());
        if (!exportDone) {
          exportDone = true;
          finishIfReady();
        }
      },
      (err) => {
        setError(err.message);
        setExportVal(null);
        if (!exportDone) {
          exportDone = true;
          finishIfReady();
        }
      },
    );

    const unsubSelection = onValue(
      selectionRef,
      (snap) => {
        setSelectionVal(snap.val());
        if (!selectionDone) {
          selectionDone = true;
          finishIfReady();
        }
      },
      () => {
        setSelectionVal(null);
        if (!selectionDone) {
          selectionDone = true;
          finishIfReady();
        }
      },
    );

    const unsubContext = onValue(
      contextRef,
      (snap) => {
        setContextVal(snap.val());
        if (!contextDone) {
          contextDone = true;
          finishIfReady();
        }
      },
      () => {
        setContextVal(null);
        if (!contextDone) {
          contextDone = true;
          finishIfReady();
        }
      },
    );

    return () => {
      unsubExport();
      unsubSelection();
      unsubContext();
    };
  }, [configured, contextPath, fixtureId, selectionPath, unanimousPath]);

  const pick = useMemo(
    () => (fixtureId ? findFixtureInExport(exportVal, fixtureId) : null),
    [exportVal, fixtureId],
  );

  const teams = pick ? pickTeams(pick) : null;
  const forecast = pick ? pickForecastDetailLines(pick) : null;
  const context = useMemo(() => parseFixtureContextFromRtdb(contextVal), [contextVal]);
  const selectionStats = useMemo(
    () => (fixtureId ? findSelectionStatsForFixture(selectionVal, fixtureId) : null),
    [fixtureId, selectionVal],
  );
  const keySignals: KeySignalLine[] = useMemo(() => {
    if (!pick || !teams) return [];
    return buildKeySignalLines(pick, teams.home, teams.away, context, selectionStats);
  }, [context, pick, selectionStats, teams]);
  const modelScore = pick ? modelScoreFromPick(pick) : null;
  const kickoff = pick ? formatKickoffFromPickRecord(pick) : null;
  const country = pick ? pickText(pick.country) : null;
  const league = pick ? pickText(pick.league) : null;
  const venue = pick ? pickText(pick.venue) : null;
  const status = pick ? pickText(pick.status) : null;
  const score = pick ? pickScoreDisplay(pick) : null;
  const listBackHref = `${FOOTBALL_PREDICTIONS_FIXTURES_PATH}${dateKey !== todayKey ? `?date=${encodeURIComponent(dateKey)}` : ''}`;

  return (
    <BestPicksHubWithSideAdLayout>
      <div className="w-full min-w-0 max-w-3xl 2xl:max-w-4xl mx-auto">
        {BEST_PICKS_EXTENDED_SITE_NAV ? <BestPicksSiteNav variant="header" /> : null}

        <div className={BEST_PICKS_EXTENDED_SITE_NAV ? 'mt-6' : 'mt-0'}>
          <HubFootballLink
            href={listBackHref}
            className="inline-flex items-center gap-2 text-white/93 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {FOOTBALL_PREDICTIONS_FIXTURES_TITLE.toLowerCase()}
          </HubFootballLink>
        </div>

        {!fixtureId ? <p className="text-sm text-white">Missing fixture id.</p> : null}

        {!configured ? (
          <p className="text-sm text-white leading-relaxed">
            Firebase is not configured — add keys in <code className="text-xs text-white/94">.env.local</code>.
          </p>
        ) : null}

        {configured && error ? (
          <p className="text-sm text-red-300 leading-relaxed" role="alert">
            {error}
          </p>
        ) : null}

        {configured && loading ? <p className="text-sm text-white/90">Loading fixture…</p> : null}

        {configured && !loading && !error && !pick ? (
          <p className="text-sm text-white leading-relaxed">
            Fixture not found for <span className="tabular-nums">{dateKey}</span>.
          </p>
        ) : null}

        {configured && !loading && pick && teams ? (
          <div className="space-y-6">
            <header className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug">
                {teams.home}
                <span className="text-white/85 font-normal mx-2">v</span>
                {teams.away}
              </h1>
              {[country, league].filter(Boolean).length > 0 ? (
                <p className="text-sm text-white/92">{[country, league].filter(Boolean).join(' · ')}</p>
              ) : null}
              {kickoff ? <p className="text-sm text-white/92 tabular-nums">{kickoff}</p> : null}
              {venue ? <p className="text-sm text-white/88">{venue}</p> : null}
              <p className="text-lg font-semibold tabular-nums text-white pt-1">
                {score !== '–' ? score : '–'}
                {status ? <span className="ml-2 text-sm font-medium text-white/80">{status}</span> : null}
              </p>
            </header>

            {forecast ? (
              <section className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-4 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">Forecast</h2>
                {forecast.primary ? (
                  <p className="text-base font-semibold text-cyan-100/95">{forecast.primary}</p>
                ) : null}
                {forecast.bands.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {forecast.bands.map((b) => (
                      <li
                        key={b.label}
                        className="text-xs font-medium px-2 py-1 rounded-md border border-white/15 bg-black/30 text-white/95 tabular-nums"
                      >
                        {b.label} {b.value}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {forecast.odds ? <p className="text-sm text-amber-100/95 tabular-nums">{forecast.odds}</p> : null}

                {keySignals.length > 0 ? (
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-white/75">Key signals</p>
                      {modelScore ? (
                        <p className="text-xs font-semibold text-white/80 tabular-nums">Model score {modelScore}</p>
                      ) : null}
                    </div>
                    <ul className="space-y-2.5">
                      {keySignals.map((line) => (
                        <li key={line.id} className="flex items-start gap-2.5">
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                            aria-hidden
                          />
                          <div className="min-w-0 text-sm leading-snug">
                            <span className="text-white/95">
                              {line.label}: <span className="font-semibold tabular-nums">{line.value}</span>
                            </span>
                            {line.meta ? (
                              <span className="block text-xs text-white/70 tabular-nums mt-0.5">{line.meta}</span>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {!context ? (
                      <p className="text-[11px] text-white/55 leading-relaxed">
                        Game counts and date ranges appear after the next Mac upload includes fixture context.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </section>
            ) : null}

            <p className="text-xs text-white/75 border-t border-white/10 pt-4">
              Full match history tables (H2H and recent form) — coming soon.
            </p>
          </div>
        ) : null}
      </div>
    </BestPicksHubWithSideAdLayout>
  );
}
