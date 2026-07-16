'use client';

import { useMemo } from 'react';
import type { StatStrikeBoardRow } from '@/lib/statstrike/models';
import { isResultFinishedStatus, predictionResultForFixture } from '@/lib/statstrike/correctness';

type Props = {
  rows: StatStrikeBoardRow[];
  onOpenFixturesBest?: () => void;
};

/**
 * Read-only Best Performing digest from board rows (no IndexedDB yet).
 */
export function StatStrikeBestPerformingPanel({ rows, onOpenFixturesBest }: Props) {
  const digest = useMemo(() => {
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

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-[#0b3d5c]">Best Performing</h2>
        <p className="mt-1 text-sm text-black/75">
          Leagues with archive win rate ≥ 70% on today’s board (same threshold as iOS).
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-[#0b3d5c]/5 px-2 py-3">
          <p className="text-xl font-bold tabular-nums text-[#0b3d5c]">{digest.bpCount}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">On board</p>
        </div>
        <div className="rounded-xl bg-[#0b3d5c]/5 px-2 py-3">
          <p className="text-xl font-bold tabular-nums text-[#0b3d5c]">
            {digest.rate != null ? `${digest.rate}%` : '—'}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">Hit rate</p>
        </div>
        <div className="rounded-xl bg-[#0b3d5c]/5 px-2 py-3">
          <p className="text-xl font-bold tabular-nums text-[#0b3d5c]">
            {digest.wins}/{digest.settled || '—'}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">Settled</p>
        </div>
      </div>

      {digest.leagues.length > 0 ? (
        <ul className="space-y-2">
          {digest.leagues.map((l) => (
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
  );
}
