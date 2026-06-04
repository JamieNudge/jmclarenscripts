/**
 * Best Performing Leagues (BPL) hub: display + lazy All Time settlement (server-side).
 * Reads StatStrike `selections` + `unanimousExports`; writes only `footballPredictions/bplHub`.
 */

import {
  bplOddsPreKickClass,
  formatKickoffFromPickRecord,
  mergeUnanimousPicksByFixtureBand,
  parseLeaguePerformanceFromSelection,
  parseUnanimousExport,
  pickDisplayTitle,
  pickGoalsSideFromBandOrFallback,
  pickHasResearchExcludedStatus,
  pickKickoffSortTimeMs,
  pickLeagueDisplay,
  pickMergeKey,
  pickPassesBestFilter,
} from '@/lib/best-picks-firebase';
import type { PickRecord } from '@/lib/best-picks-firebase';

const HUB_ROOT_DEFAULT = 'footballPredictions/bplHub';

export function bplHubRtdbPath(): string {
  return process.env.BPL_HUB_RTDB_PATH?.trim() || HUB_ROOT_DEFAULT;
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function str(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}

function bookmakerOdds(p: PickRecord): number | null {
  const o = num(p.bookmakerOdds);
  if (o == null || o <= 1) return null;
  return o;
}

export type BplCompactFixture = {
  id: string;
  title: string;
  band: string | null;
  side: 'over' | 'under';
  /** Single-line forecast, e.g. "Over 2.5" — derived from `predictedBand` and side. */
  forecast: string;
  league: string | null;
  /** Kick-off as formatted for display (typically UTC from export). */
  kickoff: string | null;
  /** Decimal odds when stored on the row; `null` if no on-file bookmaker odds. */
  odds: number | null;
  result: 'win' | 'loss' | 'void' | 'push' | 'pending' | 'dropped' | null;
};

export type BplAllTimePublic = {
  wins: number;
  losses: number;
  voids: number;
  staked: number;
  profit: number;
  roiPercent: number | null;
};

/** All-time W/L for every BPL (best filter) line after merge, including rows without on-file bookmaker odds. */
export type BplAllLinesWinLoss = {
  wins: number;
  losses: number;
  voids: number;
  settledLineCount: number;
};

export type BplHubPublicPayload = {
  allTime: BplAllTimePublic;
  /**
   * Merged BPL (best filter) W/L: same rows as the ROI/odds ledger, plus any extra BPL lines with no
   * on-file odds in {@link BplHubState#pickLedgerBplAll}. Tallied from both ledgers at read time
   * so the odds slice always matches the ROI block.
   */
  allTimeBplAllLines: BplAllLinesWinLoss;
  /**
   * All Time only for lines where we could confirm bookmaker odds were stored before kickoff
   * (odds + kickoff + an odds-related timestamp on the row). Omitted from this subtotal when unprovable.
   */
  allTimeWithPreKoOdds: BplAllTimePublic | null;
  /** Inclusive London calendar range for All Time metrics (end advances each day). */
  allTimeDateRange: { startYyyyMmDd: string; endYyyyMmDd: string };
  settledPickCount: number;
  current: {
    dateKey: string;
    generatedAtMs: number;
    fixtures: BplCompactFixture[];
    bestPerformingFixtureCount: number;
    withBookmakerOddsFixtureCount: number;
  };
  previous: {
    dateKey: string;
    generatedAtMs: number;
    fixtures: BplCompactFixture[];
    bestPerformingFixtureCount: number;
    withBookmakerOddsFixtureCount: number;
  } | null;
  serverMessage?: string;
};

type PickLedgerEntry = {
  dateKey: string;
  result: 'win' | 'loss' | 'void' | 'push' | 'dropped';
  profit1u: number;
  recordedAt: number;
  oddsPreKick?: 'yes' | 'no' | 'unknown';
};

type PickLedgerBplAllEntry = {
  dateKey: string;
  result: 'win' | 'loss' | 'void' | 'push' | 'dropped';
  profit1u: number;
  recordedAt: number;
};

export type BplHubState = {
  v: 1;
  allTime: { wins: number; losses: number; voids: number; profit: number };
  allTimeWithPreKoOdds: { wins: number; losses: number; voids: number; profit: number };
  /**
   * BPL (best filter) lines that do **not** have on-file bookmaker odds, once settled. Rows that
   * also appear in {@link BplHubState#pickLedger} are not duplicated here (tally = union of ledgers).
   */
  pickLedger: Record<string, PickLedgerEntry>;
  pickLedgerBplAll: Record<string, PickLedgerBplAllEntry>;
  /** Set on first hub write: first day All Time is tracked (London yyyy-MM-dd). */
  allTimeTrackingStartYyyyMmDd?: string;
  current?: { dateKey: string; generatedAtMs: number; fixtures: BplCompactFixture[] };
  previous?: { dateKey: string; generatedAtMs: number; fixtures: BplCompactFixture[] } | null;
};

const MS_48H = 48 * 60 * 60 * 1000;
/** If export has a terminal outcome but no display status, only assume FT well after kickoff to avoid live false positives. */
const MS_12H = 12 * 60 * 60 * 1000;

export function newEmptyHub(): BplHubState {
  return {
    v: 1,
    allTime: { wins: 0, losses: 0, voids: 0, profit: 0 },
    allTimeWithPreKoOdds: { wins: 0, losses: 0, voids: 0, profit: 0 },
    pickLedger: {},
    pickLedgerBplAll: {},
    current: undefined,
    previous: null,
  };
}

function publicAllTime(s: BplHubState['allTime']): BplAllTimePublic {
  const staked = s.wins + s.losses;
  const roi = staked > 0 ? (s.profit / staked) * 100 : null;
  return {
    wins: s.wins,
    losses: s.losses,
    voids: s.voids,
    staked,
    profit: s.profit,
    roiPercent: roi,
  };
}

function publicAllTimeWithPreKoOrNull(s: BplHubState['allTimeWithPreKoOdds']): BplAllTimePublic | null {
  const staked = s.wins + s.losses;
  if (staked === 0) return null;
  const roi = (s.profit / staked) * 100;
  return {
    wins: s.wins,
    losses: s.losses,
    voids: s.voids,
    staked,
    profit: s.profit,
    roiPercent: roi,
  };
}

/** W/L/void/line count from the union of odds and BPL-only ledgers (odds rows match the ROI). */
function tallyBplAllLinesFromLedgers(hub: BplHubState): BplAllLinesWinLoss {
  const a = hub.pickLedger;
  const b = hub.pickLedgerBplAll ?? {};
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));
  let wins = 0;
  let losses = 0;
  let voids = 0;
  for (const k of keys) {
    const e: PickLedgerEntry | PickLedgerBplAllEntry | undefined = a[k] ?? b[k];
    if (!e) continue;
    const { result } = e;
    if (result === 'win') wins += 1;
    else if (result === 'loss') losses += 1;
    else if (result === 'void' || result === 'push') voids += 1;
  }
  return { wins, losses, voids, settledLineCount: keys.length };
}

