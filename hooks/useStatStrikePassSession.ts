'use client';

import { useCallback, useEffect, useState } from 'react';

export type StatStrikePassSession = {
  unlocked: boolean;
  expiresAt: string | null;
  passId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  claim: (claimKey: string) => Promise<{ ok: boolean; retry?: boolean; error?: string }>;
};

/**
 * Browser pass session (httpOnly cookie via /api/statstrike/pass/session).
 * When unlocked, treat Coming Soon blur as off and personal picks as enabled.
 */
export function useStatStrikePassSession(): StatStrikePassSession {
  const [unlocked, setUnlocked] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [passId, setPassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/statstrike/pass/session', { cache: 'no-store' });
      const json = (await res.json()) as {
        unlocked?: boolean;
        expiresAt?: string | null;
        passId?: string | null;
      };
      setUnlocked(Boolean(json.unlocked));
      setExpiresAt(json.expiresAt ?? null);
      setPassId(json.passId ?? null);
    } catch {
      setUnlocked(false);
      setExpiresAt(null);
      setPassId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const claim = useCallback(
    async (claimKey: string) => {
      try {
        const res = await fetch('/api/statstrike/pass/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claimKey }),
        });
        const json = (await res.json()) as {
          unlocked?: boolean;
          expiresAt?: string | null;
          passId?: string | null;
          error?: string;
          retry?: boolean;
        };
        if (res.status === 409 || json.retry) {
          return { ok: false, retry: true, error: json.error };
        }
        if (!res.ok) {
          return { ok: false, error: json.error || 'Claim failed' };
        }
        setUnlocked(Boolean(json.unlocked));
        setExpiresAt(json.expiresAt ?? null);
        setPassId(json.passId ?? null);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : 'Claim failed' };
      }
    },
    [],
  );

  return { unlocked, expiresAt, passId, loading, refresh, claim };
}
