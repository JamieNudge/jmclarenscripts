import type { StatStrikeBoardRow, StatStrikeDailySelection, StatStrikeFixture } from '@/lib/statstrike/models';
import {
  predictionFromBTTSPick,
  type BTTSSelectionPick,
} from '@/lib/statstrike/btts-selections';
import { isResultFinishedStatus } from '@/lib/statstrike/correctness';
import {
  FINISHED_STATUSES,
  enrichBoardRowDisplay,
  isBestPerformingLeague,
  isFinishedStatus,
  isLiveStatus,
} from '@/lib/statstrike/parse-selection';

function shouldCarryOverFromYesterday(fixture: StatStrikeFixture, nowMs: number): boolean {
  // iOS: only live statuses from the previous selection day when viewing calendar today.
  if (isLiveStatus(fixture.status)) return true;
  // Keep brief NS grace for kickoffs that slipped past midnight without going live yet.
  if (isFinishedStatus(fixture.status)) return false;
  const isNotStarted = fixture.status == null || fixture.status === 'NS';
  if (!isNotStarted) return false;
  if (fixture.kickoffMs > nowMs) return false;
  const hoursPast = (nowMs - fixture.kickoffMs) / 3_600_000;
  return hoursPast >= 0 && hoursPast <= 3;
}

function shouldShowOnBoard(
  fixture: StatStrikeFixture,
  hasPrediction: boolean,
  nowMs: number,
  opts?: { allowFinishedResults?: boolean },
): boolean {
  if (!hasPrediction) return false;
  // FT/AET/PEN only for today's selection so WIN badges can show — not yesterday's board.
  if (isResultFinishedStatus(fixture.status)) {
    return opts?.allowFinishedResults === true;
  }
  if (isFinishedStatus(fixture.status)) return false;
  if (isLiveStatus(fixture.status)) return true;
  const isNotStarted = fixture.status == null || fixture.status === 'NS';
  if (fixture.kickoffMs > nowMs) return true;
  if (isNotStarted) {
    const hoursPast = (nowMs - fixture.kickoffMs) / 3_600_000;
    return hoursPast <= 3;
  }
  return false;
}

function resolveBTTSPick(args: {
  fixtureId: number;
  fromYesterday: boolean;
  todayPicks: Map<number, BTTSSelectionPick> | null | undefined;
  yesterdayPicks: Map<number, BTTSSelectionPick> | null | undefined;
}): BTTSSelectionPick | null {
  const { fixtureId, fromYesterday, todayPicks, yesterdayPicks } = args;
  if (fromYesterday) {
    return yesterdayPicks?.get(fixtureId) ?? todayPicks?.get(fixtureId) ?? null;
  }
  return todayPicks?.get(fixtureId) ?? null;
}

/**
 * Merge selected-day selection with optional previous-day live carry-over.
 * Carry-over is only for the current UK business day (iOS `isCurrentSelectionDay`) —
 * browsing Tomorrow/Yesterday must not pull in the adjacent day's full board.
 */