export function inferListSideFromBand(p: PickRecord): 'over' | 'under' {
  return pickGoalsSideFromBandOrFallback(p) ?? 'over';
}

export function bplPickLedgerKey(dateKey: string, p: PickRecord): string {
  const side = inferListSideFromBand(p);
  const band = str(p.predictedBand).toLowerCase().replace(/\s+/g, ' ').trim();
  return `bpl:${dateKey}|${side}|${pickMergeKey(p)}|${band}`;
}

function parseGoalsLine(p: PickRecord, listSide: 'over' | 'under'): { side: 'over' | 'under'; line: number } | null {
  const raw = str(p.predictedBand).toLowerCase();
  let side: 'over' | 'under' = listSide;
  if (raw.includes('over') && !raw.includes('under')) side = 'over';
  else if (raw.includes('under') && !raw.includes('over')) side = 'under';
  const m = raw.match(/(\d+\.?\d*)/);
  const line = m ? Number(m[1]) : NaN;
  if (Number.isNaN(line)) {
    if (raw.includes('2.5') || !raw) return { side, line: 2.5 };
    return null;
  }
  return { side, line };
}

/** One line for the goals pick: prefer `predictedBand` text; else side + line. */
function bplHubForecastLine(p: PickRecord, side: 'over' | 'under'): string {
  const b = str(p.predictedBand).replace(/\s+/g, ' ').trim();
  if (b) {
    if (/^over[\s.]/i.test(b) || /^under[\s.]/i.test(b) || /^o\.?\d/i.test(b) || /^u\.?\d/i.test(b)) {
      return b;
    }
    return `${side === 'over' ? 'Over' : 'Under'} — ${b}`;
  }
  const gl = parseGoalsLine(p, side);
  if (gl) {
    return `${side === 'over' ? 'Over' : 'Under'} ${gl.line} goals`;
  }
  return side === 'over' ? 'Over' : 'Under';
}

