'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { get, ref } from 'firebase/database';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { buildBoardRefreshResult, type BoardRefreshResult } from '@/lib/statstrike/board-merge';
import {
  parseBTTSSelectionsPayload,
  type BTTSSelectionPick,
} from '@/lib/statstrike/btts-selections';
import type { StatStrikeDailySelection } from '@/lib/statstrike/models';
import { parseDailySelection } from '@/lib/statstrike/parse-selection';
import {
  bttsSelectionsPathForDateKey,
  msUntilNextUkSelectionDay,
  selectionsPathForDateKey,
  ukSelectionDateKey,
  ukSelectionDateKeyOffset,
} from '@/lib/statstrike/uk-date';

/** Visible-tab board refresh cadence. Avoids RTDB onValue fan-out on fat /selections nodes. */
const BOARD_POLL_MS = 15 * 60_000;
/** Max one focus catch-up get() per this window (no full re-subscribe). */
const FOCUS_REFRESH_MIN_MS = 5 * 60_000;

type BoardState = {
  loading: boolean;
  error: string | null;
  configured: boolean;
  /** Selected UK selection day (may differ from calendar today when browsing). */
  todayKey: string;
  yesterdayKey: string;
  /** Offset from UK calendar today: 0 = today, -1 = yesterday, +1 = tomorrow. */
  dayOffset: number;
  rows: BoardRefreshResult['rows'];
  lastReason: string;
};

function keysForOffset(dayOffset: number) {
  const todayKey = ukSelectionDateKeyOffset(dayOffset);
  const yesterdayKey = ukSelectionDateKeyOffset(dayOffset - 1);
  return { todayKey, yesterdayKey };
}

