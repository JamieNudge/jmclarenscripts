'use client';

import { useEffect, useMemo, useState } from 'react';
import { get, ref } from 'firebase/database';
import { useParams, useSearchParams } from 'next/navigation';
import { FixtureMatchHistorySection } from '@/components/fixtures/FixtureMatchHistorySection';
import {
  fixtureDetailHrefV2,
  fixturesListHrefV2,
  GOAL_LAB_V2_FIXTURES_PATH,
} from '@/components/goallab/v2/paths';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import { useVisitorTimeZone } from '@/hooks/useVisitorTimeZone';
import {
  formatKickoffFromPickRecordLocalAndUtc,
  pickTeams,
  statStrikeRtdbPathsFromEnv,
  trackRecordDisplayForPick,
} from '@/lib/best-picks-firebase';
import {
  buildKeySignalLines,
  findSelectionStatsForFixture,
  fixtureContextRtdbPath,
  fixtureContextsDayRtdbPath,
  parseFixtureContextForFixture,
  type KeySignalLine,
} from '@/lib/fixture-key-signals';
import {
  findFixtureInExport,
  parseFixturesFromUnanimousExport,
  pickForecastDetailLines,
  pickScoreDisplay,
  sortFixturesByKickoff,
} from '@/lib/fixtures-browser';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

function pickText(v: unknown): string | null {
  if (typeof v === 'string') {
    const t = v.trim();
    return t ? t : null;
  }
  return null;
}