type Settle = 'win' | 'loss' | 'void' | 'push' | 'pending' | 'dropped';

function pickOutcomeString(p: PickRecord): string {
  return str(p.outcome).toLowerCase().trim();
}

function winProfit(p: PickRecord): number {
  const o = bookmakerOdds(p) ?? 1;
  return o - 1;
}

/**
 * Whether the fixture is full time (or otherwise finished for settlement), using status strings and a
 * kickoff+time fallback when the export has a terminal outcome but omitted status.
 */
function pickFixtureIsFullTime(p: PickRecord, now: number): boolean {
  for (const k of ['displayStatus', 'status', 'fixtureStatus', 'matchStatus', 'matchState'] as const) {
    const s = str(p[k]).toLowerCase();
    if (!s) continue;
    if (
      /\b(ft|aet|f\/t|pen(alties)?|pens?\.?|finished|full[\s-]?time|abandon|abandoned|cancel(l)?ed|postpon|postp|walkover|awarded|awrd|\bwo\b|forfeit|after extra|after et|match end|ended)\b/.test(
        s,
      )
    ) {
      return true;
    }
    if (
      /\b(live|1h|2h|h1|h2|first half|second half|halftime|half time|\bht\b|in[\s-]?play|in_play|inprogress|not started|ns\b|pre[\s-]?ko|delay|suspended|1st|2nd|int|break)\b/.test(
        s,
      )
    ) {
      return false;
    }
  }
  const o = pickOutcomeString(p);
  if (o === 'win' || o === 'loss' || o === 'void' || o === 'push') {
    const k = pickKickoffSortTimeMs(p);
    if (k != null && now - k > MS_12H) {
      return true;
    }
  }
  return false;
}

/**
 * O/U total-goals from running score. Over can only **lose** at full time (or when still below the line, treat
 * as **pending** in play). Under can only **win** at full time when still at or under the line; more goals
 * can still come. Irreversible: over wins when total &gt; line; under loses when total &gt; line.
 */
function settleBplGoalsLineFromRunningTotal(
  p: PickRecord,
  gl: { side: 'over' | 'under'; line: number },
  total: number,
  now: number,
): { result: Settle; profit1u: number; countsStake: boolean } {
  const { side, line } = gl;
  const overWins = total > line;
  if (overWins && side === 'over') {
    return { result: 'win', profit1u: winProfit(p), countsStake: true };
  }
  if (overWins && side === 'under') {
    return { result: 'loss', profit1u: -1, countsStake: true };
  }
  const isFt = pickFixtureIsFullTime(p, now);
  if (!overWins && side === 'under') {
    if (isFt) {
      return { result: 'win', profit1u: winProfit(p), countsStake: true };
    }
    return { result: 'pending', profit1u: 0, countsStake: false };
  }
  if (!overWins && side === 'over') {
    if (isFt) {
      return { result: 'loss', profit1u: -1, countsStake: true };
    }
    return { result: 'pending', profit1u: 0, countsStake: false };
  }
  return { result: 'pending', profit1u: 0, countsStake: false };
}

/**
 * Settle 1u at decimal odds. Voids and pushes: 0 P/L. Dropped: excluded.
 */
