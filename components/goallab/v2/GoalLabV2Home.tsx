'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { GoalLabV2AppsStatus } from '@/components/goallab/v2/GoalLabV2AppsStatus';
import { GoalLabV2FixtureCard } from '@/components/goallab/v2/GoalLabV2FixtureCard';
import { GoalLabV2LiveMetrics } from '@/components/goallab/v2/GoalLabV2LiveMetrics';
import { GoalLabV2ModelPipeline } from '@/components/goallab/v2/GoalLabV2ModelPipeline';
import { StatStrikeHeroPanel } from '@/components/statstrike/StatStrikeHeroPanel';
import { StatStrikeAppStoreCta } from '@/components/statstrike/StatStrikeAppStoreCta';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import {
  GOAL_LAB_V2_BLOG_PATH,
  GOAL_LAB_V2_FIXTURES_PATH,
  GOAL_LAB_V2_METHODOLOGY_PATH,
  GOAL_LAB_V2_RESEARCH_PATH,
} from '@/components/goallab/v2/paths';
import { AND_ANOTHER_THING_PATH } from '@/lib/football-predictions-brand';
import { apps } from '@/lib/apps-data';
import { statStrikeRtdbPathsFromEnv } from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import {
  parseFixturesFromUnanimousExport,
  sortFixturesByKickoff,
} from '@/lib/fixtures-browser';
import { isStatStrikeWebEnabled } from '@/lib/statstrike/enabled';

const PREVIEW_LIMIT = 3;
const statStrikeAppStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

export function GoalLabV2Home() {
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
  const featured = fixtures[0] ?? null;
  const grid = fixtures.slice(0, PREVIEW_LIMIT);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14 space-y-16 md:space-y-24">
      {/* Hero */}
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.08em] text-[var(--gl-accent)]">
            GoalLab
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl lg:text-[3.25rem] font-semibold tracking-tight text-[var(--gl-text)] leading-[1.1] text-balance">
            Global football forecasting
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--gl-text-soft)] leading-relaxed">
            Professional match forecasts powered by statistical models — explore today&apos;s fixtures in
            depth on desktop.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <HubFootballLink
              href={GOAL_LAB_V2_FIXTURES_PATH}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--gl-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gl-accent)]"
            >
              Explore forecasts
            </HubFootballLink>
            <HubFootballLink
              href={GOAL_LAB_V2_METHODOLOGY_PATH}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--gl-border-strong)] bg-[var(--gl-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--gl-text)] transition-colors hover:bg-[var(--gl-elevated)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gl-accent)]"
            >
              Learn how it works
            </HubFootballLink>
          </div>
          <p className="mt-4 text-xs tabular-nums text-[var(--gl-text-muted)]">London date · {dateKey}</p>
        </div>

        <div className="min-w-0">
          {isStatStrikeWebEnabled() ? (
            <StatStrikeHeroPanel />
          ) : loading ? (
            <div className="rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-6 shadow-[var(--gl-shadow)] animate-pulse">
              <div className="h-3 w-1/3 rounded bg-[var(--gl-elevated)]" />
              <div className="mt-4 h-7 w-3/4 rounded bg-[var(--gl-elevated)]" />
              <div className="mt-6 h-1.5 w-full rounded-full bg-[var(--gl-elevated)]" />
            </div>
          ) : featured ? (
            <GoalLabV2FixtureCard fixture={featured} dateKey={dateKey} featured />
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--gl-border-strong)] bg-[var(--gl-surface)] p-6">
              <p className="text-sm font-medium text-[var(--gl-text)]">No live fixture card yet</p>
              <p className="mt-1 text-sm text-[var(--gl-text-muted)] leading-relaxed">
                {error
                  ? error
                  : configured
                    ? 'Waiting for today’s export — browse Research or Methodology in the meantime.'
                    : 'Firebase is not configured in this environment.'}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-start">
        <GoalLabV2LiveMetrics layout="stack" />

        {/* Live forecasts */}
        <section className="space-y-4 lg:space-y-5" aria-labelledby="gl-v2-live-heading">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="gl-v2-live-heading"
                className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--gl-text)]"
              >
                Today&apos;s forecasts
              </h2>
              <p className="mt-1.5 text-sm text-[var(--gl-text-soft)] leading-relaxed">
                From the daily upload — tap a card for forecast detail, see historical league
                success and key signals.
              </p>
            </div>
            <HubFootballLink
              href={GOAL_LAB_V2_FIXTURES_PATH}
              className="text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline shrink-0"
            >
              View all forecasts →
            </HubFootballLink>
          </div>

          {!loading && grid.length > 0 ? (
            <div className="space-y-4">
              <ul className="grid gap-3 list-none m-0 p-0">
                {grid.map((fixture) => (
                  <li key={String(fixture.fixtureId)}>
                    <GoalLabV2FixtureCard fixture={fixture} dateKey={dateKey} />
                  </li>
                ))}
              </ul>
              {statStrikeAppStoreUrl ? (
                <p className="text-sm text-[var(--gl-text-soft)]">
                  More in the app — <StatStrikeAppStoreCta href={statStrikeAppStoreUrl} variant="inline" />
                </p>
              ) : null}
            </div>
          ) : !loading ? (
            <p className="text-sm text-[var(--gl-text-muted)]">No fixtures to preview for this date.</p>
          ) : (
            <ul className="grid gap-3 list-none m-0 p-0" aria-hidden>
              {Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="h-36 rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] animate-pulse"
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      <GoalLabV2ModelPipeline />

      {/* Research & insights */}
      <section className="space-y-6" aria-labelledby="gl-v2-insights-heading">
        <div>
          <h2 id="gl-v2-insights-heading" className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--gl-text)]">
            Research & insights
          </h2>
          <p className="mt-2 text-base text-[var(--gl-text-soft)] leading-relaxed max-w-2xl">
            Dig into algorithm selections, methodology notes, and longer-form writing.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3 list-none m-0 p-0">
          {[
            {
              href: GOAL_LAB_V2_RESEARCH_PATH,
              title: "Today's research selections",
              body: 'Consensus and per-model feeds for the day.',
            },
            {
              href: GOAL_LAB_V2_BLOG_PATH,
              title: 'Insights',
              body: 'Model updates and build notes.',
            },
            {
              href: AND_ANOTHER_THING_PATH,
              title: 'And Another Thing…',
              body: 'Shorter observations alongside the main work.',
            },
          ].map((item) => (
            <li key={item.href}>
              <HubFootballLink
                href={item.href}
                className="flex h-full flex-col rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-5 shadow-[var(--gl-shadow)] transition-colors hover:border-[var(--gl-border-strong)] outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gl-accent)]"
              >
                <span className="text-base font-semibold text-[var(--gl-text)]">{item.title}</span>
                <span className="mt-2 text-sm text-[var(--gl-text-soft)] leading-relaxed flex-1">{item.body}</span>
                <span className="mt-4 text-sm font-medium text-[var(--gl-accent)]">Open →</span>
              </HubFootballLink>
            </li>
          ))}
        </ul>
      </section>

      <GoalLabV2AppsStatus />
    </div>
  );
}
