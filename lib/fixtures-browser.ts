/**
 * Today's fixtures browser — parse unanimousExports into list/detail shapes.
 */

import {
  parseUnanimousExport,
  pickKickoffSortTimeMs,
  pickMergeKey,
  pickSignificantStats,
  pickTeams,
  recommendedBandLabelForPick,
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

function pickMergePriority(p: PickRecord): number {
  return recommendedBandLabelForPick(p) ? 1 : 0;
}

function mergeFirehosePicks(over: PickRecord[], under: PickRecord[]): PickRecord[] {
  const map = new Map<string, PickRecord>();
  for (const p of [...over, ...under]) {
    const id = pickFixtureId(p);
    const key = id != null ? `id:${id}` : pickMergeKey(p);
    const existing = map.get(key);
    if (!existing || pickMergePriority(p) > pickMergePriority(existing)) {
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

/** True when the forecast band settled as a win; null when not yet decidable. */
export function fixtureListItemWinResult(fixture: FixtureListItem): boolean | null {
  const hs = num(fixture.pick.homeScore ?? fixture.pick.homeGoals);
  const aws = num(fixture.pick.awayScore ?? fixture.pick.awayGoals);
  if (hs == null || aws == null) return null;
  const band = recommendedBandLabelForPick(fixture.pick);
  if (!band) return null;
  const total = hs + aws;
  const lower = band.toLowerCase();
  if (lower.includes('under 2.5')) return total <= 2;
  if (lower.includes('over 5.5')) return total > 5;
  if (lower.includes('over 4.5')) return total > 4;
  if (lower.includes('over 3.5')) return total > 3;
  if (lower.includes('over 2.5')) return total > 2;
  return null;
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

export function sortFixturesByKickoff(fixtures: FixtureListItem[]): FixtureListItem[] {
  return [...fixtures].sort((a, b) => {
    const ta = a.kickoffMs;
    const tb = b.kickoffMs;
    if (ta == null && tb == null) {
      const byLeague = a.leagueKey.localeCompare(b.leagueKey);
      if (byLeague !== 0) return byLeague;
      return a.home.localeCompare(b.home);
    }
    if (ta == null) return 1;
    if (tb == null) return -1;
    if (ta !== tb) return ta - tb;
    const byLeague = a.leagueKey.localeCompare(b.leagueKey);
    if (byLeague !== 0) return byLeague;
    return a.home.localeCompare(b.home);
  });
}

export function groupFixturesByLeague(fixtures: FixtureListItem[]): FixtureLeagueGroup[] {
  const map = new Map<string, FixtureListItem[]>();
  for (const f of fixtures) {
    const list = map.get(f.leagueKey) ?? [];
    list.push(f);
    map.set(f.leagueKey, list);
  }
  const groups = Array.from(map.entries()).map(([leagueKey, groupFixtures]) => ({
    leagueKey,
    fixtures: sortFixturesByKickoff(groupFixtures),
  }));
  groups.sort((a, b) => {
    const ea = a.fixtures[0]?.kickoffMs ?? null;
    const eb = b.fixtures[0]?.kickoffMs ?? null;
    if (ea == null && eb == null) return a.leagueKey.localeCompare(b.leagueKey);
    if (ea == null) return 1;
    if (eb == null) return -1;
    if (ea !== eb) return ea - eb;
    return a.leagueKey.localeCompare(b.leagueKey);
  });
  return groups;
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
  return recommendedBandLabelForPick(p);
}

export function pickForecastDetailLines(p: PickRecord): {
  primary: string | null;
  significantStats: string[];
  oddsDecimal: number | null;
} {
  const oddsN = num(p.bookmakerOdds);
  const oddsDecimal = oddsN != null && oddsN > 1 ? oddsN : null;
  return {
    primary: pickPrimaryForecastLabel(p),
    significantStats: pickSignificantStats(p),
    oddsDecimal,
  };
}

export function fixtureDetailHref(fixtureId: number | string, dateKey: string): string {
  return `/football-predictions/fixtures/${encodeURIComponent(String(fixtureId))}?date=${encodeURIComponent(dateKey)}`;
}