export function evaluateBplSettle(p: PickRecord, now: number): { result: Settle; profit1u: number; countsStake: boolean } {
  if (pickHasResearchExcludedStatus(p)) {
    return { result: 'dropped', profit1u: 0, countsStake: false };
  }
  const listSide = inferListSideFromBand(p);
  const oc = pickOutcomeString(p);
  if (oc === 'void' || oc === 'push') {
    return { result: oc === 'push' ? 'push' : 'void', profit1u: 0, countsStake: false };
  }
  const hs = num(p.homeScore ?? p.homeGoals);
  const as = num(p.awayScore ?? p.awayGoals);
  if (hs != null && as != null) {
    const gl = parseGoalsLine(p, listSide);
    if (gl) {
      const total = hs + as;
      return settleBplGoalsLineFromRunningTotal(p, gl, total, now);
    }
  }
  if (oc === 'win') {
    return { result: 'win', profit1u: winProfit(p), countsStake: true };
  }
  if (oc === 'loss') {
    return { result: 'loss', profit1u: -1, countsStake: true };
  }
  const k = pickKickoffSortTimeMs(p);
  if (k != null && now - k > MS_48H) {
    return { result: 'dropped', profit1u: 0, countsStake: false };
  }
  return { result: 'pending', profit1u: 0, countsStake: false };
}

function toCompact(p: PickRecord, dateKey: string, now: number): BplCompactFixture {
  const odds = bookmakerOdds(p);
  const ev = evaluateBplSettle(p, now);
  const side = inferListSideFromBand(p);
  let result: BplCompactFixture['result'] = null;
  if (ev.result === 'win') result = 'win';
  else if (ev.result === 'loss') result = 'loss';
  else if (ev.result === 'void' || ev.result === 'push') result = ev.result;
  else if (ev.result === 'pending') result = 'pending';
  else if (ev.result === 'dropped') result = 'dropped';
  return {
    id: bplPickLedgerKey(dateKey, p),
    title: pickDisplayTitle(p),
    band: str(p.predictedBand) || null,
    side,
    forecast: bplHubForecastLine(p, side),
    league: pickLeagueDisplay(p),
    kickoff: formatKickoffFromPickRecord(p),
    odds,
    result,
  };
}

export type BplDisplayDay = {
  fixtures: BplCompactFixture[];
  /** Merged BPL (best-performing) lines for the day, including those without bookmaker odds on the row. */
  bestPerformingFixtureCount: number;
  /** How many of that day’s BPL lines have bookmaker odds on the row (subset of `fixtures`). */
  withBookmakerOddsFixtureCount: number;
};

export function getBplDisplayRows(
  dateKey: string,
  selectionVal: unknown,
  exportVal: unknown,
  now: number,
): BplDisplayDay {
  const { over, under } = parseUnanimousExport(exportVal);
  const leagueWinRates = parseLeaguePerformanceFromSelection(selectionVal);
  const all: PickRecord[] = [...over, ...under];
  const best = all.filter((p) => pickPassesBestFilter(p, leagueWinRates));
  const mergedBest = mergeUnanimousPicksByFixtureBand(best);
  if (mergedBest.length === 0) {
    return {
      fixtures: [],
      bestPerformingFixtureCount: 0,
      withBookmakerOddsFixtureCount: 0,
    };
  }
  const withBookmakerOddsFixtureCount = mergedBest.filter((p) => bookmakerOdds(p) != null).length;
  return {
    fixtures: mergedBest.map((p) => toCompact(p, dateKey, now)),
    bestPerformingFixtureCount: mergedBest.length,
    withBookmakerOddsFixtureCount,
  };
}

