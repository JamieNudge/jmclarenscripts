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

function stringField(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t : null;
}

/**
 * Plain string, number, or first nested string (RTDB console / bad imports sometimes store maps).
 */
function pickPrimitiveText(v: unknown, depth = 0): string | null {
  if (depth > 4) return null;
  const s = stringField(v);
  if (s) return s;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    for (const val of Object.values(v as Record<string, unknown>)) {
      const inner = pickPrimitiveText(val, depth + 1);
      if (inner) return inner;
    }
  }
  return null;
}

/** Stable key for deduping manual / export rows (id if present, else home/away/league). */
export function pickMergeKey(p: PickRecord): string {
  if (typeof p.id === 'string' && p.id.trim()) return `id:${p.id.trim()}`;
  if (typeof p.id === 'number' && Number.isFinite(p.id)) return `id:${p.id}`;
  const h = (pickPrimitiveText(p.homeTeam ?? p.home) ?? '').toLowerCase();
  const a = (pickPrimitiveText(p.awayTeam ?? p.away) ?? '').toLowerCase();
  const l = (pickPrimitiveText(p.league) ?? '').toLowerCase();
  return `teams:${h}|${a}|${l}`;
}

/** Append `additions` after `existing`, skipping duplicates (by id or home/away/league). */
export function mergeManualPickLists(existing: PickRecord[], additions: PickRecord[]): PickRecord[] {
  const seen = new Set<string>();
  const out: PickRecord[] = [];
  for (const p of existing) {
    const k = pickMergeKey(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  for (const p of additions) {
    const k = pickMergeKey(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
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

/**
 * Same threshold as Stat Strike InPlay `FixtureListView` when the **Best Performing** league chip
 * filters fixtures (`rate >= 70`).
 */
export const BEST_PERFORMING_LEAGUE_MIN_WIN_RATE_PCT = 70;

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
  const country = pickPrimitiveText(p.country);
  const league = pickPrimitiveText(p.league);
  if (!country || !league) return false;
  const key = leaguePerformanceLookupKey(country, league);
  const rate = leagueWinRates[key];
  return (
    typeof rate === 'number' &&
    !Number.isNaN(rate) &&
    rate >= BEST_PERFORMING_LEAGUE_MIN_WIN_RATE_PCT
  );
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

/** True for owner-added rows (website admin API), including loose RTDB/JSON shapes. */
export function isManualEditorPick(p: PickRecord): boolean {
  const v = p._bestPicksManualEditor;
  if (v === true || v === 1) return true;
  if (typeof v === 'string' && v.trim().toLowerCase() === 'true') return true;
  return false;
}

/** When `selections/{date}` has no `leaguePerformance`, show every merged pick (not only BPL). */
export function bestPicksUnfilteredWhenLeaguePerformanceMissing(): boolean {
  const v = process.env.NEXT_PUBLIC_BEST_PICKS_UNFILTERED_WHEN_NO_LEAGUE_PERFORMANCE?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export function pickPassesBestFilter(
  p: PickRecord,
  leagueWinRates: Record<string, number>,
): boolean {
  if (isManualEditorPick(p)) return true;
  if (
    Object.keys(leagueWinRates).length === 0 &&
    bestPicksUnfilteredWhenLeaguePerformanceMissing()
  ) {
    return true;
  }
  return isInBestPerformingLeagues(p, leagueWinRates) || isBestPerformingLeaguePick(p);
}

export function pickDisplayTitle(p: PickRecord): string {
  const title = p.title ?? p.match ?? p.fixture ?? p.selection;
  const titleStr = pickPrimitiveText(title);
  if (titleStr) return titleStr;

  const home = pickPrimitiveText(p.homeTeam ?? p.home);
  const away = pickPrimitiveText(p.awayTeam ?? p.away);
  if (home && away) {
    return `${home} vs ${away}`;
  }

  const league = pickPrimitiveText(p.league);
  if (league) return league;

  return 'Pick';
}

/**
 * Split combined fixture strings ("Home vs Away", "Home v Away") when RTDB rows only set
 * `title` / `match` / `fixture` / `selection` and omit `homeTeam` / `awayTeam` (common for some uploads).
 */
function splitFixtureTitleIntoTeams(raw: string): { home: string; away: string } | null {
  const t = raw.trim();
  if (!t) return null;
  const splitters = [/\s+vs\.?\s+/i, /\s+v\s+/i, /\s+@\s+/] as const;
  for (const re of splitters) {
    const parts = t.split(re).map((s) => s.trim()).filter(Boolean);
    if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
      return { home: parts[0], away: parts[1] };
    }
  }
  return null;
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

/**
 * Tried in order for sort, subtitle, and copying parent `groups[]` time onto `selections[]` children.
 */
const KICKOFF_SORT_FIELD_KEYS = [
  'kickoff',
  'time',
  'date',
  'fixtureDate',
  'matchDate',
  'startTime',
  'scheduledStart',
  'utcKickoff',
  'eventDate',
  'kickOff',
  'fixtureKickoff',
] as const;

function isEmptyKickoffSlot(v: unknown): boolean {
  return v == null || v === '';
}

/**
 * Epoch ms for sorting. Supports unix seconds/ms, ISO strings, UK-style dd/mm/yyyy (day first),
 * and Firestore-style `{ _seconds, _nanoseconds }` / `{ seconds, nanoseconds }`.
 */
function timeUnknownToSortMs(v: unknown): number | null {
  if (isEmptyKickoffSlot(v)) return null;
  if (typeof v === 'number' && Number.isFinite(v)) {
    const ms = v < 10_000_000_000 ? v * 1000 : v;
    const t = new Date(ms).getTime();
    return Number.isNaN(t) ? null : t;
  }
  if (typeof v === 'string') {
    const t = v.trim();
    if (!t) return null;
    let parsed = Date.parse(t);
    if (!Number.isNaN(parsed)) return parsed;
    const m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:[ T]+(\d{1,2}):(\d{2}))?/);
    if (m) {
      const day = Number(m[1]);
      const month = Number(m[2]) - 1;
      const year = Number(m[3]);
      const hh = m[4] != null ? Number(m[4]) : 12;
      const min = m[5] != null ? Number(m[5]) : 0;
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
        parsed = Date.UTC(year, month, day, hh, min, 0, 0);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return null;
  }
  if (typeof v === 'object' && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if (typeof o._seconds === 'number' && Number.isFinite(o._seconds)) {
      const nano = typeof o._nanoseconds === 'number' ? o._nanoseconds / 1e6 : 0;
      return o._seconds * 1000 + nano;
    }
    if (typeof o.seconds === 'number' && Number.isFinite(o.seconds)) {
      const nano = typeof o.nanoseconds === 'number' ? o.nanoseconds / 1e6 : 0;
      return o.seconds * 1000 + nano;
    }
  }
  return null;
}

/** Unix ms for sorting; null if no parseable time on the record. */
export function pickKickoffSortTimeMs(p: PickRecord): number | null {
  for (const k of KICKOFF_SORT_FIELD_KEYS) {
    const ms = timeUnknownToSortMs(p[k]);
    if (ms != null) return ms;
  }
  return null;
}

function formatKickoffFromPickRecord(p: PickRecord): string | null {
  for (const k of KICKOFF_SORT_FIELD_KEYS) {
    const v = p[k];
    if (isEmptyKickoffSlot(v)) continue;
    const ms = timeUnknownToSortMs(v);
    if (ms != null) {
      const s = formatKickoffUtc(ms);
      if (s) return s;
    }
    const legacy = formatKickoffField(v);
    if (legacy) return legacy;
  }
  return null;
}

/** Status-like fields copied from parent `groups[]` onto selections (filtering / subtitles). */
const GROUP_STATUS_INHERIT_KEYS = ['displayStatus', 'status', 'fixtureStatus', 'matchStatus'] as const;

/** Result fields often updated on the group row when matches go FT; copy onto each selection if missing. */
const GROUP_RESULT_INHERIT_KEYS = [
  'homeScore',
  'awayScore',
  'outcome',
  'homeGoals',
  'awayGoals',
  'score',
  'fullTimeScore',
  'finalScore',
] as const;

function isEmptyResultInheritSlot(v: unknown): boolean {
  return v == null || v === '' || (typeof v === 'number' && !Number.isFinite(v));
}

/** Copy kickoff- and status-related fields from a `groups[]` row onto a child selection when the child omits them. */
function mergeGroupKickoffOntoSelection(grp: PickRecord, item: PickRecord): PickRecord {
  const out: PickRecord = { ...item };
  for (const k of KICKOFF_SORT_FIELD_KEYS) {
    if (!isEmptyKickoffSlot(out[k])) continue;
    const gv = grp[k];
    if (!isEmptyKickoffSlot(gv)) out[k] = gv;
  }
  for (const k of GROUP_STATUS_INHERIT_KEYS) {
    if (!isEmptyKickoffSlot(out[k])) continue;
    const gv = grp[k];
    if (!isEmptyKickoffSlot(gv)) out[k] = gv;
  }
  for (const k of GROUP_RESULT_INHERIT_KEYS) {
    if (!isEmptyResultInheritSlot(out[k])) continue;
    const gv = grp[k];
    if (!isEmptyResultInheritSlot(gv)) out[k] = gv;
  }
  return out;
}

/** Earliest kickoff first; unknown kickoff last; title tie-break when times equal or missing. */
export function sortPicksByKickoffEarliestFirst(picks: PickRecord[]): PickRecord[] {
  return [...picks].sort((a, b) => {
    const ta = pickKickoffSortTimeMs(a);
    const tb = pickKickoffSortTimeMs(b);
    if (ta == null && tb == null) return pickDisplayTitle(a).localeCompare(pickDisplayTitle(b));
    if (ta == null) return 1;
    if (tb == null) return -1;
    if (ta !== tb) return ta - tb;
    return pickDisplayTitle(a).localeCompare(pickDisplayTitle(b));
  });
}

/** Latest kickoff first (newest at top of scroll); unknown kickoff last; title tie-break when times equal. */
export function sortPicksByKickoffLatestFirst(picks: PickRecord[]): PickRecord[] {
  return [...picks].sort((a, b) => {
    const ta = pickKickoffSortTimeMs(a);
    const tb = pickKickoffSortTimeMs(b);
    if (ta == null && tb == null) return pickDisplayTitle(a).localeCompare(pickDisplayTitle(b));
    if (ta == null) return 1;
    if (tb == null) return -1;
    if (ta !== tb) return tb - ta;
    return pickDisplayTitle(a).localeCompare(pickDisplayTitle(b));
  });
}

export function pickDisplaySubtitle(p: PickRecord): string | null {
  const parts: string[] = [];
  if (isManualEditorPick(p)) parts.push('Editor pick');
  const league = pickPrimitiveText(p.league);
  if (league) parts.push(league);
  const kickoff = formatKickoffFromPickRecord(p);
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
  manualExportsPath: string;
  /** Latest research-algorithm feed for the Best Picks grid (same date key as other exports). */
  researchAlgorithmSelectionsPath: string;
  /** All Models Best Forecaster: consensus-filtered daily top-N (same London date key). */
  dailyConsensusSelectionsPath: string;
} {
  const unanimousRoot =
    process.env.NEXT_PUBLIC_FIREBASE_UNANIMOUS_EXPORTS_ROOT?.trim() || 'unanimousExports';
  const selectionsRoot =
    process.env.NEXT_PUBLIC_FIREBASE_SELECTIONS_ROOT?.trim() || 'selections';
  const manualRoot =
    process.env.NEXT_PUBLIC_FIREBASE_MANUAL_EXPORTS_ROOT?.trim() || 'manualExports';
  const researchRoot =
    process.env.NEXT_PUBLIC_FIREBASE_RESEARCH_SELECTIONS_ROOT?.trim() ||
    'researchAlgorithmSelections';
  const dailyConsensusRoot =
    process.env.NEXT_PUBLIC_FIREBASE_DAILY_CONSENSUS_ROOT?.trim() || 'dailyConsensusSelections';
  return {
    unanimousPath: `${unanimousRoot}/${dateKey}`,
    selectionPath: `${selectionsRoot}/${dateKey}`,
    manualExportsPath: `${manualRoot}/${dateKey}`,
    researchAlgorithmSelectionsPath: `${researchRoot}/${dateKey}`,
    dailyConsensusSelectionsPath: `${dailyConsensusRoot}/${dateKey}`,
  };
}

export type DailyConsensusPickParsed = {
  fixtureID: number;
  home: string;
  away: string;
  league: string;
  country: string;
  band: string;
  kickoff: string;
  sources: number;
  confidence: number;
  compositeScore: number;
  outcome: string;
  homeScore: number | null;
  awayScore: number | null;
};

export type DailyConsensusFeedParsed = {
  picks: DailyConsensusPickParsed[];
  record: { wins: number; losses: number; pending: number; voids: number; rate: number };
  minSources: number | null;
  maxPicksPerDay: number | null;
};

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

/** Parses RTDB payload from All Models Best Forecaster `dailyConsensusSelections/{date}`. */
export function parseDailyConsensusSelections(val: unknown): DailyConsensusFeedParsed | null {
  if (val == null || typeof val !== 'object' || Array.isArray(val)) return null;
  const o = val as Record<string, unknown>;
  const rawPicks = o.picks;
  if (!Array.isArray(rawPicks)) return null;

  const picks: DailyConsensusPickParsed[] = [];
  for (const item of rawPicks) {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) continue;
    const p = item as Record<string, unknown>;
    const fid = num(p.fixtureID ?? p.fixtureId);
    if (fid == null) continue;
    picks.push({
      fixtureID: fid,
      home: str(p.home),
      away: str(p.away),
      league: str(p.league),
      country: str(p.country),
      band: str(p.band),
      kickoff: str(p.kickoff),
      sources: num(p.sources) ?? 0,
      confidence: num(p.confidence) ?? 0,
      compositeScore: num(p.compositeScore) ?? 0,
      outcome: str(p.outcome).toLowerCase() || 'pending',
      homeScore: num(p.homeScore),
      awayScore: num(p.awayScore),
    });
  }

  const rec = o.record;
  let record = { wins: 0, losses: 0, pending: 0, voids: 0, rate: 0 };
  if (rec != null && typeof rec === 'object' && !Array.isArray(rec)) {
    const r = rec as Record<string, unknown>;
    record = {
      wins: num(r.wins) ?? 0,
      losses: num(r.losses) ?? 0,
      pending: num(r.pending) ?? 0,
      voids: num(r.voids) ?? 0,
      rate: num(r.rate) ?? 0,
    };
  }

  return {
    picks,
    record,
    minSources: num(o.minSources),
    maxPicksPerDay: num(o.maxPicksPerDay),
  };
}

/** Pick-shaped per-model row for the research panel (matches consensus card layout on the client). */
export type ResearchAlgorithmPerModelStructured = {
  fixtureLine: string;
  metaLine: string | null;
  /** Human-readable band, e.g. Over 2.5 Goals */
  bandDisplay: string | null;
  /** Raw `predictedBand` for pill colour logic */
  bandRaw: string | null;
  /** Source app / tier line (no confidence %) */
  modelTag: string | null;
  score: string | null;
  outcome: string;
  /** Merged model lines with confidence % stripped */
  mergedDetailLines: string[] | null;
};

export type ResearchAlgorithmFeedRow = {
  primary: string;
  secondary: string | null;
  perModel?: ResearchAlgorithmPerModelStructured | null;
};

/** Shared with consensus + per-model chips. */
export function formatBandAsGoalsPhrase(band: string): string {
  const b = band.toLowerCase();
  if (b.includes('2.5')) {
    if (b.includes('under')) return 'Under 2.5 Goals';
    if (b.includes('over')) return 'Over 2.5 Goals';
  }
  const t = band.trim();
  return t.length > 0 ? t : 'Market';
}

/** Postponed / abandoned / cancelled-style codes — hidden from the research feed so NS (etc.) on the panel date surface first. */
const RESEARCH_FEED_EXCLUDED_STATUS_TOKENS = new Set([
  'PP',
  'POST',
  'POSTPONED',
  'ABN',
  'ABANDONED',
  'CANC',
  'CANCELLED',
  'CANCELED',
  'VOID',
  'SUSP',
  'SUSPENDED',
  'INTR',
  'INTERRUPTED',
]);

function normalizedResearchFeedStatusTokens(raw: string): string[] {
  const u = raw.toUpperCase().trim();
  if (!u) return [];
  const compact = u.replace(/[^A-Z0-9]/g, '');
  const words = u
    .split(/[\s/|,-]+/)
    .map((w) => w.replace(/[^A-Z0-9]/g, ''))
    .filter(Boolean);
  return Array.from(new Set([compact, ...words]));
}

function pickResearchFeedStatusExcluded(p: PickRecord): boolean {
  for (const k of GROUP_STATUS_INHERIT_KEYS) {
    const t = pickPrimitiveText(p[k]);
    if (!t) continue;
    for (const token of normalizedResearchFeedStatusTokens(t)) {
      if (RESEARCH_FEED_EXCLUDED_STATUS_TOKENS.has(token)) return true;
    }
  }
  return false;
}

function pickKickoffMatchesCalendarDateKey(p: PickRecord, dateKey: string, timeZone: string): boolean {
  const ms = pickKickoffSortTimeMs(p);
  if (ms == null) return false;
  return picksDateStringInTimeZone(timeZone, new Date(ms)) === dateKey;
}

/** Keep fixtures on the Best Picks calendar day (site timezone) and drop postponed/abandoned/cancelled rows. */
function filterResearchPicksForAlgorithmPanel(picks: PickRecord[], dateKey: string): PickRecord[] {
  const dk = dateKey.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dk)) return picks;
  const tz = picksTimeZoneFromEnv();
  return picks.filter(
    (p) => pickKickoffMatchesCalendarDateKey(p, dk, tz) && !pickResearchFeedStatusExcluded(p),
  );
}

/** Internal-only: merged subtitle lines when several model lines share one fixture + band. */
const RESEARCH_MERGED_SUBTITLE_LINES = '__researchMergedSubtitleLines';

function researchFixtureBandKey(p: PickRecord): string {
  const fidRaw = p.fixtureID ?? p.fixtureId ?? p.fixture_id;
  let idPart: string;
  if (typeof fidRaw === 'number' && Number.isFinite(fidRaw)) {
    idPart = `fid:${fidRaw}`;
  } else if (typeof fidRaw === 'string' && fidRaw.trim()) {
    idPart = `fid:${fidRaw.trim()}`;
  } else {
    const h = (pickPrimitiveText(p.homeTeam ?? p.home) ?? '').toLowerCase();
    const a = (pickPrimitiveText(p.awayTeam ?? p.away) ?? '').toLowerCase();
    idPart = `teams:${h}|${a}`;
  }
  const band = (pickPrimitiveText(p.predictedBand) ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return `${idPart}|band:${band}`;
}

/**
 * All Models uploads one `selections[]` entry per source app line; same fixture can repeat.
 * Collapse to one row per fixture+band with stacked subtitle lines.
 */
function mergeResearchPicksSameFixtureBand(picks: PickRecord[]): PickRecord[] {
  const buckets = new Map<string, PickRecord[]>();
  for (const p of picks) {
    const k = researchFixtureBandKey(p);
    const arr = buckets.get(k);
    if (arr) arr.push(p);
    else buckets.set(k, [p]);
  }
  const out: PickRecord[] = [];
  for (const group of Array.from(buckets.values())) {
    if (group.length === 1) {
      out.push(group[0]);
      continue;
    }
    const anchor: PickRecord = { ...group[0] };
    const lines = group
      .map((p) => researchAlgorithmPickSubtitleFromAllModels(p))
      .filter((s): s is string => s != null && s.length > 0);
    if (lines.length > 0) anchor[RESEARCH_MERGED_SUBTITLE_LINES] = lines;
    out.push(anchor);
  }
  return out;
}

function groupPassesResearchAlgorithmPanelFilter(grp: PickRecord, dateKey: string): boolean {
  const dk = dateKey.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dk)) return true;
  if (pickResearchFeedStatusExcluded(grp)) return false;
  return pickKickoffMatchesCalendarDateKey(grp, dk, picksTimeZoneFromEnv());
}

function researchAlgorithmRowsFromPicks(
  picks: PickRecord[],
  dateKey: string,
  secondaryFor: (p: PickRecord) => string | null,
): ResearchAlgorithmFeedRow[] {
  const filtered = filterResearchPicksForAlgorithmPanel(picks, dateKey);
  return sortPicksByKickoffEarliestFirst(filtered).map((p) => {
    const perModel = buildPerModelStructuredFromPick(p);
    if (perModel) {
      return {
        primary: perModel.fixtureLine,
        secondary: null,
        perModel,
      };
    }
    return {
      primary: pickDisplayTitle(p),
      secondary: secondaryFor(p),
    };
  });
}

/** `2-1` style line when RTDB has numeric or string score fields (per-model or consensus-shaped rows). */
function pickScoreSummaryLine(p: PickRecord): string | null {
  const hs = num(p.homeScore ?? p.homeGoals);
  const aws = num(p.awayScore ?? p.awayGoals);
  if (hs != null && aws != null) return `${hs}-${aws}`;
  const raw = pickPrimitiveText(p.score ?? p.fullTimeScore ?? p.finalScore);
  if (raw) return raw.replace(/\s+/g, '');
  return null;
}

function stripConfidencePctFromResearchModelLine(line: string): string {
  return line
    .replace(/\s*·\s*\d{1,3}\s*%\s*/gi, ' · ')
    .replace(/\s*·\s*\d{1,3}\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*·\s*·/g, ' · ')
    .replace(/^\s*·\s*/, '')
    .replace(/\s*·\s*$/, '')
    .trim();
}

function buildPerModelStructuredFromPick(p: PickRecord): ResearchAlgorithmPerModelStructured | null {
  const teams = pickTeams(p);
  if (!teams) return null;

  const fixtureLine = `${teams.home} v ${teams.away}`;
  const country = pickPrimitiveText(p.country);
  const league = pickPrimitiveText(p.league);
  const kick = formatKickoffFromPickRecord(p);
  const metaLine = [country, league, kick].filter(Boolean).join(' · ') || null;

  const bandRaw = pickPrimitiveText(p.predictedBand);
  const bandDisplay = bandRaw ? formatBandAsGoalsPhrase(bandRaw) : null;

  const app = pickPrimitiveText(p.sourceApp);
  const tier = pickPrimitiveText(p.sourceTier);
  const modelTag = [app, tier].filter(Boolean).join(' · ') || null;

  const score = pickScoreSummaryLine(p);
  const oc = pickPrimitiveText(p.outcome);
  const outcome = oc ? oc.toLowerCase() : 'pending';

  const merged = p[RESEARCH_MERGED_SUBTITLE_LINES];
  let mergedDetailLines: string[] | null = null;
  if (Array.isArray(merged) && merged.length > 0 && merged.every((x) => typeof x === 'string')) {
    mergedDetailLines = (merged as string[]).map(stripConfidencePctFromResearchModelLine).filter((s) => s.length > 0);
  }

  return {
    fixtureLine,
    metaLine,
    bandDisplay,
    bandRaw,
    modelTag,
    score,
    outcome,
    mergedDetailLines,
  };
}

function buildPerModelStructuredFromGroup(grp: PickRecord): ResearchAlgorithmPerModelStructured | null {
  const teams = pickTeams(grp);
  if (!teams) return null;

  const fixtureLine = `${teams.home} v ${teams.away}`;
  const country = pickPrimitiveText(grp.country);
  const league = pickPrimitiveText(grp.league);
  const kick = formatKickoffFromPickRecord(grp);
  const metaLine = [country, league, kick].filter(Boolean).join(' · ') || null;

  const bandRaw = pickPrimitiveText(grp.predictedBand);
  const bandDisplay = bandRaw ? formatBandAsGoalsPhrase(bandRaw) : null;

  const labelStr = Array.isArray(grp.modelLabels)
    ? grp.modelLabels.filter((x): x is string => typeof x === 'string').join(' · ')
    : null;
  const modelTag = labelStr && labelStr.trim() ? labelStr.trim() : null;

  const score = pickScoreSummaryLine(grp);
  const oc = pickPrimitiveText(grp.outcome);
  const outcome = oc ? oc.toLowerCase() : 'pending';

  return {
    fixtureLine,
    metaLine,
    bandDisplay,
    bandRaw,
    modelTag,
    score,
    outcome,
    mergedDetailLines: null,
  };
}

/** Subtitle for `ArchivedServedPick`-shaped objects from All Models macOS uploads. */
function researchAlgorithmPickSubtitleFromAllModels(p: PickRecord): string | null {
  const parts: string[] = [];
  const app = pickPrimitiveText(p.sourceApp);
  if (app) parts.push(app);
  const tier = pickPrimitiveText(p.sourceTier);
  if (tier) parts.push(tier);
  const band = pickPrimitiveText(p.predictedBand);
  if (band) parts.push(band);
  const conf = p.confidence;
  if (typeof conf === 'number' && Number.isFinite(conf)) {
    parts.push(`${Math.round(conf)}%`);
  }
  const scoreLine = pickScoreSummaryLine(p);
  if (scoreLine) parts.push(scoreLine);
  const oc = pickPrimitiveText(p.outcome);
  if (oc) parts.push(oc.toUpperCase());
  const league = pickPrimitiveText(p.league);
  if (league) parts.push(league);
  const kick = formatKickoffFromPickRecord(p);
  if (kick) parts.push(kick);
  return parts.length ? parts.join(' · ') : pickDisplaySubtitle(p);
}

function researchAlgorithmPickSubtitleFromAllModelsOrMerged(p: PickRecord): string | null {
  const merged = p[RESEARCH_MERGED_SUBTITLE_LINES];
  if (Array.isArray(merged) && merged.length > 0 && merged.every((x) => typeof x === 'string')) {
    return (merged as string[]).join('\n');
  }
  return researchAlgorithmPickSubtitleFromAllModels(p);
}

function stringArrayField(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  const out = v
    .filter((x): x is string => typeof x === 'string')
    .map((s) => s.trim())
    .filter(Boolean);
  return out.length ? out : null;
}

/**
 * Normalise RTDB payload at `researchAlgorithmSelections/{date}` into scrollable rows.
 * Supported shapes:
 * - Array of strings
 * - Array of pick-like objects (same helpers as Over/Under)
 * - Object with `lines` | `items` | `selections` | `updates` | `entries` | `feed` as string[] or object map / array of picks
 * - All Models macOS: `{ groups: [{ homeTeam, awayTeam, selections: [...ArchivedServedPick], ... }] }` (researchAlgorithmSelections); multiple `selections` for the same fixture+band are merged into one row with stacked subtitle lines
 * - Single string
 *
 * Pick-like rows are ordered by kickoff (several field names + group-inherited times), earliest UTC first within the day; unparseable last.
 * Rows are limited to kickoffs on `dateKey` (same calendar day as the panel, in `NEXT_PUBLIC_PICKS_DATE_TIMEZONE`) and exclude
 * postponed/abandoned/cancelled-style statuses (PP, ABN, …). Plain string arrays (`lines`, etc.) are unchanged.
 */
export function researchAlgorithmFeedRows(val: unknown, dateKey: string): ResearchAlgorithmFeedRow[] {
  if (val == null) return [];
  if (typeof val === 'string') {
    const t = val.trim();
    return t ? [{ primary: t, secondary: null }] : [];
  }
  if (Array.isArray(val)) {
    if (val.length > 0 && val.every((x) => typeof x === 'string')) {
      return (val as string[])
        .map((s) => s.trim())
        .filter(Boolean)
        .map((primary) => ({ primary, secondary: null }));
    }
    const picks = rtdbValueToPickList(val);
    return researchAlgorithmRowsFromPicks(picks, dateKey, pickDisplaySubtitle);
  }
  if (typeof val === 'object' && !Array.isArray(val)) {
    const o = val as PickRecord;
    // All Models Best Forecaster → RTDB `researchAlgorithmSelections/{date}`
    const groupsRaw = o.groups;
    if (Array.isArray(groupsRaw) && groupsRaw.length > 0) {
      const allPicks: PickRecord[] = [];
      for (const g of groupsRaw) {
        if (!g || typeof g !== 'object' || Array.isArray(g)) continue;
        const grp = g as PickRecord;
        const sel = grp.selections;
        if (Array.isArray(sel)) {
          for (const item of sel) {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
              allPicks.push(mergeGroupKickoffOntoSelection(grp, item as PickRecord));
            }
          }
        }
      }
      if (allPicks.length > 0) {
        const merged = mergeResearchPicksSameFixtureBand(allPicks);
        return researchAlgorithmRowsFromPicks(merged, dateKey, researchAlgorithmPickSubtitleFromAllModelsOrMerged);
      }
      const groupCandidates: PickRecord[] = [];
      for (const g of groupsRaw) {
        if (!g || typeof g !== 'object' || Array.isArray(g)) continue;
        const grp = g as PickRecord;
        const home = pickPrimitiveText(grp.homeTeam);
        const away = pickPrimitiveText(grp.awayTeam);
        if (!home || !away) continue;
        groupCandidates.push(grp);
      }
      const filteredGroups = groupCandidates.filter((grp) => groupPassesResearchAlgorithmPanelFilter(grp, dateKey));
      const sortedGroups = sortPicksByKickoffEarliestFirst(filteredGroups);
      const groupRows: ResearchAlgorithmFeedRow[] = sortedGroups.map((grp) => {
        const perModel = buildPerModelStructuredFromGroup(grp);
        if (perModel) {
          return {
            primary: perModel.fixtureLine,
            secondary: null,
            perModel,
          };
        }
        const home = pickPrimitiveText(grp.homeTeam) ?? '';
        const away = pickPrimitiveText(grp.awayTeam) ?? '';
        const labelStr = Array.isArray(grp.modelLabels)
          ? grp.modelLabels.filter((x) => typeof x === 'string').join(' · ')
          : null;
        const scoreLine = pickScoreSummaryLine(grp);
        const oc = pickPrimitiveText(grp.outcome);
        const parts = [
          labelStr,
          pickPrimitiveText(grp.displayStatus),
          scoreLine,
          oc ? oc.toUpperCase() : null,
          pickPrimitiveText(grp.league),
          formatKickoffFromPickRecord(grp),
        ].filter(Boolean);
        return {
          primary: `${home} v ${away}`,
          secondary: parts.length ? parts.join(' · ') : null,
        };
      });
      if (groupRows.length > 0) return groupRows;
    }
    const nestedKeys = ['lines', 'items', 'selections', 'updates', 'entries', 'feed'] as const;
    for (const key of nestedKeys) {
      const raw = o[key];
      const sa = stringArrayField(raw);
      if (sa) return sa.map((primary) => ({ primary, secondary: null }));
      const nestedPicks = rtdbValueToPickList(raw);
      if (nestedPicks.length > 0) {
        return researchAlgorithmRowsFromPicks(nestedPicks, dateKey, pickDisplaySubtitle);
      }
    }
    const picks = rtdbValueToPickList(val);
    return researchAlgorithmRowsFromPicks(picks, dateKey, pickDisplaySubtitle);
  }
  return [];
}

