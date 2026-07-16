'use client';

import { StatStrikeFixtureRow } from '@/components/statstrike/StatStrikeFixtureRow';
import type { StatStrikeBoardRow } from '@/lib/statstrike/models';

type Props = {
  variant?: 'hero' | 'full';
  maxRows?: number;
  loading: boolean;
  error: string | null;
  configured: boolean;
  rows: StatStrikeBoardRow[];
  todayKey: string;
  lastReason?: string;
  onReload?: () => void;
};

/** Presentational board — parent owns `useStatStrikeBoard` (one listener set). */
export function StatStrikeBoard({
  variant = 'full',
  maxRows,
  loading,
  error,
  configured,
  rows,
  todayKey,
  lastReason,
  onReload,
}: Props) {
  const compact = variant === 'hero';
  const shown = maxRows != null ? rows.slice(0, maxRows) : rows;

  if (!configured) {
    return (
      <div className="px-3 py-4 text-sm text-black/55">
        Firebase is not configured in this environment.
      </div>
    );
  }

  if (loading && rows.length === 0) {
    return (
      <div className="space-y-2 px-3 py-4 animate-pulse" aria-busy>
        <div className="h-10 rounded-lg bg-black/5" />
        <div className="h-10 rounded-lg bg-black/5" />
        <div className="h-10 rounded-lg bg-black/5" />
      </div>
    );
  }

  if (error && rows.length === 0) {
    return (
      <div className="px-3 py-4 space-y-2">
        <p className="text-sm text-red-700">{error}</p>
        {onReload ? (
          <button
            type="button"
            onClick={onReload}
            className="text-xs font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
          >
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  if (shown.length === 0) {
    return (
      <div className="px-3 py-4 text-sm text-black/55">
        No live fixtures for London date {todayKey} yet.
        {onReload && !compact ? (
          <button
            type="button"
            onClick={onReload}
            className="ml-2 text-xs font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
          >
            Refresh
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      {!compact ? (
        <div className="flex items-center justify-between gap-2 px-1 pb-2">
          <p className="text-xs tabular-nums text-black/45">
            London · {todayKey} · {rows.length} fixture{rows.length === 1 ? '' : 's'}
          </p>
          {onReload ? (
            <button
              type="button"
              onClick={onReload}
              className="text-xs font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
              title={lastReason}
            >
              Refresh
            </button>
          ) : null}
        </div>
      ) : null}
      <ul className={compact ? 'divide-y-0' : 'space-y-2'}>
        {shown.map((row) => (
          <StatStrikeFixtureRow key={row.fixture.id} row={row} compact={compact} />
        ))}
      </ul>
      {compact && maxRows != null && rows.length > maxRows ? (
        <p className="px-3 py-2 text-[11px] text-black/45">
          +{rows.length - maxRows} more in full StatStrike
        </p>
      ) : null}
    </div>
  );
}
