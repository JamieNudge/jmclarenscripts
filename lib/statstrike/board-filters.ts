import type { StatStrikeBoardRow } from '@/lib/statstrike/models';
import { isResultFinishedStatus } from '@/lib/statstrike/correctness';
import { isLiveStatus } from '@/lib/statstrike/parse-selection';
import { isUpperDivision } from '@/lib/statstrike/upper-divisions';
import { statStrikeTimeZone } from '@/lib/statstrike/uk-date';

export type TimeFilterId = 'all' | 'live' | 'morning' | 'afternoon' | 'evening' | 'custom';
export type LeagueFilterId = 'all' | 'bestPerforming' | 'major' | 'minor' | 'yourSelections';

export type BoardFilterState = {
  time: TimeFilterId;
  league: LeagueFilterId;
  /** Minutes from midnight local (Europe/London) for custom range. */
  customStartMinutes: number;
  customEndMinutes: number;
  /** Case-insensitive home/away team search. Empty = no search. */
  search: string;
};

export const DEFAULT_BOARD_FILTERS: BoardFilterState = {
  time: 'all',
  league: 'all',
  customStartMinutes: 12 * 60,
  customEndMinutes: 18 * 60,
  search: '',
};

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'P', 'LIVE', 'BT', 'INT']);

function hourRange(time: TimeFilterId): ClosedRange | null {
  switch (time) {
    case 'morning':
      return { lo: 0, hi: 12 };
    case 'afternoon':
      return { lo: 13, hi: 17 };
    case 'evening':
      return { lo: 18, hi: 23 };
    default:
      return null;
  }
}

type ClosedRange = { lo: number; hi: number };

function kickoffHourInTz(kickoffMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(kickoffMs));
  const hour = parts.find((p) => p.type === 'hour')?.value;
  return hour != null ? Number(hour) : new Date(kickoffMs).getHours();
}

function kickoffMinutesInTz(kickoffMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(kickoffMs));
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return hour * 60 + minute;
}

function formatKickoffTimeLabel(kickoffMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(kickoffMs));
}

function dayKeyInTz(kickoffMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(kickoffMs));
}

function dayHeaderLabel(dayKey: string, timeZone: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(utc);
}

export function rowPassesBoardFilters(
  row: StatStrikeBoardRow,
  filters: BoardFilterState,
  opts?: { timeZone?: string; personalFixtureIds?: Set<number> },
): boolean {
  const tz = opts?.timeZone ?? statStrikeTimeZone();
  const { fixture, prediction } = row;
  if (!prediction) return false;

  // Settled visibility: hide FT except All / Your Picks / Best Performing (iOS).
  if (
    filters.league !== 'all' &&
    filters.league !== 'yourSelections' &&
    filters.league !== 'bestPerforming' &&
    isResultFinishedStatus(fixture.status)
  ) {
    return false;
  }

  switch (filters.time) {
    case 'all':
      break;
    case 'live': {
      if (!LIVE_STATUSES.has((fixture.status ?? '').toUpperCase()) && !isLiveStatus(fixture.status)) {
        return false;
      }
      break;
    }
    case 'morning':
    case 'afternoon':
    case 'evening': {
      const range = hourRange(filters.time);
      const hour = kickoffHourInTz(fixture.kickoffMs, tz);
      if (range && (hour < range.lo || hour > range.hi)) return false;
      break;
    }
    case 'custom': {
      const minutes = kickoffMinutesInTz(fixture.kickoffMs, tz);
      const start = filters.customStartMinutes;
      const end = filters.customEndMinutes;
      if (start <= end) {
        if (minutes < start || minutes > end) return false;
      } else if (minutes < start && minutes > end) {
        return false;
      }
      break;
    }
  }

  switch (filters.league) {
    case 'all':
      break;
    case 'bestPerforming':
      if (!row.bestPerformingLeague) return false;
      break;
    case 'major':
      if (!isUpperDivision(fixture.league.country, fixture.league.name)) return false;
      break;
    case 'minor':
      if (isUpperDivision(fixture.league.country, fixture.league.name)) return false;
      break;
    case 'yourSelections': {
      const ids = opts?.personalFixtureIds;
      if (!ids || !ids.has(fixture.id)) return false;
      break;
    }
  }

  const q = filters.search.trim().toLowerCase();
  if (q) {
    const home = fixture.homeTeam.name.toLowerCase();
    const away = fixture.awayTeam.name.toLowerCase();
    if (!home.includes(q) && !away.includes(q)) return false;
  }

  return true;
}

export type BoardLeagueGroup = {
  leagueKey: string;
  rows: StatStrikeBoardRow[];
};

export type BoardTimeGroup = {
  timeLabel: string;
  sortMs: number;
  leagues: BoardLeagueGroup[];
};

export type BoardDayGroup = {
  dayKey: string;
  dayLabel: string;
  timeGroups: BoardTimeGroup[];
};

/** Filter + group Day → kickoff time → league (iOS FixtureListPresentation). */
export function presentBoardRows(
  rows: StatStrikeBoardRow[],
  filters: BoardFilterState,
  opts?: { timeZone?: string; personalFixtureIds?: Set<number> },
): BoardDayGroup[] {
  const tz = opts?.timeZone ?? statStrikeTimeZone();
  const filtered = rows.filter((r) => rowPassesBoardFilters(r, filters, { ...opts, timeZone: tz }));

  const byDay = new Map<string, StatStrikeBoardRow[]>();
  for (const row of filtered) {
    const key = dayKeyInTz(row.fixture.kickoffMs, tz);
    const list = byDay.get(key) ?? [];
    list.push(row);
    byDay.set(key, list);
  }

  const dayGroups: BoardDayGroup[] = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, dayRows]) => {
      const byTime = new Map<string, StatStrikeBoardRow[]>();
      for (const row of dayRows) {
        const label = formatKickoffTimeLabel(row.fixture.kickoffMs, tz);
        const list = byTime.get(label) ?? [];
        list.push(row);
        byTime.set(label, list);
      }

      const timeGroups: BoardTimeGroup[] = Array.from(byTime.entries())
        .map(([timeLabel, timeRows]) => {
          const sortMs = Math.min(...timeRows.map((r: StatStrikeBoardRow) => r.fixture.kickoffMs));
          const byLeague = new Map<string, StatStrikeBoardRow[]>();
          for (const row of timeRows) {
            const leagueKey = `${row.fixture.league.country}: ${row.fixture.league.name}`;
            const list = byLeague.get(leagueKey) ?? [];
            list.push(row);
            byLeague.set(leagueKey, list);
          }
          const leagues: BoardLeagueGroup[] = Array.from(byLeague.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([leagueKey, leagueRows]) => ({
              leagueKey,
              rows: leagueRows.sort(
                (a: StatStrikeBoardRow, b: StatStrikeBoardRow) =>
                  a.fixture.kickoffMs - b.fixture.kickoffMs,
              ),
            }));
          return { timeLabel, sortMs, leagues };
        })
        .sort((a, b) => a.sortMs - b.sortMs);

      return {
        dayKey,
        dayLabel: dayHeaderLabel(dayKey, tz),
        timeGroups,
      };
    });

  return dayGroups;
}

export function minutesToHHMM(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function hhmmToMinutes(value: string): number | null {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}
