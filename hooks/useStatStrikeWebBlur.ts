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
 * Live Coming Soon blur flag.
 * Prefers RTDB when rules allow public read; always falls back to Admin-backed API
 * (RTDB rules often deny unread paths → permission error → would stick on blur ON).
 */
export function useStatStrikeWebBlur(): { blur: boolean; loading: boolean } {
  const [blur, setBlur] = useState(DEFAULT_STATSTRIKE_WEB_CONFIG.blur);
  const [loading, setLoading] = useState(true);

  const apply = useCallback((config: StatStrikeWebConfig) => {
    setBlur(config.blur);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | undefined;
    let unsubRtdb: (() => void) | undefined;

    const loadApi = async () => {
      try {
        const config = await fetchConfigViaApi();
        if (!cancelled) apply(config);
      } catch {
        if (!cancelled) {
          apply(DEFAULT_STATSTRIKE_WEB_CONFIG);
        }
      }
    };

    void loadApi();

    // Poll so admin toggles show up without a full page reload even if RTDB read is denied.
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
            // Permission denied / missing rules — keep relying on API poll.
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

  return { blur, loading };
}