export function applyReconciliationForDate(
  hub: BplHubState,
  dateKey: string,
  selectionVal: unknown,
  exportVal: unknown,
  now: number,
): { hub: BplHubState; processed: number } {
  const { over, under } = parseUnanimousExport(exportVal);
  const leagueWinRates = parseLeaguePerformanceFromSelection(selectionVal);
  const all: PickRecord[] = [...over, ...under];
  const best = all.filter((p) => pickPassesBestFilter(p, leagueWinRates));
  const mergedBest = mergeUnanimousPicksByFixtureBand(best);
  const pre: PickRecord[] = best.filter((p) => bookmakerOdds(p) != null);
  const merged = pre.length === 0 ? [] : mergeUnanimousPicksByFixtureBand(pre);

  let processed = 0;
  const basePreKo = hub.allTimeWithPreKoOdds ?? { wins: 0, losses: 0, voids: 0, profit: 0 };
  const next: BplHubState = {
    ...hub,
    allTime: { ...hub.allTime },
    allTimeWithPreKoOdds: { ...basePreKo },
    pickLedger: { ...hub.pickLedger },
    pickLedgerBplAll: { ...(hub.pickLedgerBplAll ?? {}) },
  };

  for (const p of merged) {
    const key = bplPickLedgerKey(dateKey, p);
    if (next.pickLedger[key]) {
      continue;
    }
    const oddsClass = bplOddsPreKickClass(p);
    const { result, profit1u, countsStake } = evaluateBplSettle(p, now);
    if (result === 'pending') {
      continue;
    }
    if (result === 'dropped') {
      next.pickLedger[key] = { dateKey, result: 'dropped', profit1u: 0, recordedAt: now, oddsPreKick: oddsClass };
      processed += 1;
      continue;
    }
    if (result === 'void' || result === 'push') {
      next.allTime.voids += 1;
      if (oddsClass === 'yes') {
        next.allTimeWithPreKoOdds.voids += 1;
      }
      next.pickLedger[key] = { dateKey, result, profit1u: 0, recordedAt: now, oddsPreKick: oddsClass };
      processed += 1;
      continue;
    }
    if (result === 'win' || result === 'loss') {
      if (result === 'win') next.allTime.wins += 1;
      else next.allTime.losses += 1;
      if (countsStake) {
        next.allTime.profit += profit1u;
      }
      if (oddsClass === 'yes' && countsStake) {
        if (result === 'win') next.allTimeWithPreKoOdds.wins += 1;
        else next.allTimeWithPreKoOdds.losses += 1;
        next.allTimeWithPreKoOdds.profit += profit1u;
      }
      next.pickLedger[key] = { dateKey, result, profit1u, recordedAt: now, oddsPreKick: oddsClass };
      processed += 1;
    }
  }

  for (const p of mergedBest) {
    const key = bplPickLedgerKey(dateKey, p);
    if (next.pickLedger[key] || next.pickLedgerBplAll[key]) {
      continue;
    }
    const { result, profit1u } = evaluateBplSettle(p, now);
    if (result === 'pending') {
      continue;
    }
    if (result === 'dropped') {
      next.pickLedgerBplAll[key] = { dateKey, result: 'dropped', profit1u: 0, recordedAt: now };
      processed += 1;
      continue;
    }
    if (result === 'void' || result === 'push') {
      next.pickLedgerBplAll[key] = { dateKey, result, profit1u: 0, recordedAt: now };
      processed += 1;
      continue;
    }
    if (result === 'win' || result === 'loss') {
      next.pickLedgerBplAll[key] = { dateKey, result, profit1u, recordedAt: now };
      processed += 1;
    }
  }

  return { hub: next, processed };
}

function parseOptionalYyyyMmDd(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return undefined;
  return t;
}

/** Earliest selection day present in a BPL ledger (from key prefix `bpl:yyyy-MM-dd|`). */
function minDateKeyFromBplKeyLedger(ledger: Record<string, unknown>): string | null {
  const dates: string[] = [];
  for (const k of Object.keys(ledger)) {
    const m = k.match(/^bpl:(\d{4}-\d{2}-\d{2})\|/);
    if (m) dates.push(m[1]);
  }
  if (dates.length === 0) return null;
  return dates.sort()[0];
}

/** Earliest `YYYY-MM-dd` in the odds ledger; used for All Time range (matches ROI). */
export function minDateKeyFromPickLedger(pickLedger: Record<string, PickLedgerEntry>): string | null {
  return minDateKeyFromBplKeyLedger(pickLedger);
}


