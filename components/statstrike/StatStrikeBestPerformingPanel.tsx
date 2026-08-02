'use client';

import { useMemo, useState } from 'react';
import type { StatStrikeBoardRow } from '@/lib/statstrike/models';
import { isResultFinishedStatus, predictionResultForFixture } from '@/lib/statstrike/correctness';
import {
  bestPerformingDigestChipTitle,
  bestPerformingSevenDayDigest,
  goalBandCascadeOverGoalsRates,
  goalBandCascadeSuccessRate,
  type StatStrikeTrackRecord,
} from '@/lib/statstrike/track-record';

type Props = {
  rows: StatStrikeBoardRow[];
  /** Settled/pending records from last 7 selection days (app-level). */
  historyRecords?: StatStrikeTrackRecord[];
  historyLoading?: boolean;
  historyError?: string | null;
  onOpenFixturesBest?: () => void;
  onRefreshHistory?: () => void;
};

/**
 * Best Performing tab: today’s board snapshot + 7-day digest + GBC rates.
 */
export function StatStrikeBestPerformingPanel({
  rows,
  historyRecords = [],
  historyLoading = false,
  historyError = null,
  onOpenFixturesBest,
  onRefreshHistory,
}: Props) {
  const [digestOpen, setDigestOpen] = useState(true);

  const todayDigest = useMemo(() => {
    const bp = rows.filter((r) => r.bestPerformingLeague);
    let wins = 0;
    let settled = 0;
    const byLeague = new Map<string, { wins: number; settled: number }>();

    for (const row of bp) {
      if (!isResultFinishedStatus(row.fixture.status)) continue;
      const won = predictionResultForFixture(row.fixture, row.prediction);
      if (won == null) continue;
      settled += 1;
      if (won) wins += 1;
      const key = `${row.fixture.league.country}: ${row.fixture.league.name}`;
      const cur = byLeague.get(key) ?? { wins: 0, settled: 0 };
      cur.settled += 1;
      if (won) cur.wins += 1;
      byLeague.set(key, cur);
    }

    const leagues = Array.from(byLeague.entries())
      .map(([name, s]) => ({
        name,
        wins: s.wins,
        settled: s.settled,
        rate: s.settled > 0 ? Math.round((s.wins / s.settled) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate || b.settled - a.settled)
      .slice(0, 8);

    return {
      bpCount: bp.length,
      wins,
      settled,
      rate: settled > 0 ? Math.round((wins / settled) * 100) : null,
      leagues,
    };
  }, [rows]);

  const sevenDay = useMemo(
    () => bestPerformingSevenDayDigest(historyRecords),
    [historyRecords],
  );
  const gbcSuccess = useMemo(
    () => goalBandCascadeSuccessRate(historyRecords),
    [historyRecords],
  );
  const gbcOver = useMemo(
    () => goalBandCascadeOverGoalsRates(historyRecords),
    [historyRecords],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-[#0b3d5c]">Best Performing</h2>
          <p className="mt-1 text-sm text-black/75">
            Leagues with archive win rate ≥ 70% on today’s board (same threshold as iOS).
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-[#0b3d5c]/5 px-2 py-3">
            <p className="text-xl font-bold tabular-nums text-[#0b3d5c]">{todayDigest.bpCount}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">On board</p>
          </div>
          <div className="rounded-xl bg-[#0b3d5c]/5 px-2 py-3">
            <p className="text-xl font-bold tabular-nums text-[#0b3d5c]">
              {todayDigest.rate != null ? `${todayDigest.rate}%` : '—'}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">Hit rate</p>
          </div>
          <div className="rounded-xl bg-[#0b3d5c]/5 px-2 py-3">
            <p className="text-xl font-bold tabular-nums text-[#0b3d5c]">
              {todayDigest.wins}/{todayDigest.settled || '—'}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">Settled</p>
          </div>
        </div>

        {todayDigest.leagues.length > 0 ? (
          <ul className="space-y-2">
            {todayDigest.leagues.map((l) => (
              <li
                key={l.name}
                className="flex items-center justify-between gap-2 rounded-lg border border-black/8 px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-black/80">{l.name}</span>
                <span className="shrink-0 tabular-nums text-black/75">
                  {l.wins}/{l.settled} · {l.rate}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-black/70">No settled best-performing results on this board yet.</p>
        )}

        {onOpenFixturesBest ? (
          <button
            type="button"
            onClick={onOpenFixturesBest}
            className="text-sm font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
          >
            Show Best Leagues on Fixtures →
          </button>
        ) : null}
      </div>

      <div className="space-y-3 rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#0b3d5c]">Last 7 days</h3>
            <p className="mt-0.5 text-xs text-black/70">
              Settled Best Performing tips across recent selection days.
            </p>
          </div>
          {onRefreshHistory ? (
            <button
              type="button"
              onClick={onRefreshHistory}
              className="shrink-0 text-xs font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
            >
              Refresh
            </button>
          ) : null}
        </div>

        {historyLoading ? (
          <p className="text-sm text-black/70">Loading history…</p>
        ) : historyError ? (
          <p className="text-sm text-red-700">{historyError}</p>
        ) : sevenDay ? (
          <>
            <button
              type="button"
              onClick={() => setDigestOpen((v) => !v)}
              className="inline-flex max-w-full items-center rounded-full bg-emerald-700/90 px-3 py-1.5 text-left text-[11px] font-bold leading-snug text-white"
            >
              {bestPerformingDigestChipTitle(sevenDay)}
              <span className="ml-2 opacity-80">{digestOpen ? '▴' : '▾'}</span>
            </button>
            {digestOpen ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <MetricCard label="Completed" value={`${sevenDay.completedCount}`} />
                <MetricCard
                  label="Hit rate"
                  value={`${Math.round(sevenDay.hitRatePercent)}%`}
                />
                <MetricCard
                  label="Correct"
                  value={`${sevenDay.correctCount}/${sevenDay.completedCount}`}
                />
                {sevenDay.flatStakeROIPercent != null ? (
                  <MetricCard
                    label="Flat-stake ROI"
                    value={`${sevenDay.flatStakeROIPercent >= 0 ? '+' : ''}${sevenDay.flatStakeROIPercent.toFixed(1)}%`}
                    sub={`From ${sevenDay.oddsPickCount} picks with saved odds`}
                  />
                ) : (
                  <MetricCard
                    label="Flat-stake ROI"
                    value="—"
                    sub="Not enough picks with saved odds yet"
                  />
                )}
                {sevenDay.bestLeagueTitle ? (
                  <MetricCard
                    label="Best league"
                    value={`${Math.round(sevenDay.bestLeagueHitRatePercent ?? 0)}%`}
                    sub={`${sevenDay.bestLeagueTitle} · n=${sevenDay.bestLeagueSampleSize}`}
                  />
                ) : null}
                {sevenDay.bestBandTitle ? (
                  <MetricCard
                    label="Best band"
                    value={`${Math.round(sevenDay.bestBandHitRatePercent ?? 0)}%`}
                    sub={`${sevenDay.bestBandTitle} · n=${sevenDay.bestBandSampleSize}`}
                  />
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-black/70">
            No settled Best Performing results in the last 7 days yet.
          </p>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[#0b3d5c]">Goal Band Cascade</h3>
          <p className="mt-0.5 text-xs text-black/70">
            Among settled tips that carried cascade metadata (consumer tip W/L).
          </p>
        </div>
        {historyLoading ? (
          <p className="text-sm text-black/70">Loading…</p>
        ) : gbcSuccess.total === 0 ? (
          <p className="text-sm text-black/70">No settled Goal Band Cascade tips in this window.</p>
        ) : (
          <>
            <div className="rounded-xl bg-indigo-600/10 px-3 py-3 text-center">
              <p className="text-xl font-bold tabular-nums text-indigo-800">
                {Math.round(gbcSuccess.percentage)}%
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-black/70">
                Tip hit rate · {gbcSuccess.correct}/{gbcSuccess.total}
              </p>
            </div>
            <ul className="space-y-1.5">
              {gbcOver.map((row) => (
                <li
                  key={row.level}
                  className="flex items-center justify-between gap-2 rounded-lg border border-black/8 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-black/85">{row.level}</span>
                  <span className="tabular-nums text-black/70">
                    {row.hits}/{row.total} · {Math.round(row.percentage)}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-[#0b3d5c]/5 px-2.5 py-2.5 text-center">
      <p className="text-lg font-bold tabular-nums text-[#0b3d5c] leading-tight">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-black/75">{label}</p>
      {sub ? <p className="mt-0.5 text-[10px] leading-snug text-black/60">{sub}</p> : null}
    </div>
  );
}
