'use client';

import type { PersonalPickRecord } from '@/lib/statstrike/personal-store';
import { formatKickoffLocal } from '@/lib/statstrike/board-merge';

type Props = {
  picks: PersonalPickRecord[];
  loading?: boolean;
  error?: string | null;
};

/** Debug / future My Record list (only when personal flag unlocked). */
export function StatStrikeMyRecordPanel({ picks, loading, error }: Props) {
  if (loading) {
    return <p className="text-sm text-black/70">Loading your picks…</p>;
  }
  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-black/10 bg-white/90 p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-[#0b3d5c]">My Record</h2>
        <p className="mt-1 text-sm text-black/75">
          Local Your Picks on this device (debug unlock). Settling and sync arrive with web accounts.
        </p>
      </div>
      {picks.length === 0 ? (
        <p className="text-sm text-black/70">No saved picks yet. Star a fixture on the board.</p>
      ) : (
        <ul className="space-y-2">
          {picks.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-black/8 px-3 py-2 text-sm"
            >
              <p className="font-semibold text-black/90">
                {p.homeTeam} <span className="font-normal text-black/70">v</span> {p.awayTeam}
              </p>
              <p className="mt-0.5 text-xs text-black/65">
                {[p.country, p.league].filter(Boolean).join(' · ')} ·{' '}
                <span className="tabular-nums">{formatKickoffLocal(p.kickoffMs)}</span>
              </p>
              <p className="mt-1 text-xs font-semibold text-[#0b3d5c]">{p.tipBand}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
