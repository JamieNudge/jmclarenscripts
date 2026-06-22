/**
 * Key signals for fixture detail — mirrors StatStrike iOS userFacingSignificantStat,
 * enriched with sample size and date span when fixtureContexts is on RTDB.
 */

import { pickSignificantStats, type PickRecord } from '@/lib/best-picks-firebase';

export type WebMatchRow = {
  dateCompact: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  leagueCode: string;
};

export type FixtureStatsSummary = {
  h2hLast6Over25Percent: number;
  h2hHomeVenueLast6Over25Percent: number;
  bttsHomeVenueLast6Percent: number;
  homeTeamLast6HomeOver25Percent: number;
  awayTeamLast6AwayOver25Percent: number;
  homeConcessionLast6HomePercent: number;
  awayConcessionLast6AwayPercent: number;
  homeAvgGoalsLast6Home: number;
  awayAvgGoalsLast6Away: number;
  h2hHomeVenueAvgGoals: number;
  h2hAllVenuesAvgGoals: number;
};

export type FixtureContextExport = {
  fixtureId: number;
  dataCompleteness?: {
    h2hAllVenuesCount: number;
    h2hHomeVenueCount: number;
    homeGamesCount: number;
    awayGamesCount: number;
  };
  h2hLast6: WebMatchRow[];
  h2hHomeVenueLast6: WebMatchRow[];
  homeLast6: WebMatchRow[];
  awayLast6: WebMatchRow[];
  statsSummary: FixtureStatsSummary;
};