export function mergeBoardRows(args: {
  todayKey: string;
  yesterdayKey: string;
  today: StatStrikeDailySelection | null;
  yesterday: StatStrikeDailySelection | null;
  nowMs?: number;
  /** When false, only the selected day is shown (no relative-yesterday merge). Default true. */
  includeYesterdayCarryOver?: boolean;
  /** `/bttsSelections` picks for the selected day. */
  todayBTTSPicks?: Map<number, BTTSSelectionPick> | null;
  /** `/bttsSelections` picks for the previous day (carry-over). */
  yesterdayBTTSPicks?: Map<number, BTTSSelectionPick> | null;
}): StatStrikeBoardRow[] {
  const nowMs = args.nowMs ?? Date.now();
  const byId = new Map<number, StatStrikeBoardRow>();
  const includeCarry = args.includeYesterdayCarryOver !== false;
  const todayBTTS = args.todayBTTSPicks ?? null;
  const yesterdayBTTS = args.yesterdayBTTSPicks ?? null;

  const lpToday = args.today?.leaguePerformance ?? {};
  const lpYest = args.yesterday?.leaguePerformance ?? {};

  if (includeCarry && args.yesterday) {
    for (const fixture of args.yesterday.fixtures) {
      if (!shouldCarryOverFromYesterday(fixture, nowMs)) continue;
      const prediction = args.yesterday.predictionsByFixtureId.get(fixture.id) ?? null;
      if (!prediction || prediction.matchedCriteria <= 0) continue;
      if (!shouldShowOnBoard(fixture, true, nowMs, { allowFinishedResults: false })) continue;
      const display = enrichBoardRowDisplay(fixture, prediction, args.yesterday);
      const bttsPick = resolveBTTSPick({
        fixtureId: fixture.id,
        fromYesterday: true,
        todayPicks: todayBTTS,
        yesterdayPicks: yesterdayBTTS,
      });
      byId.set(fixture.id, {
        fixture,
        prediction,
        bttsPrediction: bttsPick ? predictionFromBTTSPick(bttsPick) : null,
        bestPerformingLeague: isBestPerformingLeague(fixture, { ...lpYest, ...lpToday }),
        fromYesterday: true,
        selectionDateKey: args.yesterdayKey,
        trackRecordDisplay: display.trackRecordDisplay,
        keySignalLines: display.keySignalLines,
      });
    }
  }

  if (args.today) {
    for (const fixture of args.today.fixtures) {
      const prediction = args.today.predictionsByFixtureId.get(fixture.id) ?? null;
      if (!prediction || prediction.matchedCriteria <= 0) continue;
      if (!shouldShowOnBoard(fixture, true, nowMs, { allowFinishedResults: true })) continue;
      const display = enrichBoardRowDisplay(fixture, prediction, args.today);
      const bttsPick = resolveBTTSPick({
        fixtureId: fixture.id,
        fromYesterday: false,
        todayPicks: todayBTTS,
        yesterdayPicks: yesterdayBTTS,
      });
      byId.set(fixture.id, {
        fixture,
        prediction,
        bttsPrediction: bttsPick ? predictionFromBTTSPick(bttsPick) : null,
        bestPerformingLeague: isBestPerformingLeague(fixture, lpToday),
        fromYesterday: false,
        selectionDateKey: args.todayKey,
        trackRecordDisplay: display.trackRecordDisplay,
        keySignalLines: display.keySignalLines,
      });
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    if (a.fixture.kickoffMs !== b.fixture.kickoffMs) {
      return a.fixture.kickoffMs - b.fixture.kickoffMs;
    }
    return a.fixture.homeTeam.name.localeCompare(b.fixture.homeTeam.name);
  });
}

export function formatKickoffLocal(kickoffMs: number): string {
  if (!kickoffMs) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(kickoffMs));
  } catch {
    return new Date(kickoffMs).toLocaleString();
  }
}

export function scoreLabel(fixture: StatStrikeFixture): string | null {
  if (fixture.homeScore == null || fixture.awayScore == null) {
    if (!isLiveStatus(fixture.status) && !FINISHED_STATUSES.has(fixture.status ?? '')) {
      return null;
    }
  }
  if (fixture.homeScore == null || fixture.awayScore == null) return null;
  return `${fixture.homeScore}–${fixture.awayScore}`;
}

export type BoardRefreshResult = {
  todayKey: string;
  yesterdayKey: string;
  rows: StatStrikeBoardRow[];
  todayCount: number;
  yesterdayCarryCount: number;
  reason: string;
};

export function buildBoardRefreshResult(args: {
  todayKey: string;
  yesterdayKey: string;
  today: StatStrikeDailySelection | null;
  yesterday: StatStrikeDailySelection | null;
  reason: string;
  nowMs?: number;
  includeYesterdayCarryOver?: boolean;
  todayBTTSPicks?: Map<number, BTTSSelectionPick> | null;
  yesterdayBTTSPicks?: Map<number, BTTSSelectionPick> | null;
}): BoardRefreshResult {
  const rows = mergeBoardRows(args);
  const yesterdayCarryCount = rows.filter((r) => r.fromYesterday).length;
  const result: BoardRefreshResult = {
    todayKey: args.todayKey,
    yesterdayKey: args.yesterdayKey,
    rows,
    todayCount: args.today?.fixtures.length ?? 0,
    yesterdayCarryCount,
    reason: args.reason,
  };
  if (typeof console !== 'undefined') {
    console.info(
      `[statstrike] refresh uk=${result.todayKey} fixtures=${result.rows.length} todayRaw=${result.todayCount} yCarry=${result.yesterdayCarryCount} carry=${args.includeYesterdayCarryOver !== false} reason=${result.reason}`,
    );
  }
  return result;
}
