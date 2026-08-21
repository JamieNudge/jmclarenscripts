'use client';

import { useCallback, useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import {
  DEFAULT_STATSTRIKE_WEB_CONFIG,
  parseStatStrikeWebConfig,
  statStrikeWebConfigRtdbPath,
  type StatStrikeWebConfig,
} from '@/lib/statstrike/web-config';

const API_POLL_MS = 60_000;

async function fetchConfigViaApi(): Promise<StatStrikeWebConfig> {
  const res = await fetch('/api/statstrike/web-config', { cache: 'no-store' });
  const json = (await res.json()) as { config?: StatStrikeWebConfig };
  return parseStatStrikeWebConfig(json.config ?? null);
}

/**
 * Live blur flags for StatStrike web + GoalLab Forecasts.
 * Prefers RTDB when rules allow; always polls Admin-backed API as the reliable path.
 */
export function useStatStrikeWebBlur(): {
  blur: boolean;
  forecastsBlur: boolean;
  /** When false, hide purchase CTAs and block new Stripe checkouts. */
  supporterPassSalesEnabled: boolean;
  loading: boolean;
} {
  const [config, setConfig] = useState<StatStrikeWebConfig>(DEFAULT_STATSTRIKE_WEB_CONFIG);
  const [loading, setLoading] = useState(true);

  const apply = useCallback((next: StatStrikeWebConfig) => {
    setConfig(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let unsubRtdb: (() => void) | undefined;

    const loadApi = async () => {
      try {
        const next = await fetchConfigViaApi();
        if (!cancelled) apply(next);
      } catch {
        if (!cancelled) apply(DEFAULT_STATSTRIKE_WEB_CONFIG);
      }
    };

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
        void loadApi();
      }, API_POLL_MS);
    };

    void loadApi();
    startPollIfVisible();

    if (isFirebaseClientConfigured()) {
      const db = getFirebaseRealtimeDb();
      if (db) {
        unsubRtdb = onValue(
          ref(db, statStrikeWebConfigRtdbPath()),
          (snap) => {
            if (cancelled) return;
            apply(parseStatStrikeWebConfig(snap.val()));
          },
          () => {
            // Permission denied — keep API poll.
          },
        );
      }
    }

    const onVis = () => {
      if (document.visibilityState !== 'visible') {
        clearPoll();
        return;
      }
      void loadApi();
      startPollIfVisible();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      clearPoll();
      unsubRtdb?.();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [apply]);

  return {
    blur: config.blur,
    forecastsBlur: config.forecastsBlur,
    supporterPassSalesEnabled: config.supporterPassSalesEnabled,
    loading,
  };
}