export type KeySignalLine = {
  id: string;
  label: string;
  value: string;
  meta: string | null;
};

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function pct(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

function decimal(value: number): string {
  return value.toFixed(1);
}

/** Parse ddMMyy (e.g. 230425 → 23 Apr 2025 UTC). */
function parseCompactDateMs(compact: string): number | null {
  const m = compact.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = 2000 + Number(m[3]);
  return Date.UTC(year, month - 1, day);
}

function compactYear(compact: string): number | null {
  const ms = parseCompactDateMs(compact);
  if (ms == null) return null;
  return new Date(ms).getUTCFullYear();
}

/** Oldest→newest span label, e.g. `2019–250423` or `120922–230425`. */
export function matchSampleDateSpan(matches: WebMatchRow[]): string | null {
  if (matches.length === 0) return null;
  const withMs = matches
    .map((m) => ({ compact: m.dateCompact, ms: parseCompactDateMs(m.dateCompact) }))
    .filter((x): x is { compact: string; ms: number } => x.ms != null);
  if (withMs.length === 0) return null;
  withMs.sort((a, b) => a.ms - b.ms);
  const oldest = withMs[0];
  const newest = withMs[withMs.length - 1];
  const oldestYear = new Date(oldest.ms).getUTCFullYear();
  const newestYear = new Date(newest.ms).getUTCFullYear();
  if (oldestYear < newestYear - 1) {
    return `${oldestYear}–${newest.compact}`;
  }
  if (oldest.compact === newest.compact) return newest.compact;
  return `${oldest.compact}–${newest.compact}`;
}

function countOver25(matches: WebMatchRow[]): { hits: number; total: number } {
  const total = matches.length;
  const hits = matches.filter((m) => m.homeGoals + m.awayGoals > 2).length;
  return { hits, total };
}

function countBtts(matches: WebMatchRow[]): { hits: number; total: number } {
  const total = matches.length;
  const hits = matches.filter((m) => m.homeGoals > 0 && m.awayGoals > 0).length;
  return { hits, total };
}

function countConceded(matches: WebMatchRow[], homeTeamName: string): { hits: number; total: number } {
  const total = matches.length;
  const norm = homeTeamName.trim().toLowerCase();
  const hits = matches.filter((m) => {
    const isHome = m.homeTeam.trim().toLowerCase() === norm;
    const conceded = isHome ? m.awayGoals : m.homeGoals;
    return conceded > 0;
  }).length;
  return { hits, total };
}

function sampleMeta(
  matches: WebMatchRow[],
  hits: number | null,
  homeTeamForConcession?: string,
): string | null {
  const total = matches.length;
  if (total === 0) return null;
  const span = matchSampleDateSpan(matches);
  const hitPart =
    hits != null ? `(${hits}/${total})` : `(${total} games)`;
  if (!span) return hitPart;
  return `${hitPart} · ${span}`;
}

type SignalSpec = {
  id: string;
  label: string;
  value: string;
  matches: WebMatchRow[];
  hits: number | null;
  homeTeamForConcession?: string;
};

function parseFixtureContextExport(val: unknown): FixtureContextExport | null {
  if (val == null || typeof val !== 'object' || Array.isArray(val)) return null;
  const o = val as Record<string, unknown>;
  const statsRaw = o.statsSummary;
  if (statsRaw == null || typeof statsRaw !== 'object' || Array.isArray(statsRaw)) return null;
  const s = statsRaw as Record<string, unknown>;
  const readMatches = (k: string): WebMatchRow[] => {
    const arr = o[k];
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is WebMatchRow => x != null && typeof x === 'object' && !Array.isArray(x)) as WebMatchRow[];
  };
  const fixtureId = num(o.fixtureId);
  if (fixtureId == null) return null;
  const pickNum = (key: string) => num(s[key]) ?? 0;
  return {
    fixtureId,
    dataCompleteness:
      o.dataCompleteness != null && typeof o.dataCompleteness === 'object' && !Array.isArray(o.dataCompleteness)
        ? {
            h2hAllVenuesCount: num((o.dataCompleteness as Record<string, unknown>).h2hAllVenuesCount) ?? 0,
            h2hHomeVenueCount: num((o.dataCompleteness as Record<string, unknown>).h2hHomeVenueCount) ?? 0,
            homeGamesCount: num((o.dataCompleteness as Record<string, unknown>).homeGamesCount) ?? 0,
            awayGamesCount: num((o.dataCompleteness as Record<string, unknown>).awayGamesCount) ?? 0,
          }
        : undefined,
    h2hLast6: readMatches('h2hLast6'),
    h2hHomeVenueLast6: readMatches('h2hHomeVenueLast6'),
    homeLast6: readMatches('homeLast6'),
    awayLast6: readMatches('awayLast6'),
    statsSummary: {
      h2hLast6Over25Percent: pickNum('h2hLast6Over25Percent'),
      h2hHomeVenueLast6Over25Percent: pickNum('h2hHomeVenueLast6Over25Percent'),
      bttsHomeVenueLast6Percent: pickNum('bttsHomeVenueLast6Percent'),
      homeTeamLast6HomeOver25Percent: pickNum('homeTeamLast6HomeOver25Percent'),
      awayTeamLast6AwayOver25Percent: pickNum('awayTeamLast6AwayOver25Percent'),
      homeConcessionLast6HomePercent: pickNum('homeConcessionLast6HomePercent'),
      awayConcessionLast6AwayPercent: pickNum('awayConcessionLast6AwayPercent'),
      homeAvgGoalsLast6Home: pickNum('homeAvgGoalsLast6Home'),
      awayAvgGoalsLast6Away: pickNum('awayAvgGoalsLast6Away'),
      h2hHomeVenueAvgGoals: pickNum('h2hHomeVenueAvgGoals'),
      h2hAllVenuesAvgGoals: pickNum('h2hAllVenuesAvgGoals'),
    },
  };
}

export function parseFixtureContextFromRtdb(val: unknown): FixtureContextExport | null {
  return parseFixtureContextExport(val);
}

