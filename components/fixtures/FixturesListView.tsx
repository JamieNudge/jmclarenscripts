'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { onValue, ref } from 'firebase/database';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BestPicksHubWithSideAdLayout } from '@/components/best-picks/BestPicksHubWithSideAdLayout';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import {
  FOOTBALL_PREDICTIONS_FIXTURES_TITLE,
  FOOTBALL_PREDICTIONS_HUB_PATH,
} from '@/lib/football-predictions-brand';
import { statStrikeRtdbPathsFromEnv } from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import {
  fixtureDetailHref,
  groupFixturesByLeague,
  parseFixturesFromUnanimousExport,
  type FixtureLeagueGroup,
} from '@/lib/fixtures-browser';

function FixtureListRow({
  fixture,
  dateKey,
}: {
  fixture: FixtureLeagueGroup['fixtures'][number];
  dateKey: string;
}) {
  return (
    <li>
      <Link
        href={fixtureDetailHref(fixture.fixtureId, dateKey)}
        className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/25 px-3 py-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
      >
        <span className="shrink-0 w-12 text-xs tabular-nums text-white/90 text-right">{fixture.kickoffShort}</span>
        <span className="min-w-0 flex-1 text-sm text-white leading-snug">
          <span className="font-medium">{fixture.home}</span>
          <span className="text-white/80 mx-1.5">v</span>
          <span className="font-medium">{fixture.away}</span>
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-white/95">{fixture.scoreDisplay}</span>
      </Link>
    </li>
  );
}

export function FixturesListView() {
  const dateKey = useBestPicksLondonDateKey();
  const [exportVal, setExportVal] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { unanimousPath } = statStrikeRtdbPathsFromEnv(dateKey);
  const configured = isFirebaseClientConfigured();

  useEffect(() => {
    if (!configured) {
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
  }, [configured, unanimousPath]);

  const groups = useMemo(() => groupFixturesByLeague(parseFixturesFromUnanimousExport(exportVal)), [exportVal]);
  const totalCount = useMemo(() => groups.reduce((n, g) => n + g.fixtures.length, 0), [groups]);

  return (
    <BestPicksHubWithSideAdLayout>
      <div className="w-full min-w-0 max-w-3xl 2xl:max-w-4xl mx-auto">
        {BEST_PICKS_EXTENDED_SITE_NAV ? <BestPicksSiteNav variant="header" /> : null}

        <div className={BEST_PICKS_EXTENDED_SITE_NAV ? 'mt-6' : 'mt-0'}>
          <HubFootballLink
            href={FOOTBALL_PREDICTIONS_HUB_PATH}
            className="inline-flex items-center gap-2 text-white/93 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Football Predictions
          </HubFootballLink>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{FOOTBALL_PREDICTIONS_FIXTURES_TITLE}</h1>
        <p className="text-sm text-white/93 mb-8 leading-relaxed">
          Day <span className="tabular-nums text-amber-100/95">{dateKey}</span> from your daily upload. Tap a fixture
          for forecast detail.
        </p>

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

        {configured && loading ? (
          <p className="text-sm text-white/90">Loading fixtures…</p>
        ) : null}

        {configured && !loading && !error && totalCount === 0 ? (
          <p className="text-sm text-white leading-relaxed">No fixtures for {dateKey} yet.</p>
        ) : null}

        {configured && !loading && !error && totalCount > 0 ? (
          <p className="text-xs text-white/85 mb-4 tabular-nums">
            {totalCount} fixture{totalCount === 1 ? '' : 's'}
          </p>
        ) : null}

        {configured && !loading && !error && groups.length > 0 ? (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.leagueKey}>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-100/90 mb-2 px-0.5">
                  {group.leagueKey}
                </h2>
                <ul className="space-y-1.5">
                  {group.fixtures.map((fixture) => (
                    <FixtureListRow key={String(fixture.fixtureId)} fixture={fixture} dateKey={dateKey} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </BestPicksHubWithSideAdLayout>
  );
}
