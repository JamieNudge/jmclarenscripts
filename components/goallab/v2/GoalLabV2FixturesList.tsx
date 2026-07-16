'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { GoalLabV2FixtureCard } from '@/components/goallab/v2/GoalLabV2FixtureCard';
import { GOAL_LAB_V2_HOME_PATH } from '@/components/goallab/v2/paths';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import { apps } from '@/lib/apps-data';
import { parseFixturesFromUnanimousExport, sortFixturesByKickoff } from '@/lib/fixtures-browser';
import { statStrikeRtdbPathsFromEnv } from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

const PREVIEW_LIMIT = 3;
const statStrikeAppStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

export function GoalLabV2FixturesList() {
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
    () => sortFixturesByKickoff(parseFixturesFromUnanimousExport(exportVal)).slice(0, PREVIEW_LIMIT),
    [exportVal],
  );
  const totalCount = fixtures.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14 space-y-8">
      <div>
        <HubFootballLink
          href={GOAL_LAB_V2_HOME_PATH}
          className="inline-flex items-center gap-2 text-sm text-[var(--gl-text-muted)] hover:text-[var(--gl-text)] transition-colors"
        >
          <span aria-hidden>←</span> Back to GoalLab
        </HubFootballLink>
      </div>

      <header className="space-y-2 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--gl-text)]">Forecasts</h1>
        <p className="text-base text-[var(--gl-text-soft)] leading-relaxed">
          Day <span className="tabular-nums text-[var(--gl-accent)]">{dateKey}</span> — three daily picks on
          the web. Full list is in the StatStrike app.
        </p>
      </header>

      {!configured ? (
        <p className="text-sm text-[var(--gl-text-soft)]">
          Firebase is not configured — add keys in <code className="text-xs">.env.local</code>.
        </p>
      ) : null}
      {configured && error ? (
        <p className="text-sm text-[var(--gl-danger)]" role="alert">
          {error}
        </p>
      ) : null}
      {configured && loading ? <p className="text-sm text-[var(--gl-text-muted)]">Loading fixtures…</p> : null}
      {configured && !loading && !error && totalCount === 0 ? (
        <p className="text-sm text-[var(--gl-text-soft)]">No fixtures for {dateKey} yet.</p>
      ) : null}

      {configured && !loading && !error && totalCount > 0 ? (
        <div className="space-y-5">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0">
            {fixtures.map((fixture) => (
              <li key={String(fixture.fixtureId)}>
                <GoalLabV2FixtureCard fixture={fixture} dateKey={dateKey} />
              </li>
            ))}
          </ul>
          {statStrikeAppStoreUrl ? (
            <p className="text-sm text-[var(--gl-text-soft)]">
              More in the app —{' '}
              <a
                href={statStrikeAppStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
              >
                Get StatStrike on the App Store
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
