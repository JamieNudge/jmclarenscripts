'use client';

import { StatStrikeFixtureRow } from '@/components/statstrike/StatStrikeFixtureRow';
import type { BoardDayGroup } from '@/lib/statstrike/board-filters';
import type { StatStrikeBoardRow } from '@/lib/statstrike/models';

type Props = {
  variant?: 'hero' | 'full';
  maxRows?: number;
  loading: boolean;
  error: string | null;
  configured: boolean;
  rows: StatStrikeBoardRow[];
  /** When provided, render Day → time → league groups instead of a flat list. */
  dayGroups?: BoardDayGroup[];
  todayKey: string;
  lastReason?: string;
  onReload?: () => void;
  emptyHint?: string;
  onStarClick?: (row: StatStrikeBoardRow) => void;
  isStarred?: (row: StatStrikeBoardRow) => boolean;
};

/** Presentational board — parent owns `useStatStrikeBoard` (one fetch/poll owner). */
export function StatStrikeBoard({
  variant = 'full',
  maxRows,
  loading,
  error,
  configured,
  rows,
  dayGroups,
  todayKey,
  lastReason,
  onReload,
  emptyHint,
  onStarClick,
  isStarred,
}: Props) {
  const compact = variant === 'hero';
  const useGroups = dayGroups != null && !compact;
  const flatShown = maxRows != null ? rows.slice(0, maxRows) : rows;
  const visibleCount = useGroups
    ? dayGroups.reduce(
        (n, d) => n + d.timeGroups.reduce((m, t) => m + t.leagues.reduce((k, l) => k + l.rows.length, 0), 0),
        0,
      )
    : flatShown.length;

  if (!configured) {
    return (
      <div className="px-3 py-4 text-sm text-black/75">
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

  if (visibleCount === 0) {
    return (
      <div className="px-3 py-4 text-sm text-black/75">
        {emptyHint ?? `No fixtures for London date ${todayKey} yet.`}
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
          <p className="text-xs tabular-nums text-black/80">
            London · {todayKey} · {visibleCount} fixture{visibleCount === 1 ? '' : 's'}
            {rows.length !== visibleCount ? ` (of ${rows.length})` : ''}
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

      {useGroups ? (
        <div className="space-y-6">
          {dayGroups!.map((day) => (
            <section key={day.dayKey} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wide text-black/80">{day.dayLabel}</h2>
              {day.timeGroups.map((tg) => (
                <div key={`${day.dayKey}-${tg.timeLabel}`} className="space-y-2">
                  <p className="text-sm font-semibold tabular-nums text-[#0b3d5c]">{tg.timeLabel}</p>
                  {tg.leagues.map((lg) => (
                    <div key={`${day.dayKey}-${tg.timeLabel}-${lg.leagueKey}`} className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-black/80">
                        {lg.leagueKey}
                      </p>
                      <ul className="space-y-2">
                        {lg.rows.map((row) => (
                          <StatStrikeFixtureRow
                            key={row.fixture.id}
                            row={row}
                            starred={isStarred?.(row)}
                            onStarClick={onStarClick ? () => onStarClick(row) : undefined}
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <ul className={compact ? 'divide-y-0' : 'space-y-2'}>
          {flatShown.map((row) => (
            <StatStrikeFixtureRow
              key={row.fixture.id}
              row={row}
              compact={compact}
              starred={isStarred?.(row)}
              onStarClick={onStarClick ? () => onStarClick(row) : undefined}
            />
          ))}
        </ul>
      )}

      {compact && maxRows != null && rows.length > maxRows ? (
        <p className="px-3 py-2 text-[11px] text-black/80">
          +{rows.length - maxRows} more in full StatStrike
        </p>
      ) : null}
    </div>
  );
}
