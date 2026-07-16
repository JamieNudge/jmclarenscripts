'use client';

import { useCallback, useEffect, useState } from 'react';
import type { StatStrikeWebConfig } from '@/lib/statstrike/web-config';

type Props = { adminKey: string };

function ToggleRow({
  label,
  description,
  on,
  loading,
  canUse,
  onTurnOff,
  onTurnOn,
}: {
  label: string;
  description: string;
  on: boolean;
  loading: boolean;
  canUse: boolean;
  onTurnOff: () => void;
  onTurnOn: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/[0.03] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">{description}</p>
          <p className="text-[11px] text-white/45 mt-1">
            Currently <strong className="text-white/70">{on ? 'ON' : 'OFF'}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || !canUse || !on}
            onClick={onTurnOff}
            className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-4 py-2 text-xs font-semibold disabled:opacity-50"
          >
            Turn blur OFF
          </button>
          <button
            type="button"
            disabled={loading || !canUse || on}
            onClick={onTurnOn}
            className="rounded-lg bg-amber-600/90 hover:bg-amber-600 px-4 py-2 text-xs font-semibold disabled:opacity-50"
          >
            Turn blur ON
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminStatStrikeWebSection({ adminKey }: Props) {
  const [blur, setBlur] = useState(true);
  const [forecastsBlur, setForecastsBlur] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canUse = adminKey.trim().length > 0;

  const apply = useCallback((config: StatStrikeWebConfig) => {
    setBlur(config.blur);
    setForecastsBlur(config.forecastsBlur);
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
      apply(json.config ?? { blur: true, forecastsBlur: true, updatedAt: null });
      const c = json.config;
      setStatus(
        c
          ? `Loaded config${json.path ? ` (${json.path})` : ''}. StatStrike blur ${
              c.blur ? 'ON' : 'OFF'
            }, Forecasts blur ${c.forecastsBlur ? 'ON' : 'OFF'}.`
          : 'No config yet — both blurs default ON.',
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

  const save = async (patch: { blur?: boolean; forecastsBlur?: boolean }) => {
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
        body: JSON.stringify(patch),
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
      const c = json.config ?? {
        blur: patch.blur ?? blur,
        forecastsBlur: patch.forecastsBlur ?? forecastsBlur,
        updatedAt: new Date().toISOString(),
      };
      apply(c);
      const bits: string[] = [];
      if (patch.blur !== undefined) {
        bits.push(
          patch.blur
            ? 'StatStrike Coming Soon blur ON (hero + /statstrike).'
            : 'StatStrike Coming Soon blur OFF (interactive board).',
        );
      }
      if (patch.forecastsBlur !== undefined) {
        bits.push(
          patch.forecastsBlur
            ? 'Forecasts overflow blur ON (/fixtures).'
            : 'Forecasts overflow blur OFF (full list on /fixtures).',
        );
      }
      setStatus(`${bits.join(' ')}${json.path ? ` (${json.path})` : ''}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
      <h2 className="text-lg font-semibold">GoalLab blurs (StatStrike + Forecasts)</h2>
      <p className="text-xs text-white/50 leading-relaxed">
        Runtime kill-switches stored at <code className="text-white/70">statstrikeWebConfig</code>.
        Public site reads via <code className="text-white/70">/api/statstrike/web-config</code>. Missing
        fields default to blur <strong className="text-white/65">ON</strong>.
      </p>
      <p className="text-xs text-white/55 leading-relaxed">
        Product on/off for StatStrike web is still{' '}
        <code className="text-white/70">NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED</code> on Vercel.
      </p>

      {updatedAt ? (
        <p className="text-[11px] text-white/45 tabular-nums">Last updated {updatedAt}</p>
      ) : (
        <p className="text-[11px] text-white/45">Not saved yet (defaults ON)</p>
      )}

      <ToggleRow
        label="StatStrike Web blur"
        description="Hero panel + /statstrike Coming Soon overlay."
        on={blur}
        loading={loading}
        canUse={canUse}
        onTurnOff={() => void save({ blur: false })}
        onTurnOn={() => void save({ blur: true })}
      />

      <ToggleRow
        label="Forecasts blur"
        description="GoalLab /fixtures — when ON, only six cards stay clear and the rest are blurred with App Store CTA. When OFF, the full day list is visible."
        on={forecastsBlur}
        loading={loading}
        canUse={canUse}
        onTurnOff={() => void save({ forecastsBlur: false })}
        onTurnOn={() => void save({ forecastsBlur: true })}
      />

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
    </section>
  );
}
