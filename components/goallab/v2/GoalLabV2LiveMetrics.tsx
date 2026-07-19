'use client';

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { GOAL_LAB_V2_METHODOLOGY_PATH } from '@/components/goallab/v2/paths';
import type {
  HomepageHotStreakFixture,
  HomepageMetricsSnapshot,
} from '@/lib/statstrike/homepage-metrics';
import { isStatStrikeWebEnabled } from '@/lib/statstrike/enabled';

const STATSTRIKE_PATH = '/statstrike';

function formatPct(rate: number): string {
  return `${Math.round(rate * 1000) / 10}%`;
}

function formatRelative(iso: string | null | undefined, nowMs: number): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const diff = Math.max(0, nowMs - t);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function statusLabel(status: HomepageMetricsSnapshot['modelStatus']['status']): string {
  switch (status) {
    case 'live':
      return 'Live';
    case 'delayed':
      return 'Delayed';
    case 'stale':
      return 'Stale';
    default:
      return 'Status unknown';
  }
}

function MetricInfo({ text }: { text: string }) {
  return (
    <span
      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--gl-border-strong)] text-[10px] font-semibold text-[var(--gl-text-muted)]"
      title={text}
      aria-label={text}
    >
      i
    </span>
  );
}

function CardShell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-5 shadow-[var(--gl-shadow)] ${className}`}
    >
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="h-44 rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-5 animate-pulse">
      <div className="h-3 w-1/3 rounded bg-[var(--gl-elevated)]" />
      <div className="mt-4 h-7 w-2/3 rounded bg-[var(--gl-elevated)]" />
      <div className="mt-3 h-3 w-full rounded bg-[var(--gl-elevated)]" />
      <div className="mt-2 h-3 w-4/5 rounded bg-[var(--gl-elevated)]" />
    </div>
  );
}

function HotStreakDrawer({
  open,
  onClose,
  fixtures,
  count,
  titleId,
}: {
  open: boolean;
  onClose: () => void;
  fixtures: HomepageHotStreakFixture[];
  count: number;
  titleId: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close streak details"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-md flex-col border-l border-[var(--gl-border)] bg-[var(--gl-surface)] shadow-xl outline-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--gl-border)] px-5 py-4">
          <div>
            <h3 id={titleId} className="text-lg font-semibold text-[var(--gl-text)]">
              Current hot streak
            </h3>
            <p className="mt-1 text-sm text-[var(--gl-text-soft)]">
              {count} successful tip{count === 1 ? '' : 's'} in a row
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-[var(--gl-text-soft)] hover:bg-[var(--gl-elevated)]"
          >
            Close
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto list-none m-0 p-0 divide-y divide-[var(--gl-border)]">
          {fixtures.map((f) => (
            <li key={`${f.fixtureId}-${f.kickoffMs}`} className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-text-muted)]">
                {f.country ? `${f.country} · ${f.competition}` : f.competition}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--gl-text)]">
                {f.homeTeam} vs {f.awayTeam}
              </p>
              <p className="mt-1 text-sm text-[var(--gl-text-soft)]">Forecast: {f.forecast}</p>
              <p className="mt-0.5 text-sm text-[var(--gl-text-soft)]">
                FT: {f.homeScore}–{f.awayScore}
                <span className="ml-2 text-[var(--gl-text-muted)]">Successful</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function GoalLabV2LiveMetrics() {
  const [data, setData] = useState<HomepageMetricsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const titleId = useId();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/statstrike/homepage-metrics', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as HomepageMetricsSnapshot & { error?: string };
      setData(json);
      if (json.error && !json.hotStreak.count && !json.bestCompetition) {
        setError(json.error === 'admin-unconfigured' ? 'Metrics temporarily unavailable.' : json.error);
      }
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
      setNowMs(Date.now());
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <section className="space-y-6" aria-labelledby="gl-v2-live-metrics-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="gl-v2-live-metrics-heading"
            className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--gl-text)]"
          >
            Live engine
          </h2>
          <p className="mt-2 max-w-2xl text-base text-[var(--gl-text-soft)] leading-relaxed">
            Public snapshot of recent tip-band results — activity, form, and freshness from the same
            daily uploads that power StatStrike.
          </p>
        </div>
        {isStatStrikeWebEnabled() ? (
          <HubFootballLink
            href={STATSTRIKE_PATH}
            className="text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline shrink-0"
          >
            Open StatStrike →
          </HubFootballLink>
        ) : null}
      </div>

      {loading ? (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0" aria-busy="true">
          <li>
            <SkeletonCard />
          </li>
          <li>
            <SkeletonCard />
          </li>
          <li className="md:col-span-2 lg:col-span-1">
            <SkeletonCard />
          </li>
        </ul>
      ) : error && !data ? (
        <CardShell>
          <p className="text-sm font-medium text-[var(--gl-text)]">Latest metrics unavailable</p>
          <p className="mt-1 text-sm text-[var(--gl-text-muted)]">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 self-start text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </CardShell>
      ) : data ? (
        <>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0">
            <li>
              <CardShell>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-semibold text-[var(--gl-text)]">Current hot streak</h3>
                  <MetricInfo text={data.successDefinition} />
                </div>
                {data.hotStreak.count > 0 && data.hotStreak.latest ? (
                  <>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--gl-text)]">
                      {data.hotStreak.count}{' '}
                      <span className="text-base font-medium text-[var(--gl-text-soft)]">
                        successful forecast{data.hotStreak.count === 1 ? '' : 's'} in a row
                      </span>
                    </p>
                    <p className="mt-3 text-sm text-[var(--gl-text-soft)]">
                      {data.hotStreak.latest.country
                        ? `${data.hotStreak.latest.country} · ${data.hotStreak.latest.competition}`
                        : data.hotStreak.latest.competition}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--gl-text)]">
                      {data.hotStreak.latest.homeTeam} vs {data.hotStreak.latest.awayTeam}
                    </p>
                    <p className="mt-1 text-sm text-[var(--gl-text-soft)]">
                      Forecast: {data.hotStreak.latest.forecast}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--gl-text-soft)]">
                      FT: {data.hotStreak.latest.homeScore}–{data.hotStreak.latest.awayScore}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(true)}
                      className="mt-4 self-start text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
                    >
                      View all {data.hotStreak.count} fixtures
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-lg font-semibold text-[var(--gl-text)]">No active streak</p>
                    <p className="mt-2 text-sm text-[var(--gl-text-soft)] leading-relaxed">
                      The latest completed forecast ended the previous run.
                    </p>
                    {isStatStrikeWebEnabled() ? (
                      <HubFootballLink
                        href={STATSTRIKE_PATH}
                        className="mt-4 self-start text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
                      >
                        View recent results
                      </HubFootballLink>
                    ) : null}
                  </>
                )}
              </CardShell>
            </li>

            <li>
              <CardShell>
                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-semibold text-[var(--gl-text)]">
                    Best performing competition
                  </h3>
                  <MetricInfo text={data.successDefinition} />
                </div>
                {data.bestCompetition ? (
                  <>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--gl-text)]">
                      {data.bestCompetition.competitionName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--gl-text-soft)]">
                      {data.bestCompetition.country}
                      {data.bestCompetition.country ? ' · ' : ''}
                      {data.bestCompetition.periodLabel}
                    </p>
                    <p
                      className="mt-3 text-sm text-[var(--gl-text)]"
                      aria-label={`Primary forecast accuracy: ${formatPct(data.bestCompetition.performanceRate)} across ${data.bestCompetition.sampleSize} settled fixtures.`}
                    >
                      Primary forecast accuracy:{' '}
                      <span className="font-semibold">
                        {formatPct(data.bestCompetition.performanceRate)}
                      </span>
                      <span className="text-[var(--gl-text-muted)]">
                        {' '}
                        ({data.bestCompetition.sampleSize} settled)
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[var(--gl-text-soft)]">
                      Platform average: {formatPct(data.bestCompetition.platformAverage)}
                    </p>
                    {isStatStrikeWebEnabled() ? (
                      <HubFootballLink
                        href={STATSTRIKE_PATH}
                        className="mt-4 self-start text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
                      >
                        Explore in StatStrike
                      </HubFootballLink>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-lg font-semibold text-[var(--gl-text)]">
                      Not enough settled sample yet
                    </p>
                    <p className="mt-2 text-sm text-[var(--gl-text-soft)] leading-relaxed">
                      A competition needs at least 20 settled tip-band forecasts in the last 30 days
                      to qualify.
                    </p>
                  </>
                )}
              </CardShell>
            </li>

            <li className="md:col-span-2 lg:col-span-1">
              <CardShell>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--gl-text)]">Model status</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      data.modelStatus.status === 'live'
                        ? 'bg-[var(--gl-elevated)] text-[var(--gl-text)]'
                        : 'bg-[var(--gl-elevated)] text-[var(--gl-text-muted)]'
                    }`}
                  >
                    {statusLabel(data.modelStatus.status)}
                  </span>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--gl-text-soft)]">Last updated</dt>
                    <dd className="tabular-nums text-[var(--gl-text)] text-right">
                      {formatRelative(data.modelStatus.lastForecastUpdate, nowMs) ?? '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--gl-text-soft)]">Forecasts today</dt>
                    <dd className="tabular-nums text-[var(--gl-text)]">
                      {data.modelStatus.forecastsGeneratedToday}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--gl-text-soft)]">Active competitions</dt>
                    <dd className="tabular-nums text-[var(--gl-text)]">
                      {data.modelStatus.activeCompetitions}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[var(--gl-text-soft)]">Results processed today</dt>
                    <dd className="tabular-nums text-[var(--gl-text)]">
                      {data.modelStatus.resultsProcessedToday}
                    </dd>
                  </div>
                </dl>
                <HubFootballLink
                  href={GOAL_LAB_V2_METHODOLOGY_PATH}
                  className="mt-4 self-start text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
                >
                  How forecasts are scored
                </HubFootballLink>
              </CardShell>
            </li>
          </ul>

          <p className="text-sm text-[var(--gl-text-soft)]">
            Explore all current forecasts in{' '}
            {isStatStrikeWebEnabled() ? (
              <HubFootballLink
                href={STATSTRIKE_PATH}
                className="font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
              >
                StatStrike
              </HubFootballLink>
            ) : (
              'StatStrike'
            )}
            . These cards stay public even when the full board is membership-gated.
          </p>

          <HotStreakDrawer
            open={drawerOpen}
            onClose={closeDrawer}
            fixtures={data.hotStreak.fixtures}
            count={data.hotStreak.count}
            titleId={titleId}
          />
        </>
      ) : null}
    </section>
  );
}
