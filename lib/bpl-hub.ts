/**
 * Best Performing Leagues (BPL) hub: display + lazy All Time settlement (server-side).
 * Reads Stat Strike `selections` + `unanimousExports`; writes only `footballPredictions/bplHub`.
 */

import {
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
  settledPickCount: number;
  current: { dateKey: string; generatedAtMs: number; fixtures: BplCompactFixture[] };
  previous: { dateKey: string; generatedAtMs: number; fixtures: BplCompactFixture[] } | null;
  serverMessage?: string;
};

type PickLedgerEntry = {
  dateKey: string;
  result: 'win' | 'loss' | 'void' | 'push' | 'dropped';
  profit1u: number;
  recordedAt: number;
};

export type BplHubState = {
  v: 1;
  allTime: { wins: number; losses: number; voids: number; profit: number };
  pickLedger: Record<string, PickLedgerEntry>;
  current?: { dateKey: string; generatedAtMs: number; fixtures: BplCompactFixture[] };
  previous?: { dateKey: string; generatedAtMs: number; fixtures: BplCompactFixture[] } | null;
};

const MS_48H = 48 * 60 * 60 * 1000;

export function newEmptyHub(): BplHubState {
  return {
    v: 1,
    allTime: { wins: 0, losses: 0, voids: 0, profit: 0 },
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

export function getBplDisplayRows(
  dateKey: string,
  selectionVal: unknown,
  exportVal: unknown,
  now: number,
): BplCompactFixture[] {
  const { over, under } = parseUnanimousExport(exportVal);
  const leagueWinRates = parseLeaguePerformanceFromSelection(selectionVal);
  const pre: PickRecord[] = [
    ...over,
    ...under,
  ].filter(
    (p) => bookmakerOdds(p) != null && pickPassesBestFilter(p, leagueWinRates),
  );
  if (pre.length === 0) return [];
  const merged = mergeUnanimousPicksByFixtureBand(pre);
  return merged.map((p) => toCompact(p, dateKey, now));
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
  const next: BplHubState = {
    ...hub,
    allTime: { ...hub.allTime },
    pickLedger: { ...hub.pickLedger },
  };
  for (const p of merged) {
    const key = bplPickLedgerKey(dateKey, p);
    if (next.pickLedger[key]) {
      continue;
    }
    const { result, profit1u, countsStake } = evaluateBplSettle(p, now);
    if (result === 'pending') {
      continue;
    }
    if (result === 'dropped') {
      next.pickLedger[key] = { dateKey, result: 'dropped', profit1u: 0, recordedAt: now };
      processed += 1;
      continue;
    }
    if (result === 'void' || result === 'push') {
      next.allTime.voids += 1;
      next.pickLedger[key] = { dateKey, result, profit1u: 0, recordedAt: now };
      processed += 1;
      continue;
    }
    if (result === 'win' || result === 'loss') {
      if (result === 'win') next.allTime.wins += 1;
      else next.allTime.losses += 1;
      if (countsStake) {
        next.allTime.profit += profit1u;
      }
      next.pickLedger[key] = { dateKey, result, profit1u, recordedAt: now };
      processed += 1;
    }
  }
  return { hub: next, processed };
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
  return {
    v: 1,
    allTime: {
      wins: num(al?.wins) ?? 0,
      losses: num(al?.losses) ?? 0,
      voids: num(al?.voids) ?? 0,
      profit: num(al?.profit) ?? 0,
    },
    pickLedger:
      typeof o.pickLedger === 'object' && o.pickLedger != null && !Array.isArray(o.pickLedger)
        ? (o.pickLedger as Record<string, PickLedgerEntry>)
        : {},
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

export function buildBplHubPublicPayload(
  hub: BplHubState,
  now: number,
  currentKey: string,
  previousKey: string | null,
  currentFixtures: BplCompactFixture[],
  previousFixtures: BplCompactFixture[],
  serverMessage?: string,
): BplHubPublicPayload {
  return {
    allTime: publicAllTime(hub.allTime),
    settledPickCount: Object.keys(hub.pickLedger).length,
    current: { dateKey: currentKey, generatedAtMs: now, fixtures: currentFixtures },
    previous: previousKey
      ? { dateKey: previousKey, generatedAtMs: now, fixtures: previousFixtures }
      : null,
    serverMessage,
  };
}
