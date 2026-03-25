'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import {
  parseLeaguePerformanceFromSelection,
  parseUnanimousExport,
  pickDisplaySubtitle,
  pickDisplayTitle,
  pickPassesBestFilter,
  picksDateStringInTimeZone,
  picksTimeZoneFromEnv,
  statStrikeRtdbPathsFromEnv,
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

function PickPanel({
  label,
  state,
  leagueWinRates,
  selectionReady,
}: {
  label: string;
  state: PanelState;
  leagueWinRates: Record<string, number>;
  selectionReady: boolean;
}) {
  const filtered = state.picks.filter((p) => pickPassesBestFilter(p, leagueWinRates));
  const hasLp = Object.keys(leagueWinRates).length > 0;
  const waiting = state.loading || !state.ready || !selectionReady;

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 min-h-[160px] flex flex-col justify-center">
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2">{label}</h2>

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

      {!state.error && !waiting && state.picks.length > 0 && !hasLp && (
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
        <ul className="space-y-3 mt-1">
          {filtered.map((p, i) => {
            const key =
              (typeof p.id === 'number' && String(p.id)) ||
              (typeof p.id === 'string' && p.id) ||
              `${pickDisplayTitle(p)}-${i}`;
            const sub = pickDisplaySubtitle(p);
            return (
              <li
                key={key}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
              >
                <p className="text-sm font-medium text-white">{pickDisplayTitle(p)}</p>
                {sub && <p className="text-xs text-white/55 mt-0.5">{sub}</p>}
              </li>
            );
          })}
        </ul>
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
  const [selectionReady, setSelectionReady] = useState(false);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setOver({ picks: [], loading: false, error: null, ready: true });
      setUnder({ picks: [], loading: false, error: null, ready: true });
      setSelectionReady(true);
      return;
    }

    const db = getFirebaseRealtimeDb();
    if (!db) {
      const err = 'Could not open Realtime Database.';
      setOver((s) => ({ ...s, loading: false, error: err, ready: true }));
      setUnder((s) => ({ ...s, loading: false, error: err, ready: true }));
      setSelectionReady(true);
      return;
    }

    const { unanimousPath, selectionPath } = statStrikeRtdbPathsFromEnv(dateKey);
    const unanimousRef = ref(db, unanimousPath);
    const selectionRef = ref(db, selectionPath);

    const unsubUnanimous = onValue(
      unanimousRef,
      (snap) => {
        const { over: o, under: u } = parseUnanimousExport(snap.val());
        setOver({ picks: o, loading: false, error: null, ready: true });
        setUnder({ picks: u, loading: false, error: null, ready: true });
      },
      (err) => {
        setOver({ picks: [], loading: false, error: err.message, ready: true });
        setUnder({ picks: [], loading: false, error: err.message, ready: true });
      },
    );

    const unsubSelection = onValue(
      selectionRef,
      (snap) => {
        setLeagueWinRates(parseLeaguePerformanceFromSelection(snap.val()));
        setSelectionReady(true);
      },
      () => {
        setLeagueWinRates({});
        setSelectionReady(true);
      },
    );

    return () => {
      unsubUnanimous();
      unsubSelection();
    };
  }, [dateKey]);

  const configHint = !isFirebaseClientConfigured();

  return (
    <>
      {configHint && (
        <div className="sm:col-span-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95 leading-relaxed">
          Firebase is not configured. Copy{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">.env.example</code> to{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">.env.local</code>, add your
          web app keys and Realtime Database URL, then restart{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">npm run dev</code>.
        </div>
      )}
      <PickPanel
        label="Over 2.5"
        state={over}
        leagueWinRates={leagueWinRates}
        selectionReady={selectionReady}
      />
      <PickPanel
        label="Under 2.5"
        state={under}
        leagueWinRates={leagueWinRates}
        selectionReady={selectionReady}
      />
    </>
  );
}
