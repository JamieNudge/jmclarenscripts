'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BestPicksHubWithSideAdLayout } from '@/components/best-picks/BestPicksHubWithSideAdLayout';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import { useVisitorTimeZone } from '@/hooks/useVisitorTimeZone';
import {
  FOOTBALL_PREDICTIONS_FIXTURES_TITLE,
  FOOTBALL_PREDICTIONS_HUB_PATH,
} from '@/lib/football-predictions-brand';
import {
  formatKickoffLocalAndUtc,
  formatKickoffShortLocalAndUtc,
  statStrikeRtdbPathsFromEnv,
} from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import {
  fixtureDetailHref,
  parseFixturesFromUnanimousExport,
  sortFixturesByKickoff,
  type FixtureListItem,
} from '@/lib/fixtures-browser';
import { hubContentWidthClass } from '@/lib/hub/ui';

function FixtureListRow({
  fixture,
  dateKey,
}: {
  fixture: FixtureListItem;
  dateKey: string;
}) {
  const visitorTz = useVisitorTimeZone();
  const kickoffShort = formatKickoffShortLocalAndUtc(fixture.kickoffMs, visitorTz);
  const kickoffTitle =
    fixture.kickoffMs != null ? formatKickoffLocalAndUtc(fixture.kickoffMs, visitorTz) : undefined;

  return (
    <li>
      <HubFootballLink
        href={fixtureDetailHref(fixture.fixtureId, dateKey)}
        className="flex items-center gap-3 rounded-lg border border-[var(--hub-border-soft)] bg-[var(--hub-inset)] px-3 py-2.5 transition-colors hover:border-[var(--hub-border)] hover:bg-[var(--hub-chip)]"
      >
        <span
          className="shrink-0 min-w-[9rem] text-xs tabular-nums text-[var(--hub-text-soft)] text-right leading-snug"
          title={kickoffTitle}
        >
          {kickoffShort}
        </span>
        <span className="min-w-0 flex-1 text-sm text-[var(--hub-text)] leading-snug">
          <span className="font-medium">{fixture.home}</span>
          <span className="text-[var(--hub-text-soft)] mx-1.5">v</span>
          <span className="font-medium">{fixture.away}</span>
          <span className="block text-xs text-[var(--hub-text-muted)] mt-0.5 truncate">{fixture.leagueKey}</span>
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--hub-text-soft)]">{fixture.scoreDisplay}</span>
      </HubFootballLink>
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

  const fixtures = useMemo(
    () => sortFixturesByKickoff(parseFixturesFromUnanimousExport(exportVal)),
    [exportVal],
  );
  const totalCount = fixtures.length;

  return (
    <BestPicksHubWithSideAdLayout>
      <div className={hubContentWidthClass}>
        {BEST_PICKS_EXTENDED_SITE_NAV ? <BestPicksSiteNav variant="header" /> : null}

        <div className={BEST_PICKS_EXTENDED_SITE_NAV ? 'mt-6' : 'mt-0'}>
          <HubFootballLink
            href={FOOTBALL_PREDICTIONS_HUB_PATH}
            className="inline-flex items-center gap-2 text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Football Predictions
          </HubFootballLink>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{FOOTBALL_PREDICTIONS_FIXTURES_TITLE}</h1>
        <p className="text-sm text-[var(--hub-text-soft)] mb-8 leading-relaxed">
          Day <span className="tabular-nums text-[var(--hub-accent-link)]">{dateKey}</span> from your daily upload. Tap a fixture
          for forecast detail.
        </p>

        {!configured ? (
          <p className="text-sm text-[var(--hub-text)] leading-relaxed">
            Firebase is not configured — add keys in <code className="text-xs text-[var(--hub-text-soft)]">.env.local</code>.
          </p>
        ) : null}

        {configured && error ? (
          <p className="text-sm text-[var(--hub-danger)] leading-relaxed" role="alert">
            {error}
          </p>
        ) : null}

        {configured && loading ? (
          <p className="text-sm text-[var(--hub-text-soft)]">Loading fixtures…</p>
        ) : null}

        {configured && !loading && !error && totalCount === 0 ? (
          <p className="text-sm text-[var(--hub-text)] leading-relaxed">No fixtures for {dateKey} yet.</p>
        ) : null}

        {configured && !loading && !error && totalCount > 0 ? (
          <p className="text-xs text-[var(--hub-text-soft)] mb-4 tabular-nums">
            {totalCount} fixture{totalCount === 1 ? '' : 's'}
          </p>
        ) : null}

        {configured && !loading && !error && fixtures.length > 0 ? (
          <ul className="space-y-1.5">
            {fixtures.map((fixture) => (
              <FixtureListRow key={String(fixture.fixtureId)} fixture={fixture} dateKey={dateKey} />
            ))}
          </ul>
        ) : null}
      </div>
    </BestPicksHubWithSideAdLayout>
  );
}
