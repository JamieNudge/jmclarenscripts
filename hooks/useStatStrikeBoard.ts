'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { onValue, ref, type Unsubscribe } from 'firebase/database';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { buildBoardRefreshResult, type BoardRefreshResult } from '@/lib/statstrike/board-merge';
import type { StatStrikeDailySelection } from '@/lib/statstrike/models';
import { parseDailySelection } from '@/lib/statstrike/parse-selection';
import {
  msUntilNextUkSelectionDay,
  selectionsPathForDateKey,
  ukSelectionDateKey,
  ukYesterdaySelectionDateKey,
} from '@/lib/statstrike/uk-date';

type BoardState = {
  loading: boolean;
  error: string | null;
  configured: boolean;
  todayKey: string;
  yesterdayKey: string;
  rows: BoardRefreshResult['rows'];
  lastReason: string;
};

const initialKeys = () => ({
  todayKey: ukSelectionDateKey(),
  yesterdayKey: ukYesterdaySelectionDateKey(),
});

export function useStatStrikeBoard() {
  const keys0 = initialKeys();
  const [state, setState] = useState<BoardState>({
    loading: true,
    error: null,
    configured: isFirebaseClientConfigured(),
    todayKey: keys0.todayKey,
    yesterdayKey: keys0.yesterdayKey,
    rows: [],
    lastReason: 'init',
  });

  const todaySel = useRef<StatStrikeDailySelection | null>(null);
  const yestSel = useRef<StatStrikeDailySelection | null>(null);
  const todayKeyRef = useRef(keys0.todayKey);
  const yesterdayKeyRef = useRef(keys0.yesterdayKey);

  const publish = useCallback((reason: string) => {
    const result = buildBoardRefreshResult({
      todayKey: todayKeyRef.current,
      yesterdayKey: yesterdayKeyRef.current,
      today: todaySel.current,
      yesterday: yestSel.current,
      reason,
    });
    setState((s) => ({
      ...s,
      loading: false,
      error: null,
      todayKey: result.todayKey,
      yesterdayKey: result.yesterdayKey,
      rows: result.rows,
      lastReason: reason,
    }));
  }, []);

  const hardRefreshKeys = useCallback(
    (reason: string) => {
      const todayKey = ukSelectionDateKey();
      const yesterdayKey = ukYesterdaySelectionDateKey();
      todayKeyRef.current = todayKey;
      yesterdayKeyRef.current = yesterdayKey;
      setState((s) => ({ ...s, todayKey, yesterdayKey, loading: true }));
      publish(reason);
      return { todayKey, yesterdayKey };
    },
    [publish],
  );

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

    let unsubs: Unsubscribe[] = [];
    let cancelled = false;

    const attach = (reason: string) => {
      for (const u of unsubs) u();
      unsubs = [];

      const todayKey = ukSelectionDateKey();
      const yesterdayKey = ukYesterdaySelectionDateKey();
      todayKeyRef.current = todayKey;
      yesterdayKeyRef.current = yesterdayKey;
      todaySel.current = null;
      yestSel.current = null;

      setState((s) => ({
        ...s,
        configured: true,
        loading: true,
        error: null,
        todayKey,
        yesterdayKey,
      }));

      const todayPath = selectionsPathForDateKey(todayKey);
      const yestPath = selectionsPathForDateKey(yesterdayKey);

      // Empty-board heal: always listen to today even if empty.
      unsubs.push(
        onValue(
          ref(db, todayPath),
          (snap) => {
            if (cancelled) return;
            todaySel.current = parseDailySelection(snap.val());
            publish(`${reason}:today`);
          },
          (err) => {
            if (cancelled) return;
            setState((s) => ({
              ...s,
              loading: false,
              error: err.message,
            }));
          },
        ),
      );

      unsubs.push(
        onValue(
          ref(db, yestPath),
          (snap) => {
            if (cancelled) return;
            yestSel.current = parseDailySelection(snap.val());
            publish(`${reason}:yesterday`);
          },
          () => {
            // Yesterday missing is fine.
            if (cancelled) return;
            yestSel.current = null;
            publish(`${reason}:yesterday-empty`);
          },
        ),
      );
    };

    attach('mount');

    let midnightTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleMidnight = () => {
      if (midnightTimer != null) clearTimeout(midnightTimer);
      // UK midnight + ~90s buffer (STATSTRIKE_MIDNIGHT_HANDOFF).
      const delay = msUntilNextUkSelectionDay() + 90_000;
      midnightTimer = setTimeout(() => {
        attach('selection-day-rollover');
        scheduleMidnight();
      }, delay);
    };
    scheduleMidnight();

    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      const nextToday = ukSelectionDateKey();
      if (nextToday !== todayKeyRef.current) {
        attach('visibility-new-day');
      } else {
        publish('visibility');
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      for (const u of unsubs) u();
      if (midnightTimer != null) clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [publish]);

  const reload = useCallback(() => {
    hardRefreshKeys('manual-reload');
    // Re-trigger by forcing remount via key change is heavy; listeners already live — republish.
    publish('manual-reload');
  }, [hardRefreshKeys, publish]);

  return {
    ...state,
    reload,
  };
}