/** Fallback stats row from `selections/{date}.stats` when fixtureContexts not uploaded yet. */
export function findSelectionStatsForFixture(selectionVal: unknown, fixtureId: string): FixtureStatsSummary | null {
  if (selectionVal == null || typeof selectionVal !== 'object' || Array.isArray(selectionVal)) return null;
  const stats = (selectionVal as Record<string, unknown>).stats;
  if (!Array.isArray(stats)) return null;
  const target = fixtureId.trim();
  for (const row of stats) {
    if (row == null || typeof row !== 'object' || Array.isArray(row)) continue;
    const r = row as Record<string, unknown>;
    const fixture = r.fixture;
    if (fixture == null || typeof fixture !== 'object' || Array.isArray(fixture)) continue;
    const id = num((fixture as Record<string, unknown>).id);
    if (id == null || String(id) !== target) continue;
    const pick = (k: string) => num(r[k]) ?? 0;
    return {
      h2hLast6Over25Percent: pick('h2hLast6Over25Percent'),
      h2hHomeVenueLast6Over25Percent: pick('h2hHomeVenueLast6Over25Percent'),
      bttsHomeVenueLast6Percent: pick('bttsHomeVenueLast6Percent'),
      homeTeamLast6HomeOver25Percent: pick('homeTeamLast6HomeOver25Percent'),
      awayTeamLast6AwayOver25Percent: pick('awayTeamLast6AwayOver25Percent'),
      homeConcessionLast6HomePercent: pick('homeConcessionLast6HomePercent'),
      awayConcessionLast6AwayPercent: pick('awayConcessionLast6AwayPercent'),
      homeAvgGoalsLast6Home: pick('homeAvgGoalsLast6Home'),
      awayAvgGoalsLast6Away: pick('awayAvgGoalsLast6Away'),
      h2hHomeVenueAvgGoals: pick('h2hHomeVenueAvgGoals'),
      h2hAllVenuesAvgGoals: pick('h2hAllVenuesAvgGoals'),
    };
  }
  return null;
}

