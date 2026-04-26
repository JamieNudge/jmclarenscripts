'use client';

import { useEffect, useState } from 'react';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import type { BplHubPublicPayload, BplCompactFixture } from '@/lib/bpl-hub';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';

function resultPillClass(r: BplCompactFixture['result']): string {
  if (r === 'win') return 'text-emerald-200/95 border-emerald-400/35 bg-emerald-500/10';
  if (r === 'loss') return 'text-red-200/95 border-red-400/35 bg-red-500/10';
  if (r === 'void' || r === 'push') return 'text-amber-200/90 border-amber-400/30 bg-amber-500/10';
  if (r === 'dropped' || r === 'pending' || r === null) return 'text-white/55 border-white/15 bg-white/5';
  return 'text-white/50 border-white/10 bg-white/5';
}

function resultLabel(r: BplCompactFixture['result']): string {
  if (r === 'win') return 'W';
  if (r === 'loss') return 'L';
  if (r === 'void') return 'Void';
  if (r === 'push') return 'Push';
  if (r === 'dropped') return '—';
  if (r === 'pending') return 'Live';
  return '—';
}

export function BplHubCell() {
  const [data, setData] = useState<BplHubPublicPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const displayDate = useBestPicksLondonDateKey();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch('/api/football-predictions/bpl-payload', { method: 'GET' });
        if (!res.ok) {
          setErr('Could not load BPL panel.');
          setData(null);
          return;
        }
        const j = (await res.json()) as BplHubPublicPayload;
        if (!cancelled) {
          setData(j);
        }
      } catch {
        if (!cancelled) {
          setErr('Could not load BPL panel.');
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [displayDate]);

  return (
    <div className={`${bestPicksGridTileClassName} gap-3`}>
      <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight shrink-0">Stat Strike — best performing (BPL)</h2>
      <p className="text-sm text-white/60 leading-relaxed shrink-0">
        1u flat stake · FT results only. All Time updates when the site next reconciles (often your first visit of
        the day). Late finisher? It may show on the prior selection day. Metrics refresh after a page load, not
        exactly on a clock.
      </p>
      {loading && <p className="text-sm text-white/50">Loading…</p>}
      {err && (
        <p className="text-sm text-amber-200/90" role="alert">
          {err}
        </p>
      )}
      {data?.serverMessage ? (
        <p className="text-xs text-amber-200/80" role="status">
          {data.serverMessage}
        </p>
      ) : null}
      {data && (
        <div className="flex-1 min-h-0 space-y-4 min-w-0">
          <div className="rounded-xl border border-amber-200/25 bg-zinc-900/70 p-3 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/45">All Time BPL+odds (FT)</p>
            <p className="text-sm tabular-nums text-white/95">
              <span className="text-emerald-200/90">{data.allTime.wins}W</span>
              <span className="text-white/30"> — </span>
              <span className="text-red-200/90">{data.allTime.losses}L</span>
              {data.allTime.voids > 0 ? (
                <span className="text-white/50">
                  {' '}
                  · {data.allTime.voids} void/push
                </span>
              ) : null}
            </p>
            <p className="text-lg font-semibold text-amber-100/95 tabular-nums">
              ROI{' '}
              {data.allTime.roiPercent == null
                ? '—'
                : `${data.allTime.roiPercent >= 0 ? '+' : ''}${data.allTime.roiPercent.toFixed(1)}%`}
            </p>
            <p className="text-[10px] text-white/40">
              {data.settledPickCount} settled line{data.settledPickCount === 1 ? '' : 's'} in ledger
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-white/45 mb-2">
              Today on hub calendar{' '}
              <span className="tabular-nums text-amber-200/80">{data.current.dateKey}</span> · your device:{' '}
              <span className="tabular-nums text-white/50">{displayDate}</span>
            </p>
            {data.current.fixtures.length === 0 ? (
              <p className="text-sm text-white/50">No BPL lines with bookmaker odds for this date (or not uploaded yet).</p>
            ) : (
              <ul className="space-y-2 max-h-[18rem] overflow-y-auto pr-0.5 [scrollbar-gutter:stable]">
                {data.current.fixtures.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white leading-snug line-clamp-2">{f.title}</p>
                      {f.band && (
                        <p className="text-[10px] text-cyan-200/80 mt-0.5">
                          {f.side === 'over' ? 'O' : 'U'} · {f.band}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      <span className="text-xs tabular-nums text-amber-100/90">@{f.odds.toFixed(2)}</span>
                      {f.result != null && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${resultPillClass(f.result)}`}
                        >
                          {resultLabel(f.result)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
