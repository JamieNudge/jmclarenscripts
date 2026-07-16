'use client';

import { useCallback, useEffect, useState } from 'react';
import type { StatStrikeWebConfig } from '@/lib/statstrike/web-config';

type Props = { adminKey: string };

export function AdminStatStrikeWebSection({ adminKey }: Props) {
  const [blur, setBlur] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canUse = adminKey.trim().length > 0;

  const apply = useCallback((config: StatStrikeWebConfig) => {
    setBlur(config.blur);
    setUpdatedAt(config.updatedAt);
  }, []);

  const load = useCallback(async () => {
    if (!canUse) {
      setStatus('Paste your admin key first.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/statstrike-web-config', {
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
        cache: 'no-store',
      });
      const json = (await res.json()) as {
        config?: StatStrikeWebConfig;
        path?: string;
        error?: string;
      };
      if (!res.ok) {
        setStatus(json.error || res.statusText);
        return;
      }
      apply(json.config ?? { blur: true, updatedAt: null });
      setStatus(
        json.config
          ? `Loaded StatStrike web config${json.path ? ` (${json.path})` : ''}. Blur is ${
              json.config.blur ? 'ON' : 'OFF'
            }.`
          : 'No config yet — defaults to blur ON.',
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [adminKey, apply, canUse]);

  useEffect(() => {
    if (canUse) void load();
  }, [canUse, load]);

  const save = async (nextBlur: boolean) => {
    if (!canUse) {
      setStatus('Admin key required.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/statstrike-web-config', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blur: nextBlur }),
      });
      const json = (await res.json()) as {
        error?: string;
        config?: StatStrikeWebConfig;
        path?: string;
      };
      if (!res.ok) {
        setStatus(json.error || res.statusText);
        return;
      }
      apply(json.config ?? { blur: nextBlur, updatedAt: new Date().toISOString() });
      setStatus(
        nextBlur
          ? `Coming Soon blur ON${json.path ? ` (${json.path})` : ''}. Hero + /statstrike show the teaser.`
          : `Coming Soon blur OFF${json.path ? ` (${json.path})` : ''}. Full interactive board is live.`,
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
      <h2 className="text-lg font-semibold">StatStrike Web — Coming Soon blur</h2>
      <p className="text-xs text-white/50 leading-relaxed">
        Runtime kill-switch for the StatStrike hero panel and{' '}
        <code className="text-white/70">/statstrike</code> board. Stored at{' '}
        <code className="text-white/70">statstrikeWebConfig</code> in Realtime Database — flips live,
        no redeploy. Missing node defaults to blur <strong className="text-white/65">ON</strong>.
      </p>
      <p className="text-xs text-white/55 leading-relaxed">
        Product on/off is still <code className="text-white/70">NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED</code>{' '}
        on Vercel. This toggle only controls the Coming Soon overlay.
      </p>

      <div className="rounded-xl border border-white/20 bg-white/[0.03] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">
              Blur is {blur ? 'ON' : 'OFF'}
            </p>
            {updatedAt ? (
              <p className="text-[11px] text-white/45 tabular-nums">Updated {updatedAt}</p>
            ) : (
              <p className="text-[11px] text-white/45">Not saved yet (default ON)</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading || !canUse || !blur}
              onClick={() => void save(false)}
              className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-4 py-2 text-xs font-semibold disabled:opacity-50"
            >
              Turn blur OFF
            </button>
            <button
              type="button"
              disabled={loading || !canUse || blur}
              onClick={() => void save(true)}
              className="rounded-lg bg-amber-600/90 hover:bg-amber-600 px-4 py-2 text-xs font-semibold disabled:opacity-50"
            >
              Turn blur ON
            </button>
          </div>
        </div>

        {!canUse ? (
          <p className="text-xs text-amber-100/90">Paste your admin key in section 1 to manage this.</p>
        ) : null}
        {status ? (
          <p
            className={`text-sm rounded-lg px-4 py-3 border ${
              status.includes('OFF') || status.includes('ON') || status.includes('Loaded')
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-100'
                : 'bg-amber-500/10 border-amber-400/30 text-amber-100'
            }`}
            role="status"
          >
            {status}
          </p>
        ) : null}
        <button
          type="button"
          disabled={loading || !canUse}
          onClick={() => void load()}
          className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          Reload config
        </button>
      </div>
    </section>
  );
}
