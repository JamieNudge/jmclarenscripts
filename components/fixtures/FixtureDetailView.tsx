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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { unanimousPath } = statStrikeRtdbPathsFromEnv(dateKey);
  const configured = isFirebaseClientConfigured();

  useEffect(() => {
    if (!configured || !fixtureId) {
      setLoading(false);
      setExportVal(null);
      setError(null);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const exportRef = ref(db, unanimousPath);
    const unsub = onValue(
      exportRef,
      (snap) => {
        setError(null);
        setLoading(false);
        setExportVal(snap.val());
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        setExportVal(null);
      },
    );

    return () => unsub();
  }, [configured, fixtureId, unanimousPath]);

  const pick = useMemo(
    () => (fixtureId ? findFixtureInExport(exportVal, fixtureId) : null),
    [exportVal, fixtureId],
  );

  const teams = pick ? pickTeams(pick) : null;
  const forecast = pick ? pickForecastDetailLines(pick) : null;
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
              <section className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-4 space-y-3">
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
                {forecast.significantStats.length > 0 ? (
                  <ul className="space-y-1 text-sm text-white/92 list-disc list-inside">
                    {forecast.significantStats.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : null}
                {forecast.odds ? <p className="text-sm text-amber-100/95 tabular-nums">{forecast.odds}</p> : null}
              </section>
            ) : null}

            <p className="text-xs text-white/75 border-t border-white/10 pt-4">
              Match history tables (H2H and recent form) — coming soon.
            </p>
          </div>
        ) : null}
      </div>
    </BestPicksHubWithSideAdLayout>
  );
}