/** Tag manual-export rows so they always pass the best-leagues filter on the public page. */
export function ensureManualEditorTag(p: PickRecord): PickRecord {
  if (isManualEditorPick(p)) return p;
  return { ...p, _bestPicksManualEditor: true };
}

/**
 * Merge `manualExports/{date}` with `unanimousExports/{date}` (manual rows first).
 * Same child shape: `overForecasts` / `underForecasts`.
 */
export function mergeUnanimousAndManual(
  unanimousVal: unknown,
  manualVal: unknown,
): { over: PickRecord[]; under: PickRecord[] } {
  const u = parseUnanimousExport(unanimousVal);
  const m = parseUnanimousExport(manualVal);
  return {
    over: mergeManualPickLists([], [...m.over.map(ensureManualEditorTag), ...u.over]),
    under: mergeManualPickLists([], [...m.under.map(ensureManualEditorTag), ...u.under]),
  };
}

export function picksTimeZoneFromEnv(): string {
  return process.env.NEXT_PUBLIC_PICKS_DATE_TIMEZONE?.trim() || 'Europe/London';
}

function numOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  return null;
}

/** Home / away for stacked display (matches common export shapes + combined `title` / `fixture` strings). */
export function pickTeams(p: PickRecord): { home: string; away: string } | null {
  const home = pickPrimitiveText(p.homeTeam ?? p.home);
  const away = pickPrimitiveText(p.awayTeam ?? p.away);
  if (home && away) return { home, away };
  const titleKeys = ['title', 'match', 'fixture', 'selection'] as const;
  for (const k of titleKeys) {
    const s = pickPrimitiveText(p[k]);
    if (!s) continue;
    const pair = splitFixtureTitleIntoTeams(s);
    if (pair) return pair;
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
  const country = pickPrimitiveText(p.country) ?? '';
  const league = pickPrimitiveText(p.league) ?? '';
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