export function useStatStrikeBoard(initialDayOffset = 0) {
  const keys0 = keysForOffset(initialDayOffset);
  const [dayOffset, setDayOffsetState] = useState(initialDayOffset);
  const [state, setState] = useState<BoardState>({
    loading: true,
    error: null,
    configured: isFirebaseClientConfigured(),
    todayKey: keys0.todayKey,
    yesterdayKey: keys0.yesterdayKey,
    dayOffset: initialDayOffset,
    rows: [],
    lastReason: 'init',
  });

  const todaySel = useRef<StatStrikeDailySelection | null>(null);
  const yestSel = useRef<StatStrikeDailySelection | null>(null);
  const todayBTTS = useRef<Map<number, BTTSSelectionPick> | null>(null);
  const yestBTTS = useRef<Map<number, BTTSSelectionPick> | null>(null);
  const todayKeyRef = useRef(keys0.todayKey);
  const yesterdayKeyRef = useRef(keys0.yesterdayKey);
  const dayOffsetRef = useRef(initialDayOffset);
  const lastFetchAtRef = useRef(0);
  const fetchInFlightRef = useRef<Promise<void> | null>(null);
  const fetchBoardRef = useRef<(reason: string, opts?: { showLoading?: boolean }) => Promise<void>>(
    async () => {},
  );

  const publish = useCallback((reason: string) => {
    const viewingCurrentDay = dayOffsetRef.current === 0;
    const result = buildBoardRefreshResult({
      todayKey: todayKeyRef.current,
      yesterdayKey: yesterdayKeyRef.current,
      today: todaySel.current,
      yesterday: viewingCurrentDay ? yestSel.current : null,
      includeYesterdayCarryOver: viewingCurrentDay,
      todayBTTSPicks: todayBTTS.current,
      yesterdayBTTSPicks: viewingCurrentDay ? yestBTTS.current : null,
      reason,
    });
    setState((s) => ({
      ...s,
      loading: false,
      error: null,
      todayKey: result.todayKey,
      yesterdayKey: result.yesterdayKey,
      dayOffset: dayOffsetRef.current,
      rows: result.rows,
      lastReason: reason,
    }));
  }, []);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setState((s) => ({
        ...s,
        loading: false,
        configured: false,
        error: null,
        rows: [],
      }));
      return;
    }

    const db = getFirebaseRealtimeDb();
    if (!db) {
      setState((s) => ({
        ...s,
        loading: false,
        configured: false,
        error: 'Firebase database unavailable',
        rows: [],
      }));
      return;
    }

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let midnightTimer: ReturnType<typeof setTimeout> | undefined;

    const fetchBoard = async (reason: string, opts?: { showLoading?: boolean }) => {
      if (cancelled) return;
      // Serialize requests so day-nav during an in-flight fetch still runs after.
      while (fetchInFlightRef.current) {
        await fetchInFlightRef.current;
        if (cancelled) return;
      }

      const run = (async () => {
        const { todayKey, yesterdayKey } = keysForOffset(dayOffsetRef.current);
        const viewingCurrentDay = dayOffsetRef.current === 0;
        todayKeyRef.current = todayKey;
        yesterdayKeyRef.current = yesterdayKey;

        if (opts?.showLoading) {
          setState((s) => ({
            ...s,
            configured: true,
            loading: true,
            error: null,
            todayKey,
            yesterdayKey,
            dayOffset: dayOffsetRef.current,
          }));
        } else {
          setState((s) => ({
            ...s,
            configured: true,
            todayKey,
            yesterdayKey,
            dayOffset: dayOffsetRef.current,
          }));
        }

        try {
          const todayPath = selectionsPathForDateKey(todayKey);
          const todayBTTSPath = bttsSelectionsPathForDateKey(todayKey);

          const reads: Promise<void>[] = [
            get(ref(db, todayPath)).then((snap) => {
              todaySel.current = parseDailySelection(snap.val());
            }),
            get(ref(db, todayBTTSPath))
              .then((snap) => {
                todayBTTS.current =
                  parseBTTSSelectionsPayload(snap.val())?.picksByFixtureId ?? new Map();
              })
              .catch(() => {
                todayBTTS.current = new Map();
              }),
          ];

          if (viewingCurrentDay) {
            const yestPath = selectionsPathForDateKey(yesterdayKey);
            const yestBTTSPath = bttsSelectionsPathForDateKey(yesterdayKey);
            reads.push(
              get(ref(db, yestPath))
                .then((snap) => {
                  yestSel.current = parseDailySelection(snap.val());
                })
                .catch(() => {
                  yestSel.current = null;
                }),
              get(ref(db, yestBTTSPath))
                .then((snap) => {
                  yestBTTS.current =
                    parseBTTSSelectionsPayload(snap.val())?.picksByFixtureId ?? new Map();
                })
                .catch(() => {
                  yestBTTS.current = new Map();
                }),
            );
          } else {
            yestSel.current = null;
            yestBTTS.current = null;
          }

          await Promise.all(reads);
          if (cancelled) return;
          lastFetchAtRef.current = Date.now();
          publish(reason);
        } catch (e) {
          if (cancelled) return;
          setState((s) => ({
            ...s,
            loading: false,
            error: e instanceof Error ? e.message : 'Failed to load board',
          }));
        }
      })();

      fetchInFlightRef.current = run;
      try {
        await run;
      } finally {
        if (fetchInFlightRef.current === run) {
          fetchInFlightRef.current = null;
        }
      }
    };

    fetchBoardRef.current = fetchBoard;

    const clearPoll = () => {
      if (pollTimer != null) {
        clearInterval(pollTimer);
        pollTimer = undefined;
      }
    };

    const startPollIfVisible = () => {
      clearPoll();
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      pollTimer = setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        void fetchBoard('poll');
      }, BOARD_POLL_MS);
    };

    void fetchBoard('mount', { showLoading: true }).then(() => {
      if (!cancelled) startPollIfVisible();
    });

    const scheduleMidnight = () => {
      if (midnightTimer != null) clearTimeout(midnightTimer);
      const delay = msUntilNextUkSelectionDay() + 90_000;
      midnightTimer = setTimeout(() => {
        void fetchBoard(
          dayOffsetRef.current === 0 ? 'selection-day-rollover' : 'selection-day-rollover-offset',
          { showLoading: true },
        ).then(() => {
          if (!cancelled) startPollIfVisible();
        });
        scheduleMidnight();
      }, delay);
    };
    scheduleMidnight();

    const onVis = () => {
      if (document.visibilityState !== 'visible') {
        clearPoll();
        return;
      }

      startPollIfVisible();

      if (dayOffsetRef.current === 0) {
        const nextToday = ukSelectionDateKey();
        if (nextToday !== todayKeyRef.current) {
          void fetchBoard('visibility-new-day', { showLoading: true });
          return;
        }
      }

      const staleMs = Date.now() - lastFetchAtRef.current;
      if (staleMs >= FOCUS_REFRESH_MIN_MS) {
        void fetchBoard('visibility-throttle-refresh');
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      clearPoll();
      if (midnightTimer != null) clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [publish]);

  const setDayOffset = useCallback((next: number) => {
    dayOffsetRef.current = next;
    setDayOffsetState(next);
    void fetchBoardRef.current('day-nav', { showLoading: true });
  }, []);

  const reload = useCallback(() => {
    void fetchBoardRef.current('manual-reload', { showLoading: true });
  }, []);

  const selectionDateLabel = (() => {
    if (dayOffset === 0) return 'Today';
    if (dayOffset === -1) return 'Yesterday';
    if (dayOffset === 1) return 'Tomorrow';
    return state.todayKey;
  })();

  return {
    ...state,
    dayOffset,
    setDayOffset,
    selectionDateLabel,
    reload,
  };
}