export function parseHub(val: unknown): BplHubState {
  if (val == null || typeof val !== 'object' || Array.isArray(val)) {
    return newEmptyHub();
  }
  const o = val as Record<string, unknown>;
  if (o.v !== 1) {
    return newEmptyHub();
  }
  const al = o.allTime as Record<string, unknown> | undefined;
  const alPre = o.allTimeWithPreKoOdds as Record<string, unknown> | undefined;
  return {
    v: 1,
    allTime: {
      wins: num(al?.wins) ?? 0,
      losses: num(al?.losses) ?? 0,
      voids: num(al?.voids) ?? 0,
      profit: num(al?.profit) ?? 0,
    },
    allTimeWithPreKoOdds: {
      wins: num(alPre?.wins) ?? 0,
      losses: num(alPre?.losses) ?? 0,
      voids: num(alPre?.voids) ?? 0,
      profit: num(alPre?.profit) ?? 0,
    },
    pickLedger:
      typeof o.pickLedger === 'object' && o.pickLedger != null && !Array.isArray(o.pickLedger)
        ? (o.pickLedger as Record<string, PickLedgerEntry>)
        : {},
    pickLedgerBplAll:
      typeof o.pickLedgerBplAll === 'object' && o.pickLedgerBplAll != null && !Array.isArray(o.pickLedgerBplAll)
        ? (o.pickLedgerBplAll as Record<string, PickLedgerBplAllEntry>)
        : {},
    allTimeTrackingStartYyyyMmDd: parseOptionalYyyyMmDd(o.allTimeTrackingStartYyyyMmDd),
    current: o.current as BplHubState['current'],
    previous: (o.previous as BplHubState['previous']) ?? null,
  };
}

export function addCalendarDaysYyyyMmDd(ymd: string, delta: number): string {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return ymd;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + delta);
  const d = new Date(t);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

/**
 * "Yesterday" = calendar day before `currentKey` (Europe/London date keys are YYYY-MM-DD; use add -1 day in UTC for stability).
 */
export function previousDateKeyFrom(currentKey: string): string {
  return addCalendarDaysYyyyMmDd(currentKey, -1);
}

function allTimeRangeForHub(hub: BplHubState, currentKey: string): { startYyyyMmDd: string; endYyyyMmDd: string } {
  const endYyyyMmDd = currentKey;
  // Same start date as the ROI/odds ledger, not the BPL-only lines ledger
  const startYyyyMmDd = hub.allTimeTrackingStartYyyyMmDd ?? minDateKeyFromPickLedger(hub.pickLedger) ?? currentKey;
  return { startYyyyMmDd, endYyyyMmDd };
}

export function buildBplHubPublicPayload(
  hub: BplHubState,
  now: number,
  currentKey: string,
  previousKey: string | null,
  current: BplDisplayDay,
  previous: BplDisplayDay | null,
  serverMessage?: string,
): BplHubPublicPayload {
  const preKo = hub.allTimeWithPreKoOdds ?? { wins: 0, losses: 0, voids: 0, profit: 0 };
  return {
    allTime: publicAllTime(hub.allTime),
    allTimeBplAllLines: tallyBplAllLinesFromLedgers(hub),
    allTimeWithPreKoOdds: publicAllTimeWithPreKoOrNull(preKo),
    allTimeDateRange: allTimeRangeForHub(hub, currentKey),
    settledPickCount: Object.keys(hub.pickLedger).length,
    current: {
      dateKey: currentKey,
      generatedAtMs: now,
      fixtures: current.fixtures,
      bestPerformingFixtureCount: current.bestPerformingFixtureCount,
      withBookmakerOddsFixtureCount: current.withBookmakerOddsFixtureCount,
    },
    previous:
      previousKey && previous
        ? {
            dateKey: previousKey,
            generatedAtMs: now,
            fixtures: previous.fixtures,
            bestPerformingFixtureCount: previous.bestPerformingFixtureCount,
            withBookmakerOddsFixtureCount: previous.withBookmakerOddsFixtureCount,
          }
        : null,
    serverMessage,
  };
}

/** Call before persisting hub: fix tracking start so the range does not jump day-to-day. */
export function ensureAllTimeTrackingStart(hub: BplHubState, currentKey: string): BplHubState {
  if (hub.allTimeTrackingStartYyyyMmDd) return hub;
  const fromLedger = minDateKeyFromPickLedger(hub.pickLedger);
  return {
    ...hub,
    allTimeTrackingStartYyyyMmDd: fromLedger ?? currentKey,
  };
}
