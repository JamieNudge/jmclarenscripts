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

/** Kick-off as people read it: `25/03/2026 19:45 UTC` (always UTC for numeric / ISO values). */
function formatKickoffUtc(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min} UTC`;
}

function formatKickoffField(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'number' && Number.isFinite(v)) {
    const ms = v < 10_000_000_000 ? v * 1000 : v;
    const s = formatKickoffUtc(ms);
    return s || null;
  }
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return null;
    const parsed = Date.parse(t);
    if (!Number.isNaN(parsed)) return formatKickoffUtc(parsed) || t;
    return t;
  }
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

function numOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return null;
}

/** Home / away for stacked display (matches common export shapes). */
export function pickTeams(p: PickRecord): { home: string; away: string } | null {
  const home = p.homeTeam ?? p.home;
  const away = p.awayTeam ?? p.away;
  if (typeof home === 'string' && typeof away === 'string' && home.trim() && away.trim()) {
    return { home: home.trim(), away: away.trim() };
  }
  return null;
}

/** O2.5 / U2.5 style band row when numeric fields exist on the record. */
export function pickGoalBandValues(p: PickRecord): { label: string; value: string }[] {
  const bands: { key: string; label: string }[] = [
    { key: 'over25Confidence', label: 'O2.5' },
    { key: 'over35Confidence', label: 'O3.5' },
    { key: 'over45Confidence', label: 'O4.5' },
    { key: 'over55Confidence', label: 'O5.5' },
    { key: 'under25Confidence', label: 'U2.5' },
  ];
  const out: { label: string; value: string }[] = [];
  for (const { key, label } of bands) {
    const n = numOrNull(p[key]);
    if (n != null && n > 0) out.push({ label, value: `${Math.round(n)}%` });
  }
  return out;
}

export function pickSignificantStats(p: PickRecord): string[] {
  const s = p.significantStats;
  if (!Array.isArray(s)) return [];
  return s
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .map((x) => x.trim());
}

export function pickContextWarnings(p: PickRecord): string[] {
  const w = p.contextWarnings;
  if (!Array.isArray(w)) return [];
  return w
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .map((x) => x.trim());
}

/** Extra lines for expanded panel (optional fields from Mac / iOS-shaped exports). */
export function pickExpandedMetaLines(p: PickRecord): string[] {
  const lines: string[] = [];
  const country = typeof p.country === 'string' ? p.country.trim() : '';
  const league = typeof p.league === 'string' ? p.league.trim() : '';
  if (country && league) lines.push(`${country} · ${league}`);
  else if (league) lines.push(league);
  else if (country) lines.push(country);

  const venue = typeof p.venue === 'string' ? p.venue.trim() : '';
  if (venue) lines.push(`Venue: ${venue}`);

  const ft = typeof p.forecastType === 'string' ? p.forecastType.trim() : '';
  if (ft) lines.push(`Forecast type: ${ft}`);

  const minO = numOrNull(p.minOverConfidence);
  if (minO != null && minO > 0) lines.push(`Min over confidence: ${Math.round(minO)}%`);

  const mc = numOrNull(p.matchedCriteria);
  const tc = numOrNull(p.totalCriteria);
  if (mc != null && tc != null) lines.push(`Criteria: ${mc} / ${tc} matched`);

  const odds = numOrNull(p.bookmakerOdds);
  if (odds != null && odds > 0) {
    const imp = numOrNull(p.impliedProbability);
    const impStr = imp != null && imp > 0 ? ` · ~${Math.round(imp)}% implied` : '';
    lines.push(`Bookmaker (decimal): ${odds.toFixed(2)}${impStr}`);
  }

  const status = typeof p.status === 'string' ? p.status.trim() : '';
  if (status) lines.push(`Status: ${status}`);

  const hs = numOrNull(p.homeScore);
  const as = numOrNull(p.awayScore);
  if (hs != null && as != null) lines.push(`Score: ${hs} – ${as}`);

  return lines;
}