function signalFromRaw(
  raw: string,
  stats: FixtureStatsSummary,
  context: FixtureContextExport | null,
  homeTeam: string,
  awayTeam: string,
): SignalSpec | null {
  const isLenient = raw.toLowerCase().includes('lenient');
  const decorate = (label: string) => (isLenient ? `${label} (lenient)` : label);

  if (raw.includes('H2H Home Venue Over 2.5%') || raw.includes('H2H Home Venue O2.5%')) {
    const matches = context?.h2hHomeVenueLast6 ?? [];
    const { hits, total } = countOver25(matches);
    return {
      id: 'h2h-venue-o25',
      label: decorate('H2H @ venue O2.5'),
      value: pct(stats.h2hHomeVenueLast6Over25Percent),
      matches,
      hits: total > 0 ? hits : null,
    };
  }
  if (raw.includes('H2H Over 2.5%') || raw.includes('H2H Last 6 O2.5%')) {
    const matches = context?.h2hLast6 ?? [];
    const { hits, total } = countOver25(matches);
    return {
      id: 'h2h-o25',
      label: decorate('H2H O2.5'),
      value: pct(stats.h2hLast6Over25Percent),
      matches,
      hits: total > 0 ? hits : null,
    };
  }
  if (raw.includes('BTTS Home Venue')) {
    const matches = context?.h2hHomeVenueLast6 ?? [];
    const { hits, total } = countBtts(matches);
    return {
      id: 'h2h-venue-btts',
      label: decorate('H2H @ venue BTTS'),
      value: pct(stats.bttsHomeVenueLast6Percent),
      matches,
      hits: total > 0 ? hits : null,
    };
  }
  if (raw.includes('Home Team Over 2.5%') || raw.includes('Home Team O2.5%')) {
    const matches = context?.homeLast6 ?? [];
    const { hits, total } = countOver25(matches);
    return {
      id: 'home-o25',
      label: decorate('Home @ home O2.5'),
      value: pct(stats.homeTeamLast6HomeOver25Percent),
      matches,
      hits: total > 0 ? hits : null,
    };
  }
  if (raw.includes('Away Team Over 2.5%') || raw.includes('Away Team O2.5%')) {
    const matches = context?.awayLast6 ?? [];
    const { hits, total } = countOver25(matches);
    return {
      id: 'away-o25',
      label: decorate('Away @ away O2.5'),
      value: pct(stats.awayTeamLast6AwayOver25Percent),
      matches,
      hits: total > 0 ? hits : null,
    };
  }
  if (raw.includes('Home Concession%')) {
    const matches = context?.homeLast6 ?? [];
    const { hits, total } = countConceded(matches, homeTeam);
    return {
      id: 'home-conceded',
      label: decorate('Home @ home conceded'),
      value: pct(stats.homeConcessionLast6HomePercent),
      matches,
      hits: total > 0 ? hits : null,
      homeTeamForConcession: homeTeam,
    };
  }
  if (raw.includes('Away Concession%')) {
    const matches = context?.awayLast6 ?? [];
    const { hits, total } = countConceded(matches, awayTeam);
    return {
      id: 'away-conceded',
      label: decorate('Away @ away conceded'),
      value: pct(stats.awayConcessionLast6AwayPercent),
      matches,
      hits: total > 0 ? hits : null,
      homeTeamForConcession: awayTeam,
    };
  }
  if (raw.includes('Home Avg Goals')) {
    return {
      id: 'home-avg',
      label: decorate('Home @ home avg goals'),
      value: decimal(stats.homeAvgGoalsLast6Home),
      matches: context?.homeLast6 ?? [],
      hits: null,
    };
  }
  if (raw.includes('Away Avg Goals')) {
    return {
      id: 'away-avg',
      label: decorate('Away @ away avg goals'),
      value: decimal(stats.awayAvgGoalsLast6Away),
      matches: context?.awayLast6 ?? [],
      hits: null,
    };
  }
  if (raw.includes('H2H Home Venue Avg')) {
    return {
      id: 'h2h-venue-avg',
      label: decorate('H2H @ venue avg goals'),
      value: decimal(stats.h2hHomeVenueAvgGoals),
      matches: context?.h2hHomeVenueLast6 ?? [],
      hits: null,
    };
  }
  if (raw.includes('H2H All Venues Avg')) {
    return {
      id: 'h2h-all-avg',
      label: decorate('All H2H avg goals'),
      value: decimal(stats.h2hAllVenuesAvgGoals),
      matches: context?.h2hLast6 ?? [],
      hits: null,
    };
  }
  return null;
}

export function buildKeySignalLines(
  pick: PickRecord,
  homeTeam: string,
  awayTeam: string,
  context: FixtureContextExport | null,
  selectionStatsFallback: FixtureStatsSummary | null,
): KeySignalLine[] {
  const stats = context?.statsSummary ?? selectionStatsFallback;
  if (!stats) {
    return pickSignificantStats(pick).map((raw, i) => ({
      id: `raw-${i}`,
      label: raw.replace(/O2\.5%/g, 'O2.5'),
      value: '',
      meta: null,
    }));
  }

  const lines: KeySignalLine[] = [];
  const seen = new Set<string>();
  for (const raw of pickSignificantStats(pick)) {
    const spec = signalFromRaw(raw, stats, context, homeTeam, awayTeam);
    if (!spec || seen.has(spec.id)) continue;
    seen.add(spec.id);
    lines.push({
      id: spec.id,
      label: spec.label,
      value: spec.value,
      meta: sampleMeta(spec.matches, spec.hits, spec.homeTeamForConcession),
    });
  }
  return lines;
}

export function fixtureContextRtdbPath(dateKey: string, fixtureId: string): string {
  const root = process.env.NEXT_PUBLIC_FIREBASE_FIXTURE_CONTEXTS_ROOT?.trim() || 'fixtureContexts';
  return `${root}/${dateKey}/${fixtureId}`;
}

export function modelScoreFromPick(pick: PickRecord): string | null {
  const matched = num(pick.matchedCriteria);
  const total = num(pick.totalCriteria);
  if (matched != null && total != null && total > 0) return `${matched} / ${total}`;
  return null;
}
