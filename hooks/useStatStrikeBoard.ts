'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { onValue, ref, type Unsubscribe } from 'firebase/database';
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

  const attachRef = useRef<(reason: string) => void>(() => {});

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

      const { todayKey, yesterdayKey } = keysForOffset(dayOffsetRef.current);
      const viewingCurrentDay = dayOffsetRef.current === 0;
      todayKeyRef.current = todayKey;
      yesterdayKeyRef.current = yesterdayKey;
      todaySel.current = null;
      yestSel.current = null;
      todayBTTS.current = null;
      yestBTTS.current = null;

      setState((s) => ({
        ...s,
        configured: true,
        loading: true,
        error: null,
        todayKey,
        yesterdayKey,
        dayOffset: dayOffsetRef.current,
      }));

      const todayPath = selectionsPathForDateKey(todayKey);
      const todayBTTSPath = bttsSelectionsPathForDateKey(todayKey);

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
          ref(db, todayBTTSPath),
          (snap) => {
            if (cancelled) return;
            todayBTTS.current = parseBTTSSelectionsPayload(snap.val())?.picksByFixtureId ?? new Map();
            publish(`${reason}:today-btts`);
          },
          () => {
            if (cancelled) return;
            todayBTTS.current = new Map();
            publish(`${reason}:today-btts-empty`);
          },
        ),
      );

      // Previous-day live carry-over only while viewing UK calendar today (iOS isCurrentSelectionDay).
      if (viewingCurrentDay) {
        const yestPath = selectionsPathForDateKey(yesterdayKey);
        const yestBTTSPath = bttsSelectionsPathForDateKey(yesterdayKey);
        unsubs.push(
          onValue(
            ref(db, yestPath),
            (snap) => {
              if (cancelled) return;
              yestSel.current = parseDailySelection(snap.val());
              publish(`${reason}:yesterday`);
            },
            () => {
              if (cancelled) return;
              yestSel.current = null;
              publish(`${reason}:yesterday-empty`);
            },
          ),
        );
        unsubs.push(
          onValue(
            ref(db, yestBTTSPath),
            (snap) => {
              if (cancelled) return;
              yestBTTS.current = parseBTTSSelectionsPayload(snap.val())?.picksByFixtureId ?? new Map();
              publish(`${reason}:yesterday-btts`);
            },
            () => {
              if (cancelled) return;
              yestBTTS.current = new Map();
              publish(`${reason}:yesterday-btts-empty`);
            },
          ),
        );
      }
    };

    attachRef.current = attach;
    attach('mount');

    let midnightTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleMidnight = () => {
      if (midnightTimer != null) clearTimeout(midnightTimer);
      const delay = msUntilNextUkSelectionDay() + 90_000;
      midnightTimer = setTimeout(() => {
        if (dayOffsetRef.current === 0) {
          attach('selection-day-rollover');
        } else {
          // Keep relative offset; re-resolve absolute keys against new calendar today.
          attach('selection-day-rollover-offset');
        }
        scheduleMidnight();
      }, delay);
    };
    scheduleMidnight();

    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      // Re-subscribe so late catch-up uploads (e.g. morning GBC sidecar) land even if
      // the RTDB connection briefly stalled while the tab was hidden.
      if (dayOffsetRef.current === 0) {
        const nextToday = ukSelectionDateKey();
        if (nextToday !== todayKeyRef.current) {
          attach('visibility-new-day');
        } else {
          attach('visibility-resubscribe');
        }
      } else {
        attach('visibility-resubscribe-offset');
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

  const setDayOffset = useCallback(
    (next: number) => {
      dayOffsetRef.current = next;
      setDayOffsetState(next);
      attachRef.current('day-nav');
    },
    [],
  );

  const reload = useCallback(() => {
    attachRef.current('manual-reload');
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
