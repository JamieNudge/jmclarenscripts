'use client';

import { useEffect, useState } from 'react';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import type { BplHubPublicPayload, BplCompactFixture } from '@/lib/bpl-hub';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';

function resultPillClass(r: BplCompactFixture['result']): string {
  if (r === 'win') return 'text-emerald-200/95 border-emerald-400/35 bg-emerald-500/10';
  if (r === 'loss') return 'text-red-200/95 border-red-400/35 bg-red-500/10';
  if (r === 'void' || r === 'push') return 'text-amber-200/90 border-amber-400/30 bg-amber-500/10';
  if (r === 'dropped' || r === 'pending' || r === null) return 'text-white/70 border-white/15 bg-white/5';
  return 'text-white/65 border-white/10 bg-white/5';
}

function formatYmdForDisplay(ymd: string): string {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return ymd;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
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

  const londonDateKey = useBestPicksLondonDateKey();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch('/api/football-predictions/bpl-payload', {
          method: 'GET',
          cache: 'no-store',
        });
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
  }, [londonDateKey]);

  const allBplLines =
    data == null
      ? null
      : (data.allTimeBplAllLines ?? {
          wins: data.allTime.wins,
          losses: data.allTime.losses,
          voids: data.allTime.voids,
          settledLineCount: data.settledPickCount,
        });

  return (
    <div id="bpl-statstrike" className={`${bestPicksGridTileClassName} gap-3`}>
      <div className="shrink-0 space-y-1.5">
        <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight">
          StatStrike - Best Performing - As seen in iOS app
        </h2>
        <p className="text-sm text-white/80 font-medium">1u Flat Stake</p>
        {data?.allTimeDateRange && (
          <p className="text-xs text-white/65 tabular-nums">
            All Time: {formatYmdForDisplay(data.allTimeDateRange.startYyyyMmDd)} –{' '}
            {formatYmdForDisplay(data.allTimeDateRange.endYyyyMmDd)} (London)
          </p>
        )}
        {loading && <p className="text-sm text-white/70">Loading…</p>}
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
      </div>

      {data && allBplLines && (
        <>
          <div className="shrink-0 rounded-xl border border-amber-200/25 bg-zinc-900/70 p-3 space-y-2">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-100/80">
                All time · BPL, every best line (incl. no on-file odds)
              </p>
              <p className="text-sm tabular-nums text-white/95">
                <span className="text-emerald-200/90">{allBplLines.wins}W</span>
                <span className="text-white/50"> — </span>
                <span className="text-red-200/90">{allBplLines.losses}L</span>
                {allBplLines.voids > 0 ? (
                  <span className="text-white/65">
                    {' '}
                    · {allBplLines.voids} void/push
                  </span>
                ) : null}
              </p>
              <p className="text-[10px] text-white/60">
                {allBplLines.settledLineCount} settled line
                {allBplLines.settledLineCount === 1 ? '' : 's'} in BPL (all) ledger
              </p>
            </div>
            <div className="space-y-0.5 pt-1 border-t border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">
                All time · BPL, bookmaker odds on the hub (FT)
              </p>
              <p className="text-sm tabular-nums text-white/95">
                <span className="text-emerald-200/90">{data.allTime.wins}W</span>
                <span className="text-white/50"> — </span>
                <span className="text-red-200/90">{data.allTime.losses}L</span>
                {data.allTime.voids > 0 ? (
                  <span className="text-white/65">
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
              <p className="text-[10px] text-white/60">
                {data.settledPickCount} settled line{data.settledPickCount === 1 ? '' : 's'} in odds ledger
              </p>
            </div>
            {data.allTimeWithPreKoOdds ? (
              <div className="pt-2 mt-2 border-t border-white/10 space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">
                  All time · pre-KO odds (provable on the row)
                </p>
                <p className="text-sm tabular-nums text-white/90">
                  <span className="text-emerald-200/90">{data.allTimeWithPreKoOdds.wins}W</span>
                  <span className="text-white/50"> — </span>
                  <span className="text-red-200/90">{data.allTimeWithPreKoOdds.losses}L</span>
                </p>
                <p className="text-lg font-semibold text-cyan-100/90 tabular-nums">
                  ROI{' '}
                  {data.allTimeWithPreKoOdds.roiPercent == null
                    ? '—'
                    : `${data.allTimeWithPreKoOdds.roiPercent >= 0 ? '+' : ''}${data.allTimeWithPreKoOdds.roiPercent.toFixed(1)}%`}
                </p>
              </div>
            ) : null}
          </div>

          <div
            id="bpl-statstrike-fixtures"
            className="flex-1 min-h-0 min-w-0 flex flex-col overflow-y-auto [scrollbar-gutter:stable] scroll-mt-4"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-white/65 mb-1">
              Selection day (London){' '}
              <span className="tabular-nums text-amber-200/80">{data.current.dateKey}</span>
            </p>
            <p className="text-[10px] text-white/60 mb-2">
              {data.current.bestPerformingFixtureCount} best (BPL) line
              {data.current.bestPerformingFixtureCount === 1 ? '' : 's'}
              {data.current.bestPerformingFixtureCount !== data.current.withBookmakerOddsFixtureCount
                ? ` · ${data.current.withBookmakerOddsFixtureCount} with bookmaker odds on the hub`
                : data.current.withBookmakerOddsFixtureCount > 0
                  ? ' · all with bookmaker odds on the hub'
                  : ''}
            </p>
            {data.current.fixtures.length === 0 ? (
              <p className="text-sm text-white/70">No BPL lines with bookmaker odds for this date (or not uploaded yet).</p>
            ) : (
              <ul className="space-y-2 pb-1">
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
        </>
      )}
    </div>
  );
}
