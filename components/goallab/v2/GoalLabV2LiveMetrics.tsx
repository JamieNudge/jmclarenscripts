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

const STREAK_TZ = 'Europe/London';

function formatStreakDay(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: STREAK_TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(t));
}

function formatStreakDayTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: STREAK_TZ,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(t));
}

/** e.g. "Fri 17 Jul 2026 – Sun 19 Jul 2026" or a single day when the run is same-day. */
function formatStreakPeriod(startedAt: string | null, endedAt: string | null): string | null {
  if (!startedAt && !endedAt) return null;
  if (!startedAt) return endedAt ? formatStreakDay(endedAt) : null;
  if (!endedAt) return formatStreakDay(startedAt);
  const startDay = formatStreakDay(startedAt);
  const endDay = formatStreakDay(endedAt);
  if (startDay === endDay) return startDay;
  return `${startDay} – ${endDay}`;
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

/** Small decorative mark — aria-hidden; title text carries meaning. */
function MetricMark({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span
      className="mr-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[13px] leading-none"
      title={label}
      aria-hidden
    >
      {emoji}
    </span>
  );
}

type CardAccent = 'streak' | 'competition' | 'status' | 'none';

const CARD_ACCENT: Record<CardAccent, string> = {
  none: '',
  // Warm ember — restrained, not casino neon
  streak: 'border-l-[3px] border-l-amber-500/70 bg-gradient-to-br from-amber-50/80 to-transparent',
  // Cool analytical teal
  competition: 'border-l-[3px] border-l-teal-600/60 bg-gradient-to-br from-teal-50/70 to-transparent',
  // Neutral slate with a hint of navy (GoalLab accent family)
  status: 'border-l-[3px] border-l-[var(--gl-accent)]/50 bg-gradient-to-br from-slate-50/90 to-transparent',
};

function CardShell({
  children,
  className = '',
  accent = 'none',
}: {
  children: ReactNode;
  className?: string;
  accent?: CardAccent;
}) {
  const pad = className.includes('!p-') ? className : `p-5 ${className}`;
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] shadow-[var(--gl-shadow)] ${CARD_ACCENT[accent]} ${pad}`}
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
  periodLabel,
}: {
  open: boolean;
  onClose: () => void;
  fixtures: HomepageHotStreakFixture[];
  count: number;
  titleId: string;
  periodLabel: string | null;
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
              Hottest streak last 30 days
            </h3>
            <p className="mt-1 text-sm text-[var(--gl-text-soft)]">
              {count} successful fixture tip{count === 1 ? '' : 's'} in a row
            </p>
            {periodLabel ? (
              <p className="mt-1 text-sm tabular-nums text-[var(--gl-text-muted)]">{periodLabel}</p>
            ) : null}
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
              <p className="mt-0.5 text-xs tabular-nums text-[var(--gl-text-muted)]">
                {formatStreakDayTime(new Date(f.kickoffMs).toISOString())} UK
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

export function GoalLabV2LiveMetrics({ layout = 'row' }: { layout?: 'row' | 'stack' }) {
  const [data, setData] = useState<HomepageMetricsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const titleId = useId();
  const cardGridClass =
    layout === 'stack'
      ? 'grid gap-3 list-none m-0 p-0'
      : 'grid gap-4 md:grid-cols-2 lg:grid-cols-3 list-none m-0 p-0';
  const cardClass = layout === 'stack' ? '!p-4' : '';
  const headingClass =
    layout === 'stack'
      ? 'text-xl md:text-2xl font-semibold tracking-tight text-[var(--gl-text)]'
      : 'text-2xl md:text-3xl font-semibold tracking-tight text-[var(--gl-text)]';
  const introClass =
    layout === 'stack'
      ? 'mt-1.5 text-sm text-[var(--gl-text-soft)] leading-relaxed'
      : 'mt-2 max-w-2xl text-base text-[var(--gl-text-soft)] leading-relaxed';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/statstrike/homepage-metrics', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as HomepageMetricsSnapshot & { error?: string };
      setData(json);
      if (json.error && !json.hotStreak.hottest30d.count && !json.bestCompetition) {
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
  const hottest = data?.hotStreak.hottest30d;
  const todayStreak = data?.hotStreak.today;
  const streakPeriod = hottest
    ? formatStreakPeriod(hottest.startedAt, hottest.lastUpdatedAt)
    : null;
  const avgLabel =
    data?.hotStreak.averageRunLength7d != null
      ? (Math.round(data.hotStreak.averageRunLength7d * 10) / 10).toFixed(1)
      : null;

  return (
    <section className="space-y-4 lg:space-y-5" aria-labelledby="gl-v2-live-metrics-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="gl-v2-live-metrics-heading" className={headingClass}>
            Live engine
          </h2>
          <p className={introClass}>
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
        <ul className={cardGridClass} aria-busy="true">
          <li>
            <SkeletonCard />
          </li>
          <li>
            <SkeletonCard />
          </li>
          <li>
            <SkeletonCard />
          </li>
        </ul>
      ) : error && !data ? (
        <CardShell className={cardClass}>
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
          <ul className={cardGridClass}>
            <li>
              <CardShell className={cardClass} accent="streak">
                <div className="flex items-center gap-1">
                  <MetricMark emoji="🔥" label="Hot streak" />
                  <h3 className="text-sm font-semibold text-[var(--gl-text)]">Hot streaks</h3>
                  <MetricInfo text={data.successDefinition} />
                </div>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--gl-text-muted)]">
                  Fixture tips · all competitions
                </p>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-amber-500/10 px-1.5 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/70">
                      Hottest 30d
                    </dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--gl-text)]">
                      {hottest?.count ?? 0}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 px-1.5 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/70">
                      Today
                    </dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--gl-text)]">
                      {todayStreak?.count ?? 0}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 px-1.5 py-2">
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/70">
                      7d avg
                    </dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--gl-text)]">
                      {avgLabel ?? '—'}
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-[11px] text-[var(--gl-text-muted)] leading-snug">
                  Today: {todayStreak?.successfulCount ?? 0}/{todayStreak?.settledCount ?? 0}{' '}
                  successful
                  {data.hotStreak.runCount7d > 0
                    ? ` · ${data.hotStreak.runCount7d} run${data.hotStreak.runCount7d === 1 ? '' : 's'} in 7d`
                    : ''}
                </p>
                {hottest && hottest.count > 0 && hottest.latest ? (
                  <>
                    {streakPeriod ? (
                      <p className="mt-3 text-sm tabular-nums text-[var(--gl-text-soft)]">
                        Hottest streak (30 days): {streakPeriod}
                        <span className="text-[var(--gl-text-muted)]"> · UK</span>
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--gl-text-soft)]">
                        Hottest streak last {data.hotStreak.hottestWindowDays} days
                      </p>
                    )}
                    <p className="mt-2 text-sm font-medium text-[var(--gl-text)]">
                      {hottest.latest.homeTeam} vs {hottest.latest.awayTeam}
                    </p>
                    <p className="mt-1 text-sm text-[var(--gl-text-soft)]">
                      Forecast: {hottest.latest.forecast}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--gl-text-soft)]">
                      FT: {hottest.latest.homeScore}–{hottest.latest.awayScore}
                    </p>
                    <p className="mt-2 text-xs text-[var(--gl-text-muted)]">
                      {hottest.latest.country
                        ? `${hottest.latest.country} · ${hottest.latest.competition}`
                        : hottest.latest.competition}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(true)}
                      className="mt-4 self-start text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
                    >
                      View all {hottest.count} fixtures in hottest streak
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-lg font-semibold text-[var(--gl-text)]">No hot streak yet</p>
                    <p className="mt-2 text-sm text-[var(--gl-text-soft)] leading-relaxed">
                      No consecutive successful fixture tips in the last{' '}
                      {data.hotStreak.hottestWindowDays} days.
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
              <CardShell className={cardClass} accent="competition">
                <div className="flex items-center gap-1">
                  <MetricMark emoji="📊" label="Best performing competition" />
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

            <li>
              <CardShell className={cardClass} accent="status">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <MetricMark emoji="📡" label="Model status" />
                    <h3 className="text-sm font-semibold text-[var(--gl-text)]">Model status</h3>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      data.modelStatus.status === 'live'
                        ? 'bg-teal-600/15 text-teal-800'
                        : data.modelStatus.status === 'delayed'
                          ? 'bg-amber-500/15 text-amber-900'
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
            fixtures={data.hotStreak.hottest30d.fixtures}
            count={data.hotStreak.hottest30d.count}
            titleId={titleId}
            periodLabel={streakPeriod ? `${streakPeriod} · UK` : null}
          />
        </>
      ) : null}
    </section>
  );
}
