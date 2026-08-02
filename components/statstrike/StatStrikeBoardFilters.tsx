'use client';

import type {
  BoardChipCounts,
  BoardFilterState,
  LeagueFilterId,
  TimeFilterId,
} from '@/lib/statstrike/board-filters';
import { hhmmToMinutes, minutesToHHMM } from '@/lib/statstrike/board-filters';

type Props = {
  filters: BoardFilterState;
  onChange: (next: BoardFilterState) => void;
  /** When true, Your Picks chip is shown locked. */
  yourPicksLocked?: boolean;
  onYourPicksLockedClick?: () => void;
  /** Fixture counts for the selected calendar day (time + league chips). */
  chipCounts?: BoardChipCounts | null;
  compact?: boolean;
};

const TIME_CHIPS: { id: TimeFilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'morning', label: 'AM' },
  { id: 'afternoon', label: 'PM' },
  { id: 'evening', label: 'Night' },
  { id: 'custom', label: 'Custom' },
];

const LEAGUE_CHIPS: {
  id: LeagueFilterId;
  label: string;
  locked?: boolean;
  indigo?: boolean;
  lime?: boolean;
  orange?: boolean;
}[] = [
  { id: 'all', label: 'All' },
  { id: 'bestPerforming', label: 'Best Leagues' },
  { id: 'goalBandCascade', label: 'GBC', indigo: true },
  { id: 'btts', label: 'BTTS', lime: true },
  { id: 'highFirepower', label: 'Firepower', orange: true },
  { id: 'major', label: 'Upper' },
  { id: 'minor', label: 'Minor' },
  { id: 'yourSelections', label: 'Your Picks!', locked: true },
];

function chipClass(
  active: boolean,
  locked?: boolean,
  indigo?: boolean,
  lime?: boolean,
  orange?: boolean,
) {
  if (locked) {
    return 'rounded-full border border-black/15 bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/55';
  }
  if (active && indigo) {
    return 'rounded-full bg-violet-500 px-2.5 py-1 text-[11px] font-semibold text-white';
  }
  if (active && lime) {
    return 'rounded-full bg-lime-400 px-2.5 py-1 text-[11px] font-black text-black';
  }
  if (active && orange) {
    return 'rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black text-white';
  }
  return active
    ? 'rounded-full bg-[#0b3d5c] px-2.5 py-1 text-[11px] font-semibold text-white'
    : 'rounded-full border border-black/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-black/70 hover:bg-black/[0.03]';
}

function ChipCountBadge({ count }: { count: number | undefined }) {
  if (count == null || count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-4 text-white">
      {count}
    </span>
  );
}

export function StatStrikeBoardFilters({
  filters,
  onChange,
  yourPicksLocked = true,
  onYourPicksLockedClick,
  chipCounts = null,
  compact = false,
}: Props) {
  return (
    <div className={`space-y-2 ${compact ? 'px-1' : ''}`}>
      <div className="flex flex-wrap gap-1.5">
        {TIME_CHIPS.map((chip) => {
          const active = filters.time === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              className={`relative ${chipClass(active)}`}
              onClick={() =>
                onChange({
                  ...filters,
                  // Tap active non-All chip → reset to All (iOS parity).
                  time: active && chip.id !== 'all' ? 'all' : chip.id,
                })
              }
            >
              {chip.label}
              <ChipCountBadge count={chipCounts?.time[chip.id]} />
            </button>
          );
        })}
      </div>

      {filters.time === 'custom' ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-black/80">
          <label className="inline-flex items-center gap-1">
            From
            <input
              type="time"
              className="rounded-md border border-black/15 bg-white px-1.5 py-1 tabular-nums"
              value={minutesToHHMM(filters.customStartMinutes)}
              onChange={(e) => {
                const mins = hhmmToMinutes(e.target.value);
                if (mins == null) return;
                onChange({ ...filters, customStartMinutes: mins });
              }}
            />
          </label>
          <label className="inline-flex items-center gap-1">
            To
            <input
              type="time"
              className="rounded-md border border-black/15 bg-white px-1.5 py-1 tabular-nums"
              value={minutesToHHMM(filters.customEndMinutes)}
              onChange={(e) => {
                const mins = hhmmToMinutes(e.target.value);
                if (mins == null) return;
                onChange({ ...filters, customEndMinutes: mins });
              }}
            />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {LEAGUE_CHIPS.map((chip) => {
          const locked = chip.locked && yourPicksLocked;
          const active = filters.league === chip.id;
          const count = chipCounts?.league[chip.id];
          if (chip.id === 'highFirepower' && (count == null || count <= 0) && !active) {
            return null;
          }
          return (
            <button
              key={chip.id}
              type="button"
              aria-label={
                chip.id === 'goalBandCascade'
                  ? 'Goal Band Cascade'
                  : chip.id === 'btts'
                    ? 'BTTS tips'
                    : chip.id === 'highFirepower'
                      ? 'High firepower'
                      : undefined
              }
              className={`relative ${chipClass(active, locked, chip.indigo, chip.lime, chip.orange)}`}
              onClick={() => {
                if (locked) {
                  onYourPicksLockedClick?.();
                  return;
                }
                onChange({
                  ...filters,
                  league: active && chip.id !== 'all' ? 'all' : chip.id,
                  ...(chip.id === 'all' ? { time: 'all' as const } : {}),
                });
              }}
            >
              {chip.label}
              {locked ? ' · lock' : ''}
              <ChipCountBadge count={count} />
            </button>
          );
        })}
      </div>

      {!compact ? (
        <label className="block">
          <span className="sr-only">Search teams</span>
          <input
            type="search"
            placeholder="Search teams…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder:text-black/45 focus:outline-none focus:ring-2 focus:ring-[#0b3d5c]/30"
          />
        </label>
      ) : null}
    </div>
  );
}
