'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import {
  mergeUnanimousAndManual,
  parseLeaguePerformanceFromSelection,
  pickContextWarnings,
  pickDisplaySubtitle,
  pickDisplayTitle,
  pickExpandedMetaLines,
  pickGoalBandValues,
  pickPassesBestFilter,
  pickSignificantStats,
  picksDateStringInTimeZone,
  picksTimeZoneFromEnv,
  statStrikeRtdbPathsFromEnv,
  pickTeams,
  type PickRecord,
} from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

type PanelState = {
  picks: PickRecord[];
  loading: boolean;
  error: string | null;
  /** First snapshot received (may be empty). */
  ready: boolean;
};

/** ~3 collapsed rows visible; scroll inside when there are more or when rows expand. */
const LIST_MAX_HEIGHT = 'max-h-[min(13.5rem,36vh)]';

function bandAccentClass(label: string): string {
  switch (label) {
    case 'O2.5':
      return 'text-blue-300 border-blue-400/25 bg-blue-500/10';
    case 'O3.5':
      return 'text-emerald-300 border-emerald-400/25 bg-emerald-500/10';
    case 'O4.5':
      return 'text-orange-300 border-orange-400/25 bg-orange-500/10';
    case 'O5.5':
      return 'text-red-300 border-red-400/25 bg-red-500/10';
    case 'U2.5':
      return 'text-purple-300 border-purple-400/25 bg-purple-500/10';
    default:
      return 'text-sky-300 border-white/15 bg-white/10';
  }
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-white/45 shrink-0 mt-0.5 transition-transform duration-200 ${
        open ? 'rotate-90' : ''
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ExpandablePickRow({ pick, rowKey }: { pick: PickRecord; rowKey: string }) {
  const [open, setOpen] = useState(false);
  const title = pickDisplayTitle(pick);
  const sub = pickDisplaySubtitle(pick);
  const teams = pickTeams(pick);
  const bands = pickGoalBandValues(pick);
  const stats = pickSignificantStats(pick);
  const warnings = pickContextWarnings(pick);
  const meta = pickExpandedMetaLines(pick);
  const hasDetail =
    teams != null ||
    bands.length > 0 ||
    stats.length > 0 ||
    warnings.length > 0 ||
    meta.length > 0;

  return (
    <li className="rounded-xl border border-white/10 bg-black/20 overflow-hidden shrink-0">
      <button
        type="button"
        id={`pick-trigger-${rowKey}`}
        aria-expanded={open}
        aria-controls={`pick-panel-${rowKey}`}
        disabled={!hasDetail}
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={`w-full text-left px-3 py-2.5 flex items-start gap-2 ${
          hasDetail ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-snug">{title}</p>
          {sub && <p className="text-xs text-white/55 mt-0.5 leading-snug">{sub}</p>}
        </div>
        {hasDetail ? <Chevron open={open} /> : null}
      </button>

      {open && hasDetail && (
        <div
          id={`pick-panel-${rowKey}`}
          role="region"
          aria-labelledby={`pick-trigger-${rowKey}`}
          className="px-3 pb-3 pt-2 border-t border-white/10 space-y-3 text-xs text-white/80"
        >
          {teams && (
            <div className="space-y-0.5">
              <p className="font-semibold text-white/90">{teams.home}</p>
              <p className="text-[10px] text-white/40 pl-0.5">v</p>
              <p className="font-semibold text-white/90">{teams.away}</p>
            </div>
          )}

          {meta.length > 0 && (
            <ul className="space-y-1 text-white/65 list-none">
              {meta.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}

          {bands.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45 mb-1.5">
                Goal bands
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bands.map(({ label, value }) => (
                  <span
                    key={label}
                    className={`inline-flex flex-col items-center px-2 py-1 rounded-lg border min-w-[2.75rem] ${bandAccentClass(
                      label,
                    )}`}
                  >
                    <span className="text-[10px] font-bold opacity-95">{label}</span>
                    <span className="text-[11px] font-semibold text-white/90">{value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/80 mb-1.5 flex items-center gap-1">
                <span aria-hidden>★</span> Key stats
              </p>
              <div className="flex flex-wrap gap-1">
                {stats.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-100/90 text-[11px] font-medium border border-amber-400/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-orange-300/90">Notes</p>
              {warnings.map((w) => (
                <p key={w} className="text-orange-200/85 leading-relaxed">
                  {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function PickPanel({
  label,
  state,
  leagueWinRates,
}: {
  label: string;
  state: PanelState;
  leagueWinRates: Record<string, number>;
}) {
  const filtered = state.picks.filter((p) => pickPassesBestFilter(p, leagueWinRates));
  const hasLp = Object.keys(leagueWinRates).length > 0;
  /** Do not wait for `selections/{date}`: empty league map already filters non-manual picks; manual rows must show immediately. */
  const waiting = state.loading || !state.ready;

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 min-h-[160px] flex flex-col justify-start">
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2 shrink-0">{label}</h2>

      {state.error && (
        <p className="text-sm text-red-300/90 leading-relaxed" role="alert">
          {state.error}
        </p>
      )}

      {!state.error && waiting && (
        <p className="text-sm text-white/60 leading-relaxed">Loading picks…</p>
      )}

      {!state.error && !waiting && state.picks.length === 0 && (
        <p className="text-sm text-white/60 leading-relaxed">
          Nothing in today&apos;s unanimous export for this band yet.
        </p>
      )}

      {!state.error &&
        !waiting &&
        state.picks.length > 0 &&
        !hasLp &&
        filtered.length === 0 && (
        <p className="text-sm text-white/60 leading-relaxed">
          Today&apos;s selection has no <code className="text-xs text-white/50">leaguePerformance</code>{' '}
          map (no leagues met the best-performing threshold, or data not uploaded).
        </p>
      )}

      {!state.error && !waiting && state.picks.length > 0 && hasLp && filtered.length === 0 && (
        <p className="text-sm text-white/60 leading-relaxed">
          No picks in leagues that qualify as best-performing today.
        </p>
      )}

      {!state.error && !waiting && filtered.length > 0 && (
        <div
          className={`mt-1 min-h-0 ${LIST_MAX_HEIGHT} overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth`}
        >
          <ul className="space-y-2 pb-0.5">
            {filtered.map((p, i) => {
              const key =
                (typeof p.id === 'number' && String(p.id)) ||
                (typeof p.id === 'string' && p.id) ||
                `${pickDisplayTitle(p)}-${i}`;
              return <ExpandablePickRow key={key} pick={p} rowKey={`${label}-${key}`} />;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FirebasePicksPanels() {
  const startLoading = isFirebaseClientConfigured();
  const dateKey = useMemo(() => {
    const tz = picksTimeZoneFromEnv();
    return picksDateStringInTimeZone(tz);
  }, []);

  const [over, setOver] = useState<PanelState>({
    picks: [],
    loading: startLoading,
    error: null,
    ready: false,
  });
  const [under, setUnder] = useState<PanelState>({
    picks: [],
    loading: startLoading,
    error: null,
    ready: false,
  });
  const [leagueWinRates, setLeagueWinRates] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setOver({ picks: [], loading: false, error: null, ready: true });
      setUnder({ picks: [], loading: false, error: null, ready: true });
      return;
    }

    const db = getFirebaseRealtimeDb();
    if (!db) {
      const err = 'Could not open Realtime Database.';
      setOver((s) => ({ ...s, loading: false, error: err, ready: true }));
      setUnder((s) => ({ ...s, loading: false, error: err, ready: true }));
      return;
    }

    const { unanimousPath, selectionPath, manualExportsPath } = statStrikeRtdbPathsFromEnv(dateKey);
    const unanimousRef = ref(db, unanimousPath);
    const manualRef = ref(db, manualExportsPath);
    const selectionRef = ref(db, selectionPath);

    let unanimousVal: unknown = null;
    let manualVal: unknown = null;
    /** When set, unanimous path failed — still merge manual picks; use null for forecaster side. */
    let unanimousError: string | null = null;

    const publishMerged = () => {
      const uni = unanimousError != null ? null : unanimousVal;
      const { over: o, under: u } = mergeUnanimousAndManual(uni, manualVal);
      const hasAny = o.length > 0 || u.length > 0;
      const blockError = unanimousError != null && !hasAny ? unanimousError : null;
      setOver({ picks: o, loading: false, error: blockError, ready: true });
      setUnder({ picks: u, loading: false, error: blockError, ready: true });
    };

    const unsubUnanimous = onValue(
      unanimousRef,
      (snap) => {
        unanimousError = null;
        unanimousVal = snap.val();
        publishMerged();
      },
      (err) => {
        unanimousError = err.message;
        unanimousVal = null;
        publishMerged();
      },
    );

    const unsubManual = onValue(
      manualRef,
      (snap) => {
        manualVal = snap.val();
        publishMerged();
      },
      (err) => {
        console.error('manualExports listener:', err);
        manualVal = null;
        publishMerged();
      },
    );

    const unsubSelection = onValue(
      selectionRef,
      (snap) => {
        setLeagueWinRates(parseLeaguePerformanceFromSelection(snap.val()));
      },
      () => {
        setLeagueWinRates({});
      },
    );

    return () => {
      unsubUnanimous();
      unsubManual();
      unsubSelection();
    };
  }, [dateKey]);

  const configHint = !isFirebaseClientConfigured();

  return (
    <>
      <p className="sm:col-span-2 text-[11px] text-white/40 -mt-2 mb-1 leading-relaxed">
        Data paths use calendar date{' '}
        <code className="text-white/55 text-[10px]">{dateKey}</code>
        <span className="text-white/30"> · {picksTimeZoneFromEnv()}</span>
        {' — '}admin saves must use the same date to appear here.
      </p>
      {configHint && (
        <div className="sm:col-span-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95 leading-relaxed">
          Firebase is not configured. Copy{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">.env.example</code> to{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">.env.local</code>, add your
          web app keys and Realtime Database URL, then restart{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">npm run dev</code>.
        </div>
      )}
      <PickPanel label="Over 2.5" state={over} leagueWinRates={leagueWinRates} />
      <PickPanel label="Under 2.5" state={under} leagueWinRates={leagueWinRates} />
    </>
  );
}
