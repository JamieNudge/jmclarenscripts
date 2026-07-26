'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import Link from 'next/link';
import { GoalLabV2FixtureCard } from '@/components/goallab/v2/GoalLabV2FixtureCard';
import { GOAL_LAB_V2_HOME_PATH } from '@/components/goallab/v2/paths';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { StatStrikeAppStoreCta } from '@/components/statstrike/StatStrikeAppStoreCta';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import { useStatStrikePassSession } from '@/hooks/useStatStrikePassSession';
import { useStatStrikeWebBlur } from '@/hooks/useStatStrikeWebBlur';
import { apps } from '@/lib/apps-data';
import {
  groupFixturesByLeague,
  parseFixturesFromUnanimousExport,
  sortFixturesByKickoff,
} from '@/lib/fixtures-browser';
import { statStrikeRtdbPathsFromEnv } from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { freeForecastFixtureIds } from '@/lib/statstrike/forecasts-teaser';
import { passCreatePath } from '@/lib/statstrike/pass-constants';

const statStrikeAppStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

/**
 * GoalLab Forecasts board — full day of compact fixture + goal-band cells.
 * No detail-route navigation; deeper tools live in StatStrike.
 */
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

  const { forecastsBlur, supporterPassSalesEnabled } = useStatStrikeWebBlur();
  const pass = useStatStrikePassSession();

  const fixtures = useMemo(
    () => sortFixturesByKickoff(parseFixturesFromUnanimousExport(exportVal)),
    [exportVal],
  );
  const groups = useMemo(() => groupFixturesByLeague(fixtures), [fixtures]);
  const totalCount = fixtures.length;

  const gateActive = forecastsBlur && supporterPassSalesEnabled && !pass.unlocked;
  const freeIds = useMemo(
    () => (gateActive ? freeForecastFixtureIds(fixtures) : new Set<string>()),
    [gateActive, fixtures],
  );
  const freeCount = gateActive ? Math.min(freeIds.size, totalCount) : totalCount;
  const hasLockedFixtures = gateActive && totalCount > freeCount;
  const freeFixtures = useMemo(() => {
    if (!hasLockedFixtures) return [];
    const byId = new Map(fixtures.map((fixture) => [String(fixture.fixtureId), fixture]));
    return Array.from(freeIds)
      .map((id) => byId.get(id))
      .filter((fixture): fixture is (typeof fixtures)[number] => fixture != null);
  }, [fixtures, freeIds, hasLockedFixtures]);
  const visibleGroups = useMemo(
    () =>
      hasLockedFixtures
        ? groupFixturesByLeague(
            fixtures.filter((fixture) => !freeIds.has(String(fixture.fixtureId))),
          )
        : groups,
    [fixtures, freeIds, groups, hasLockedFixtures],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14 space-y-8">
      <div>
        <HubFootballLink
          href={GOAL_LAB_V2_HOME_PATH}
          className="inline-flex items-center gap-2 text-sm text-[var(--gl-text-muted)] hover:text-[var(--gl-text)] transition-colors"
        >
          <span aria-hidden>←</span> Back to Home
        </HubFootballLink>
      </div>

      <header className="space-y-2 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--gl-text)]">Forecasts</h1>
        <p className="text-base text-[var(--gl-text-soft)] leading-relaxed">
          Day <span className="tabular-nums text-[var(--gl-accent)]">{dateKey}</span> — fixture and
          goal-band forecasts for the day. Deeper boards and track record live in StatStrike.
        </p>
        {statStrikeAppStoreUrl ? (
          <p className="text-sm text-[var(--gl-text-soft)] pt-1">
            Full StatStrike experience —{' '}
            <StatStrikeAppStoreCta href={statStrikeAppStoreUrl} variant="inline" />
          </p>
        ) : null}
      </header>

      {hasLockedFixtures ? (
        <section className="space-y-4" aria-labelledby="free-forecast-preview">
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--gl-border-strong)] bg-[var(--gl-elevated)] px-5 py-4 shadow-[var(--gl-shadow)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                id="free-forecast-preview"
                className="text-lg font-semibold text-[var(--gl-text)]"
              >
                Free forecast preview
              </h2>
              <p className="mt-1 text-sm text-[var(--gl-text-soft)] leading-relaxed">
                Showing <span className="font-semibold tabular-nums">{freeCount}</span> of{' '}
                <span className="font-semibold tabular-nums">{totalCount}</span> forecasts. Unlock
                the full day for 24 hours — from £1.
              </p>
            </div>
            <Link
              href={passCreatePath()}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--gl-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Unlock all forecasts
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0">
            {freeFixtures.map((fixture) => (
              <li key={String(fixture.fixtureId)}>
                <GoalLabV2FixtureCard
                  fixture={fixture}
                  dateKey={dateKey}
                  interactive={false}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
        <div className="space-y-8">
          <div className="space-y-10">
            {hasLockedFixtures ? (
              <div className="border-t border-[var(--gl-border)] pt-8">
                <h2 className="text-xl font-semibold tracking-tight text-[var(--gl-text)]">
                  More fixtures today
                </h2>
                <p className="mt-1 text-sm text-[var(--gl-text-soft)]">
                  Unlock the forecast bands below with a 24-hour pass.
                </p>
              </div>
            ) : null}
            {visibleGroups.map((group) => (
              <section key={group.leagueKey} className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--gl-text-muted)]">
                  {group.leagueKey}
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0">
                  {group.fixtures.map((fixture) => (
                    <li key={String(fixture.fixtureId)}>
                      <GoalLabV2FixtureCard
                        fixture={fixture}
                        dateKey={dateKey}
                        interactive={false}
                        locked={hasLockedFixtures}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {statStrikeAppStoreUrl ? (
            <p className="text-sm text-[var(--gl-text-soft)]">
              Full StatStrike experience —{' '}
              <StatStrikeAppStoreCta href={statStrikeAppStoreUrl} variant="inline" />
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
