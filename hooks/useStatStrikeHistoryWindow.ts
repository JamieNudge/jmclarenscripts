'use client';

import { useCallback, useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { parseBTTSSelectionsPayload } from '@/lib/statstrike/btts-selections';
import { parseDailySelection } from '@/lib/statstrike/parse-selection';
import {
  recordsFromBTTSSelections,
  recordsFromSelection,
  type StatStrikeTrackRecord,
} from '@/lib/statstrike/track-record';
import {
  bttsSelectionsPathForDateKey,
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
 * One-shot fetch of `/selections` + `/bttsSelections` for UK today-(n-1)…today digests.
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
          const [selSnap, bttsSnap] = await Promise.all([
            get(ref(db, selectionsPathForDateKey(dateKey))),
            get(ref(db, bttsSelectionsPathForDateKey(dateKey))),
          ]);
          const sel = parseDailySelection(selSnap.val());
          const btts = parseBTTSSelectionsPayload(bttsSnap.val());
          const fromSel = sel ? recordsFromSelection(sel, dateKey) : [];
          const fromBtts = recordsFromBTTSSelections(
            btts?.picksByFixtureId ?? new Map(),
            sel,
            dateKey,
          );
          return [...fromSel, ...fromBtts];
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
