'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_STATSTRIKE_WEB_CONFIG,
  parseStatStrikeWebConfig,
  type StatStrikeWebConfig,
} from '@/lib/statstrike/web-config';

const API_POLL_MS = 5 * 60_000;

async function fetchConfigViaApi(): Promise<StatStrikeWebConfig> {
  const res = await fetch('/api/statstrike/web-config');
  const json = (await res.json()) as { config?: StatStrikeWebConfig };
  return parseStatStrikeWebConfig(json.config ?? null);
}

/**
 * Blur flags for StatStrike web + GoalLab Forecasts.
 * Admin-backed API only — no client RTDB listener (the node almost never changes).
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
