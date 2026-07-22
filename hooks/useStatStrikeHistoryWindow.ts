'use client';

import { useCallback, useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { parseDailySelection } from '@/lib/statstrike/parse-selection';
import {
  recordsFromSelection,
  type StatStrikeTrackRecord,
} from '@/lib/statstrike/track-record';
import {
  selectionsPathForDateKey,
  ukSelectionDateKeyOffset,
} from '@/lib/statstrike/uk-date';

const DEFAULT_WINDOW_DAYS = 7;

export type HistoryWindowState = {
  loading: boolean;
  error: string | null;
  configured: boolean;
  records: StatStrikeTrackRecord[];
  dateKeys: string[];
};

/**
 * One-shot fetch of `/selections/{ukToday-(n-1)}` … `/selections/{ukToday}` for app-level digests.
 * Set `enabled` false to skip fetch until the Best Performing tab opens.
 */
export function useStatStrikeHistoryWindow(
  windowDays = DEFAULT_WINDOW_DAYS,
  opts?: { enabled?: boolean },
) {
  const enabled = opts?.enabled !== false;
  const [state, setState] = useState<HistoryWindowState>({
    loading: enabled,
    error: null,
    configured: isFirebaseClientConfigured(),
    records: [],
    dateKeys: [],
  });

  const load = useCallback(async () => {
    if (!isFirebaseClientConfigured()) {
      setState({
        loading: false,
        error: null,
        configured: false,
        records: [],
        dateKeys: [],
      });
      return;
    }

    const db = getFirebaseRealtimeDb();
    if (!db) {
      setState({
        loading: false,
        error: 'Firebase database unavailable',
        configured: false,
        records: [],
        dateKeys: [],
      });
      return;
    }

    const dateKeys: string[] = [];
    for (let i = -(windowDays - 1); i <= 0; i++) {
      dateKeys.push(ukSelectionDateKeyOffset(i));
    }

    setState((s) => ({ ...s, loading: true, error: null, configured: true, dateKeys }));

    try {
      const results = await Promise.all(
        dateKeys.map(async (dateKey) => {
          const snap = await get(ref(db, selectionsPathForDateKey(dateKey)));
          const sel = parseDailySelection(snap.val());
          if (!sel) return [] as StatStrikeTrackRecord[];
          return recordsFromSelection(sel, dateKey);
        }),
      );
      const records = results.flat();
      setState({
        loading: false,
        error: null,
        configured: true,
        records,
        dateKeys,
      });
    } catch (e) {
      setState({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load selection history',
        configured: true,
        records: [],
        dateKeys,
      });
    }
  }, [windowDays]);

  useEffect(() => {
    if (!enabled) return;
    void load();
  }, [enabled, load]);

  return { ...state, refresh: load };
}
