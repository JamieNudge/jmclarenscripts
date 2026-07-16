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

    void loadApi();
    pollTimer = setInterval(() => {
      void loadApi();
    }, 4_000);

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
      if (document.visibilityState === 'visible') void loadApi();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      if (pollTimer != null) clearInterval(pollTimer);
      unsubRtdb?.();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [apply]);

  return { blur: config.blur, forecastsBlur: config.forecastsBlur, loading };
}