export function GoalLabV2FixtureDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const todayKey = useBestPicksLondonDateKey();
  const visitorTz = useVisitorTimeZone();
  const fixtureId = typeof params?.fixtureId === 'string' ? params.fixtureId : '';
  const dateKey = searchParams.get('date')?.trim() || todayKey;

  const [exportVal, setExportVal] = useState<unknown>(null);
  const [selectionVal, setSelectionVal] = useState<unknown>(null);
  const [contextVal, setContextVal] = useState<unknown>(null);
  const [contextLoadError, setContextLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { unanimousPath, selectionPath } = statStrikeRtdbPathsFromEnv(dateKey);
  const contextDirectPath = fixtureId ? fixtureContextRtdbPath(dateKey, fixtureId) : '';
  const contextDayPath = fixtureId ? fixtureContextsDayRtdbPath(dateKey) : '';
  const configured = isFirebaseClientConfigured();
  const listBackHref = fixturesListHrefV2(dateKey, todayKey);

  useEffect(() => {
    if (!configured || !fixtureId) {
      setLoading(false);
      setExportVal(null);
      setSelectionVal(null);
      setContextVal(null);
      setContextLoadError(null);
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

    const loadContext = async () => {
      const directSnap = await get(ref(db, contextDirectPath));
      if (directSnap.exists()) return directSnap.val();
      const daySnap = await get(ref(db, contextDayPath));
      return daySnap.val();
    };

    void Promise.all([
      get(ref(db, unanimousPath))
        .then((snap) => {
          if (cancelled) return;
          setError(null);
          setExportVal(snap.val());
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : 'Failed to load fixture export');
          setExportVal(null);
        }),
      get(ref(db, selectionPath))
        .then((snap) => {
          if (cancelled) return;
          setSelectionVal(snap.val());
        })
        .catch(() => {
          if (cancelled) return;
          setSelectionVal(null);
        }),
      loadContext()
        .then((val) => {
          if (cancelled) return;
          setContextLoadError(null);
          setContextVal(val);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setContextLoadError(err instanceof Error ? err.message : 'Failed to load fixture context');
          setContextVal(null);
        }),
    ]).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [configured, contextDayPath, contextDirectPath, fixtureId, selectionPath, unanimousPath]);

  const pick = useMemo(
    () => (fixtureId ? findFixtureInExport(exportVal, fixtureId) : null),
    [exportVal, fixtureId],
  );
  const teams = pick ? pickTeams(pick) : null;
  const forecast = pick ? pickForecastDetailLines(pick) : null;
  const context = useMemo(
    () => (fixtureId ? parseFixtureContextForFixture(contextVal, fixtureId) : null),
    [contextVal, fixtureId],
  );
  const selectionStats = useMemo(
    () => (fixtureId ? findSelectionStatsForFixture(selectionVal, fixtureId) : null),
    [fixtureId, selectionVal],
  );
  const keySignals: KeySignalLine[] = useMemo(() => {
    if (!pick || !teams) return [];
    return buildKeySignalLines(pick, teams.home, teams.away, context, selectionStats);
  }, [context, pick, selectionStats, teams]);
  const trackRecordDisplay = useMemo(
    () => (pick ? trackRecordDisplayForPick(pick, selectionVal) : null),
    [pick, selectionVal],
  );
  const kickoff = pick ? formatKickoffFromPickRecordLocalAndUtc(pick, visitorTz) : null;
  const country = pick ? pickText(pick.country) : null;
  const league = pick ? pickText(pick.league) : null;
  const venue = pick ? pickText(pick.venue) : null;
  const status = pick ? pickText(pick.status) : null;
  const score = pick ? pickScoreDisplay(pick) : null;
  const confidence =
    pick && typeof pick.confidence === 'number' && Number.isFinite(pick.confidence) && pick.confidence > 0
      ? Math.min(100, Math.round(pick.confidence))
      : null;

  const siblings = useMemo(
    () => sortFixturesByKickoff(parseFixturesFromUnanimousExport(exportVal)),
    [exportVal],
  );
  const siblingIndex = siblings.findIndex((f) => String(f.fixtureId) === fixtureId);
  const prev = siblingIndex > 0 ? siblings[siblingIndex - 1] : null;
  const next = siblingIndex >= 0 && siblingIndex < siblings.length - 1 ? siblings[siblingIndex + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14 space-y-8">
      <div>
        <HubFootballLink
          href={listBackHref}
          className="inline-flex items-center gap-2 text-sm text-[var(--gl-text-muted)] hover:text-[var(--gl-text)] transition-colors"
        >
          <span aria-hidden>←</span> Back to forecasts
        </HubFootballLink>
      </div>

      {!fixtureId ? <p className="text-sm text-[var(--gl-text)]">Missing fixture id.</p> : null}
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
      {configured && loading ? <p className="text-sm text-[var(--gl-text-muted)]">Loading fixture…</p> : null}
      {configured && !loading && !error && !pick ? (
        <p className="text-sm text-[var(--gl-text-soft)]">
          Fixture not found for <span className="tabular-nums">{dateKey}</span>.{' '}
          <HubFootballLink href={GOAL_LAB_V2_FIXTURES_PATH} className="text-[var(--gl-accent)] underline-offset-2 hover:underline">
            Browse forecasts
          </HubFootballLink>
        </p>
      ) : null}

      {configured && !loading && pick && teams ? (
        <div className="space-y-8">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-text-muted)]">
              {[country, league].filter(Boolean).join(' · ') || 'Fixture'}
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--gl-text)] leading-tight">
              {teams.home}
              <span className="mx-2 font-normal text-[var(--gl-text-muted)]">v</span>
              {teams.away}
            </h1>
            {kickoff ? <p className="text-sm tabular-nums text-[var(--gl-text-soft)]">{kickoff}</p> : null}
            {venue ? <p className="text-sm text-[var(--gl-text-muted)]">{venue}</p> : null}
            <p className="text-xl font-semibold tabular-nums text-[var(--gl-text)] pt-1">
              {score !== '–' ? score : '–'}
              {status ? <span className="ml-2 text-sm font-medium text-[var(--gl-text-muted)]">{status}</span> : null}
            </p>
          </header>

          {forecast ? (
            <section className="rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-5 md:p-6 shadow-[var(--gl-shadow)] space-y-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-accent)]">Forecast</h2>
              {forecast.primary ? (
                <p className="text-xl font-semibold text-[var(--gl-text)]">{forecast.primary}</p>
              ) : null}

              {confidence != null ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--gl-text-muted)]">Confidence</span>
                    <span className="font-semibold tabular-nums text-[var(--gl-text)]">{confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--gl-elevated)]" aria-hidden>
                    <div
                      className="h-full rounded-full bg-[var(--gl-accent)]"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2 border-t border-[var(--gl-border)] pt-4">
                {trackRecordDisplay ? (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--gl-text-muted)]">
                      {trackRecordDisplay.title}
                    </p>
                    <p className="text-sm text-[var(--gl-text-soft)] tabular-nums">
                      {trackRecordDisplay.trackRecord.forecastCount} archived forecast
                      {trackRecordDisplay.trackRecord.forecastCount === 1 ? '' : 's'}
                    </p>
                    <p className="text-sm text-[var(--gl-text-soft)] tabular-nums">
                      {Math.round(trackRecordDisplay.trackRecord.winRate)}% recent performance
                    </p>
                    <p className="text-sm font-semibold text-[var(--gl-text-soft)]">
                      {trackRecordDisplay.trackRecord.isQualified ? 'Qualified league' : 'League tracked'}
                    </p>
                    {trackRecordDisplay.helperText ? (
                      <p className="text-xs text-[var(--gl-text-muted)]">{trackRecordDisplay.helperText}</p>
                    ) : null}
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--gl-elevated)]">
                      <div
                        className="h-full rounded-full bg-[var(--gl-accent)]"
                        style={{
                          width: `${Math.max(4, Math.min(100, trackRecordDisplay.trackRecord.winRate))}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--gl-text-muted)]">
                      League track record
                    </p>
                    <p className="text-sm text-[var(--gl-text-soft)]">Building — no archived forecasts yet</p>
                  </>
                )}
              </div>

              {forecast.oddsDecimal != null ? (
                <div className="flex items-end justify-between gap-3 border-t border-[var(--gl-border)] pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--gl-text-muted)]">Odds</p>
                  <p className="text-sm font-semibold tabular-nums text-[var(--gl-accent)]">
                    @{forecast.oddsDecimal.toFixed(2)}
                  </p>
                </div>
              ) : null}

              {keySignals.length > 0 ? (
                <div className="border-t border-[var(--gl-border)] pt-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--gl-text-muted)]">
                    Key signals
                  </p>
                  <ul className="space-y-2.5 list-none m-0 p-0">
                    {keySignals.map((line) => (
                      <li key={line.id} className="flex items-start gap-2.5">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gl-success)]"
                          aria-hidden
                        />
                        <div className="min-w-0 text-sm leading-snug">
                          <span className="text-[var(--gl-text-soft)]">
                            {line.label}:{' '}
                            <span className="font-semibold tabular-nums text-[var(--gl-text)]">{line.value}</span>
                          </span>
                          {line.meta ? (
                            <span className="block text-xs text-[var(--gl-text-muted)] tabular-nums mt-0.5">
                              {line.meta}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {!context ? (
                    <p className="text-[11px] text-[var(--gl-text-muted)] leading-relaxed">
                      {contextLoadError
                        ? `Fixture context could not be loaded (${contextLoadError}).`
                        : selectionStats
                          ? 'Percentages are from selections. Game counts and date ranges need a Mac upload with fixture context.'
                          : 'Key signal percentages need selections stats on RTDB for this date.'}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="gl-v2-hub-bridge">
            {context ? (
              <FixtureMatchHistorySection context={context} homeTeam={teams.home} awayTeam={teams.away} />
            ) : (
              <p className="text-xs text-[var(--gl-text-muted)] border-t border-[var(--gl-border)] pt-4 leading-relaxed">
                {contextLoadError
                  ? 'Match history unavailable — fixture context could not be loaded.'
                  : 'Match history appears after the uploader writes fixture context for this date.'}
              </p>
            )}
          </div>

          {prev || next ? (
            <nav
              className="flex flex-col gap-3 sm:flex-row sm:justify-between border-t border-[var(--gl-border)] pt-6"
              aria-label="Adjacent fixtures"
            >
              {prev ? (
                <HubFootballLink
                  href={fixtureDetailHrefV2(prev.fixtureId, dateKey)}
                  className="text-sm text-[var(--gl-text-soft)] hover:text-[var(--gl-accent)]"
                >
                  ← {prev.home} v {prev.away}
                </HubFootballLink>
              ) : (
                <span />
              )}
              {next ? (
                <HubFootballLink
                  href={fixtureDetailHrefV2(next.fixtureId, dateKey)}
                  className="text-sm text-[var(--gl-text-soft)] hover:text-[var(--gl-accent)] sm:text-right"
                >
                  {next.home} v {next.away} →
                </HubFootballLink>
              ) : null}
            </nav>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
