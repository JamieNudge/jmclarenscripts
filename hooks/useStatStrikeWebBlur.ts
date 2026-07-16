'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import {
  DEFAULT_STATSTRIKE_WEB_CONFIG,
  parseStatStrikeWebConfig,
  statStrikeWebConfigRtdbPath,
} from '@/lib/statstrike/web-config';

/**
 * Live Coming Soon blur flag from RTDB.
 * Defaults to blur ON until the first snapshot arrives (safe teaser).
 */
export function useStatStrikeWebBlur(): { blur: boolean; loading: boolean } {
  const [blur, setBlur] = useState(DEFAULT_STATSTRIKE_WEB_CONFIG.blur);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setBlur(DEFAULT_STATSTRIKE_WEB_CONFIG.blur);
      setLoading(false);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setBlur(DEFAULT_STATSTRIKE_WEB_CONFIG.blur);
      setLoading(false);
      return;
    }

    const unsub = onValue(
      ref(db, statStrikeWebConfigRtdbPath()),
      (snap) => {
        setBlur(parseStatStrikeWebConfig(snap.val()).blur);
        setLoading(false);
      },
      () => {
        setBlur(DEFAULT_STATSTRIKE_WEB_CONFIG.blur);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  return { blur, loading };
}
