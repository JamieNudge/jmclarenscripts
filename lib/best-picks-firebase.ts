/**
 * Helpers for Realtime Database payloads on the best-picks page.
 * Aligned with Stat Strike Firebase (Mac): unanimousExports + selections.leaguePerformance.
 */

export type PickRecord = Record<string, unknown>;

/** Normalise RTDB object maps or arrays into a list of pick objects. */
export function rtdbValueToPickList(val: unknown): PickRecord[] {
  if (val == null) return [];
  if (Array.isArray(val)) {
    return val.filter((v): v is PickRecord => v != null && typeof v === 'object' && !Array.isArray(v));
  }
  if (typeof val === 'object') {
    return Object.values(val as Record<string, unknown>).filter(
      (v): v is PickRecord => v != null && typeof v === 'object' && !Array.isArray(v),
    );
  }
  return [];
}

/**
 * Same sanitization as Swift `BestPerformingLeagueSelection.sanitizedKey`
 * (AllModelsSharedExport / leaguePerformanceForUpload).
 */
export function leaguePerformanceLookupKey(country: string, league: string): string {
  const uniqueKey = `${country} - ${league}`;
  return uniqueKey
    .replace(/\./g, '_')
    .replace(/\//g, '_')
    .replace(/#/g, '_')
    .replace(/\$/g, '_')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')');
}

/** `selections/{date}` payload: optional league → win rate % for iOS "Best Performing" chip. */
export function parseLeaguePerformanceFromSelection(val: unknown): Record<string, number> {
  if (val == null || typeof val !== 'object' || Array.isArray(val)) return {};
  const lp = (val as PickRecord).leaguePerformance;
  if (lp == null || typeof lp !== 'object' || Array.isArray(lp)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(lp)) {
    if (typeof v === 'number' && !Number.isNaN(v)) out[k] = v;
  }
  return out;
}

/** `unanimousExports/{date}` — UnanimousExport from the Mac app. */
export function parseUnanimousExport(val: unknown): { over: PickRecord[]; under: PickRecord[] } {
  if (val == null || typeof val !== 'object' || Array.isArray(val)) {
    return { over: [], under: [] };
  }
  const o = val as PickRecord;
  return {
    over: rtdbValueToPickList(o.overForecasts),
    under: rtdbValueToPickList(o.underForecasts),
  };
}

export function isInBestPerformingLeagues(
  p: PickRecord,
  leagueWinRates: Record<string, number>,
): boolean {
  if (Object.keys(leagueWinRates).length === 0) return false;
  const country = p.country;
  const league = p.league;
  if (typeof country !== 'string' || typeof league !== 'string') return false;
  const key = leaguePerformanceLookupKey(country, league);
  return key in leagueWinRates;
}

/** Fallback for other upload shapes (boolean / tags). */
export function isBestPerformingLeaguePick(p: PickRecord): boolean {
  if (p.bestPerformingLeagues === true) return true;
  if (p.bestPerformingLeague === true) return true;
  if (p.bestPerforming === true) return true;
  if (p.best_leagues === true) return true;

  const tags = p.tags;
  if (Array.isArray(tags)) {
    return tags.some((t) =>
      String(t).toLowerCase().replace(/\s+/g, ' ').includes('best performing'),
    );
  }
  if (typeof tags === 'string') {
    return tags.toLowerCase().includes('best performing');
  }
  return false;
}

export function pickPassesBestFilter(
  p: PickRecord,
  leagueWinRates: Record<string, number>,
): boolean {
  return isInBestPerformingLeagues(p, leagueWinRates) || isBestPerformingLeaguePick(p);
}

export function pickDisplayTitle(p: PickRecord): string {
  const title = p.title ?? p.match ?? p.fixture ?? p.selection;
  if (typeof title === 'string' && title.trim()) return title.trim();

  const home = p.homeTeam ?? p.home;
  const away = p.awayTeam ?? p.away;
  if (typeof home === 'string' && typeof away === 'string' && home && away) {
    return `${home} vs ${away}`;
  }

  const league = p.league;
  if (typeof league === 'string' && league.trim()) return league.trim();

  return 'Pick';
}

function formatKickoffField(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) {
    try {
      return new Date(v).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return null;
    }
  }
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

export function pickDisplaySubtitle(p: PickRecord): string | null {
  const parts: string[] = [];
  const league = p.league;
  if (typeof league === 'string' && league.trim()) parts.push(league.trim());
  const kickoff = formatKickoffField(p.kickoff ?? p.time ?? p.date);
  if (kickoff) parts.push(kickoff);
  return parts.length ? parts.join(' · ') : null;
}

/** Calendar date yyyy-MM-dd for RTDB paths (matches Mac `DailySelection.date` / export key). */
export function picksDateStringInTimeZone(timeZone: string, when: Date = new Date()): string {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = dtf.formatToParts(when);
  const y = parts.find((x) => x.type === 'year')?.value;
  const m = parts.find((x) => x.type === 'month')?.value;
  const d = parts.find((x) => x.type === 'day')?.value;
  if (y && m && d) return `${y}-${m}-${d}`;
  return when.toISOString().slice(0, 10);
}

export function statStrikeRtdbPathsFromEnv(dateKey: string): {
  unanimousPath: string;
  selectionPath: string;
} {
  const unanimousRoot =
    process.env.NEXT_PUBLIC_FIREBASE_UNANIMOUS_EXPORTS_ROOT?.trim() || 'unanimousExports';
  const selectionsRoot =
    process.env.NEXT_PUBLIC_FIREBASE_SELECTIONS_ROOT?.trim() || 'selections';
  return {
    unanimousPath: `${unanimousRoot}/${dateKey}`,
    selectionPath: `${selectionsRoot}/${dateKey}`,
  };
}

export function picksTimeZoneFromEnv(): string {
  return process.env.NEXT_PUBLIC_PICKS_DATE_TIMEZONE?.trim() || 'Europe/London';
}
