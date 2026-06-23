/**
 * Today's fixtures browser — parse unanimousExports into list/detail shapes.
 */

import {
  formatBandAsGoalsPhrase,
  parseUnanimousExport,
  pickGoalBandValues,
  pickKickoffSortTimeMs,
  pickMergeKey,
  pickSignificantStats,
  pickTeams,
  sortPicksByKickoffEarliestFirst,
  type PickRecord,
} from '@/lib/best-picks-firebase';

function pickText(v: unknown): string | null {
  if (typeof v === 'string') {
    const t = v.trim();
    return t ? t : null;
  }
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return null;
}

export type FixtureListItem = {
  fixtureId: number | string;
  home: string;
  away: string;
  leagueKey: string;
  country: string | null;
  league: string | null;
  kickoffMs: number | null;
  scoreDisplay: string;
  pick: PickRecord;
};

export type FixtureLeagueGroup = {
  leagueKey: string;
  fixtures: FixtureListItem[];
};

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

export function pickFixtureId(p: PickRecord): number | string | null {
  const raw = p.id ?? p.fixtureID ?? p.fixtureId ?? p.fixture_id;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return null;
}

function pickPeakConfidence(p: PickRecord): number {
  let peak = 0;
  for (const { value } of pickGoalBandValues(p)) {
    const n = Number.parseInt(value.replace(/%/g, ''), 10);
    if (!Number.isNaN(n) && n > peak) peak = n;
  }
  return peak;
}

function mergeFirehosePicks(over: PickRecord[], under: PickRecord[]): PickRecord[] {
  const map = new Map<string, PickRecord>();
  for (const p of [...over, ...under]) {
    const id = pickFixtureId(p);
    const key = id != null ? `id:${id}` : pickMergeKey(p);
    const existing = map.get(key);
    if (!existing || pickPeakConfidence(p) > pickPeakConfidence(existing)) {
      map.set(key, p);
    }
  }
  return Array.from(map.values());
}

export function pickScoreDisplay(p: PickRecord): string {
  const hs = num(p.homeScore ?? p.homeGoals);
  const aws = num(p.awayScore ?? p.awayGoals);
  if (hs != null && aws != null) return `${hs}–${aws}`;
  const raw = pickText(p.score ?? p.fullTimeScore ?? p.finalScore);
  if (raw) return raw.replace(/\s+/g, '');
  return '–';
}

function leagueKeyForPick(p: PickRecord): string {
  const country = pickText(p.country);
  const league = pickText(p.league);
  if (country && league) return `${country} · ${league}`;
  if (league) return league;
  if (country) return country;
  return 'Other';
}

export function pickToFixtureListItem(p: PickRecord): FixtureListItem | null {
  const teams = pickTeams(p);
  if (!teams) return null;
  const fixtureId = pickFixtureId(p);
  if (fixtureId == null) return null;
  const kickoffMs = pickKickoffSortTimeMs(p);
  return {
    fixtureId,
    home: teams.home,
    away: teams.away,
    leagueKey: leagueKeyForPick(p),
    country: pickText(p.country),
    league: pickText(p.league),
    kickoffMs,
    scoreDisplay: pickScoreDisplay(p),
    pick: p,
  };
}

export function parseFixturesFromUnanimousExport(val: unknown): FixtureListItem[] {
  const { over, under } = parseUnanimousExport(val);
  const merged = mergeFirehosePicks(over, under);
  const sorted = sortPicksByKickoffEarliestFirst(merged);
  const items: FixtureListItem[] = [];
  for (const p of sorted) {
    const item = pickToFixtureListItem(p);
    if (item) items.push(item);
  }
  return items;
}

export function groupFixturesByLeague(fixtures: FixtureListItem[]): FixtureLeagueGroup[] {
  const map = new Map<string, FixtureListItem[]>();
  for (const f of fixtures) {
    const list = map.get(f.leagueKey) ?? [];
    list.push(f);
    map.set(f.leagueKey, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([leagueKey, groupFixtures]) => ({ leagueKey, fixtures: groupFixtures }));
}

export function findFixtureInExport(val: unknown, fixtureId: string): PickRecord | null {
  const { over, under } = parseUnanimousExport(val);
  const merged = mergeFirehosePicks(over, under);
  const target = fixtureId.trim();
  for (const p of merged) {
    const id = pickFixtureId(p);
    if (id != null && String(id) === target) return p;
  }
  return null;
}

export function pickPrimaryForecastLabel(p: PickRecord): string | null {
  const ft = pickText(p.forecastType);
  if (ft) return formatBandAsGoalsPhrase(ft);
  const band = pickText(p.predictedBand);
  if (band) return formatBandAsGoalsPhrase(band);
  const bands = pickGoalBandValues(p);
  if (bands.length === 0) return null;
  let best = bands[0];
  for (const b of bands.slice(1)) {
    const n = Number.parseInt(b.value, 10);
    const bestN = Number.parseInt(best.value, 10);
    if (!Number.isNaN(n) && (Number.isNaN(bestN) || n > bestN)) best = b;
  }
  return `${best.label} ${best.value}`;
}

export function pickForecastDetailLines(p: PickRecord): {
  primary: string | null;
  bands: { label: string; value: string }[];
  significantStats: string[];
  odds: string | null;
} {
  const bands = pickGoalBandValues(p);
  const oddsN = num(p.bookmakerOdds);
  const imp = num(p.impliedProbability);
  let odds: string | null = null;
  if (oddsN != null && oddsN > 1) {
    odds = `@${oddsN.toFixed(2)}`;
    if (imp != null && imp > 0) odds += ` · ~${Math.round(imp)}% implied`;
  }
  return {
    primary: pickPrimaryForecastLabel(p),
    bands,
    significantStats: pickSignificantStats(p),
    odds,
  };
}

export function fixtureDetailHref(fixtureId: number | string, dateKey: string): string {
  return `/football-predictions/fixtures/${encodeURIComponent(String(fixtureId))}?date=${encodeURIComponent(dateKey)}`;
}
