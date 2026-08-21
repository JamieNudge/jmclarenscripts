'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { get, ref } from 'firebase/database';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
import {
  STATSTRIKE_DAY_NAV_MAX_OFFSET,
  STATSTRIKE_DAY_NAV_MIN_OFFSET,
  clampStatStrikeDayOffset,
  ukSelectionDateKeyOffset,
  ukSelectionDayOffsetBetween,
} from '@/lib/statstrike/uk-date';

const statStrikeAppStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

function dayLabel(dayOffset: number, dateKey: string): string {
  if (dayOffset === 0) return 'Today';
  if (dayOffset === -1) return 'Yesterday';
  if (dayOffset === 1) return 'Tomorrow';
  return dateKey;
}

/**
 * GoalLab Forecasts board — full day of compact fixture + goal-band cells.
 * Day nav: look back up to 7 days for everyone; look-ahead (+2) for pass holders only when gated.
 */
function GoalLabV2FixturesListInner() {
  const todayKey = useBestPicksLondonDateKey();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [dayOffset, setDayOffset] = useState(0);

  const { forecastsBlur, supporterPassSalesEnabled } = useStatStrikeWebBlur();
  const pass = useStatStrikePassSession();

  /** Free visitors may look back for track record; look-ahead is pass-only so tomorrow’s tips aren’t free inventory. */
  const maxDayOffset =
    pass.unlocked || !supporterPassSalesEnabled || !forecastsBlur
      ? STATSTRIKE_DAY_NAV_MAX_OFFSET
      : 0;

  useEffect(() => {
    const raw = searchParams.get('date')?.trim() || '';
    if (!raw) {
      setDayOffset(0);
      return;
    }
    const offset = ukSelectionDayOffsetBetween(raw, todayKey);
    if (offset == null) return;
    const clamped = clampStatStrikeDayOffset(Math.min(offset, maxDayOffset));
    setDayOffset(clamped);
    // Drop future ?date= for free visitors (and tidy ?date= when landing on today).
    if (clamped !== offset || (clamped === 0 && Boolean(raw))) {
      if (clamped === 0) {
        router.replace(pathname, { scroll: false });
      } else if (clamped !== offset) {
        const key = ukSelectionDateKeyOffset(clamped);
        router.replace(`${pathname}?date=${encodeURIComponent(key)}`, { scroll: false });
      }
    }
  }, [searchParams, todayKey, maxDayOffset, pathname, router]);

  const dateKey = useMemo(() => ukSelectionDateKeyOffset(dayOffset), [dayOffset]);

  const goToOffset = useCallback(
    (next: number) => {
      const clamped = clampStatStrikeDayOffset(Math.min(next, maxDayOffset));
      setDayOffset(clamped);
      const key = ukSelectionDateKeyOffset(clamped);
      if (clamped === 0) {
        router.replace(pathname, { scroll: false });
      } else {
        router.replace(`${pathname}?date=${encodeURIComponent(key)}`, { scroll: false });
      }
    },
    [maxDayOffset, pathname, router],
  );

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
    let cancelled = false;
    void get(ref(db, unanimousPath))
      .then((snap) => {
        if (cancelled) return;
        setError(null);
        setLoading(false);
        setExportVal(snap.val());
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load fixtures');
        setLoading(false);
        setExportVal(null);
      });

    return () => {
      cancelled = true;
    };
  }, [configured, unanimousPath]);

  const fixtures = useMemo(
    () => sortFixturesByKickoff(parseFixturesFromUnanimousExport(exportVal)),
    [exportVal],
  );
  const groups = useMemo(() => groupFixturesByLeague(fixtures), [fixtures]);
  const totalCount = fixtures.length;

  /** Today stays behind the pass teaser; prior days are open so visitors can judge the track record. */
  const gateActive =
    dayOffset === 0 && forecastsBlur && supporterPassSalesEnabled && !pass.unlocked;
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

  const selectionLabel = dayLabel(dayOffset, dateKey);

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
          <span className="font-medium text-[var(--gl-text)]">{selectionLabel}</span>
          {' · '}
          <span className="tabular-nums text-[var(--gl-accent)]">{dateKey}</span> — fixture and
          goal-band forecasts for the day. Deeper boards and track record live in StatStrike.
        </p>
        {statStrikeAppStoreUrl ? (
          <p className="text-sm text-[var(--gl-text-soft)] pt-1">
            Full StatStrike experience —{' '}
            <StatStrikeAppStoreCta href={statStrikeAppStoreUrl} variant="inline" />
          </p>
        ) : null}
      </header>

      <div className="flex items-center justify-between gap-2 max-w-xl">
        <button
          type="button"
          className="rounded-xl border border-[var(--gl-border-strong)] bg-[var(--gl-elevated)] px-3 py-2 text-xs font-semibold text-[var(--gl-text-soft)] transition-colors hover:text-[var(--gl-text)] disabled:opacity-40"
          disabled={dayOffset <= STATSTRIKE_DAY_NAV_MIN_OFFSET}
          onClick={() => goToOffset(dayOffset - 1)}
        >
          ← Prev
        </button>
        <div className="text-center min-w-0">
          <p className="text-sm font-semibold text-[var(--gl-text)]">{selectionLabel}</p>
          <p className="text-[11px] tabular-nums text-[var(--gl-text-muted)]">{dateKey}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {dayOffset !== 0 ? (
            <button
              type="button"
              className="rounded-xl border border-[var(--gl-border-strong)] bg-[var(--gl-elevated)] px-2.5 py-2 text-xs font-semibold text-[var(--gl-accent)]"
              onClick={() => goToOffset(0)}
            >
              Today
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-xl border border-[var(--gl-border-strong)] bg-[var(--gl-elevated)] px-3 py-2 text-xs font-semibold text-[var(--gl-text-soft)] transition-colors hover:text-[var(--gl-text)] disabled:opacity-40"
            disabled={dayOffset >= maxDayOffset}
            onClick={() => goToOffset(dayOffset + 1)}
          >
            Next →
          </button>
        </div>
      </div>

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
                the full day with a supporter pass — from £1.
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
                  More fixtures this day
                </h2>
                <p className="mt-1 text-sm text-[var(--gl-text-soft)]">
                  Unlock the forecast bands below with a supporter pass.
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

export function GoalLabV2FixturesList() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <p className="text-sm text-[var(--gl-text-muted)]">Loading fixtures…</p>
        </div>
      }
    >
      <GoalLabV2FixturesListInner />
    </Suspense>
  );
}
