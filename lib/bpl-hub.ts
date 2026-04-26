/**
 * Best Performing Leagues (BPL) hub: display + lazy All Time settlement (server-side).
 * Reads StatStrike `selections` + `unanimousExports`; writes only `footballPredictions/bplHub`.
 */

import {
  bplOddsPreKickClass,
  mergeUnanimousPicksByFixtureBand,
  parseLeaguePerformanceFromSelection,
  parseUnanimousExport,
  pickDisplayTitle,
  pickHasResearchExcludedStatus,
  pickKickoffSortTimeMs,
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
  odds: number;
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

export type BplHubPublicPayload = {
  allTime: BplAllTimePublic;
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

export type BplHubState = {
  v: 1;
  allTime: { wins: number; losses: number; voids: number; profit: number };
  allTimeWithPreKoOdds: { wins: number; losses: number; voids: number; profit: number };
  pickLedger: Record<string, PickLedgerEntry>;
  /** Set on first hub write: first day All Time is tracked (London yyyy-MM-dd). */
  allTimeTrackingStartYyyyMmDd?: string;
  current?: { dateKey: string; generatedAtMs: number; fixtures: BplCompactFixture[] };
  previous?: { dateKey: string; generatedAtMs: number; fixtures: BplCompactFixture[] } | null;
};

const MS_48H = 48 * 60 * 60 * 1000;

export function newEmptyHub(): BplHubState {
  return {
    v: 1,
    allTime: { wins: 0, losses: 0, voids: 0, profit: 0 },
    allTimeWithPreKoOdds: { wins: 0, losses: 0, voids: 0, profit: 0 },
    pickLedger: {},
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

export function inferListSideFromBand(p: PickRecord): 'over' | 'under' {
  const b = str(p.predictedBand).toLowerCase();
  if (b.includes('under') && !b.includes('over')) return 'under';
  return 'over';
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

type Settle = 'win' | 'loss' | 'void' | 'push' | 'pending' | 'dropped';

function pickOutcomeString(p: PickRecord): string {
  return str(p.outcome).toLowerCase().trim();
}

function winProfit(p: PickRecord): number {
  const o = bookmakerOdds(p) ?? 1;
  return o - 1;
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
  if (oc === 'win') {
    return { result: 'win', profit1u: winProfit(p), countsStake: true };
  }
  if (oc === 'loss') {
    return { result: 'loss', profit1u: -1, countsStake: true };
  }
  if (oc === 'pending' || !oc) {
    const hs = num(p.homeScore ?? p.homeGoals);
    const as = num(p.awayScore ?? p.awayGoals);
    if (hs != null && as != null) {
      const total = hs + as;
      const gl = parseGoalsLine(p, listSide);
      if (gl) {
        const { side, line } = gl;
        const overWins = total > line;
        if (overWins && side === 'over') {
          return { result: 'win', profit1u: winProfit(p), countsStake: true };
        }
        if (!overWins && side === 'under') {
          return { result: 'win', profit1u: winProfit(p), countsStake: true };
        }
        if (overWins && side === 'under') {
          return { result: 'loss', profit1u: -1, countsStake: true };
        }
        if (!overWins && side === 'over') {
          return { result: 'loss', profit1u: -1, countsStake: true };
        }
      }
    }
  }
  const k = pickKickoffSortTimeMs(p);
  if (k != null && now - k > MS_48H) {
    return { result: 'dropped', profit1u: 0, countsStake: false };
  }
  return { result: 'pending', profit1u: 0, countsStake: false };
}

function toCompact(p: PickRecord, dateKey: string, now: number): BplCompactFixture {
  const odds = bookmakerOdds(p) ?? 0;
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
    odds,
    result,
  };
}

export type BplDisplayDay = {
  fixtures: BplCompactFixture[];
  /** Merged BPL (best-performing) lines for the day, including those without bookmaker odds on the row. */
  bestPerformingFixtureCount: number;
  /** Merged BPL lines that also have bookmaker odds (same list as `fixtures` when non-empty). */
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
  const withOdds = best.filter((p) => bookmakerOdds(p) != null);
  const mergedBest = mergeUnanimousPicksByFixtureBand(best);
  if (withOdds.length === 0) {
    return {
      fixtures: [],
      bestPerformingFixtureCount: mergedBest.length,
      withBookmakerOddsFixtureCount: 0,
    };
  }
  const merged = mergeUnanimousPicksByFixtureBand(withOdds);
  return {
    fixtures: merged.map((p) => toCompact(p, dateKey, now)),
    bestPerformingFixtureCount: mergedBest.length,
    withBookmakerOddsFixtureCount: merged.length,
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
  const pre: PickRecord[] = [
    ...over,
    ...under,
  ].filter(
    (p) => bookmakerOdds(p) != null && pickPassesBestFilter(p, leagueWinRates),
  );
  if (pre.length === 0) {
    return { hub, processed: 0 };
  }
  const merged = mergeUnanimousPicksByFixtureBand(pre);
  let processed = 0;
  const basePreKo = hub.allTimeWithPreKoOdds ?? { wins: 0, losses: 0, voids: 0, profit: 0 };
  const next: BplHubState = {
    ...hub,
    allTime: { ...hub.allTime },
    allTimeWithPreKoOdds: { ...basePreKo },
    pickLedger: { ...hub.pickLedger },
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
  return { hub: next, processed };
}

function parseOptionalYyyyMmDd(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return undefined;
  return t;
}

/** Earliest selection day present in the pick ledger (from key prefix `bpl:yyyy-MM-dd|`). */
export function minDateKeyFromPickLedger(pickLedger: Record<string, PickLedgerEntry>): string | null {
  const dates: string[] = [];
  for (const k of Object.keys(pickLedger)) {
    const m = k.match(/^bpl:(\d{4}-\d{2}-\d{2})\|/);
    if (m) dates.push(m[1]);
  }
  if (dates.length === 0) return null;
  return dates.sort()[0];
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
  const startYyyyMmDd =
    hub.allTimeTrackingStartYyyyMmDd ?? minDateKeyFromPickLedger(hub.pickLedger) ?? currentKey;
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
