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

/** True for owner-added rows (website admin API), including loose RTDB/JSON shapes. */
export function isManualEditorPick(p: PickRecord): boolean {
  const v = p._bestPicksManualEditor;
  if (v === true || v === 1) return true;
  if (typeof v === 'string' && v.trim().toLowerCase() === 'true') return true;
  return false;
}

export function pickPassesBestFilter(
  p: PickRecord,
  leagueWinRates: Record<string, number>,
): boolean {
  if (isManualEditorPick(p)) return true;
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

/** Copy kickoff-related fields from a `groups[]` row onto a child selection when the child omits them. */
function mergeGroupKickoffOntoSelection(grp: PickRecord, item: PickRecord): PickRecord {
  const out: PickRecord = { ...item };
  for (const k of KICKOFF_SORT_FIELD_KEYS) {
    if (!isEmptyKickoffSlot(out[k])) continue;
    const gv = grp[k];
    if (!isEmptyKickoffSlot(gv)) out[k] = gv;
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
  return {
    unanimousPath: `${unanimousRoot}/${dateKey}`,
    selectionPath: `${selectionsRoot}/${dateKey}`,
    manualExportsPath: `${manualRoot}/${dateKey}`,
    researchAlgorithmSelectionsPath: `${researchRoot}/${dateKey}`,
  };
}

export type ResearchAlgorithmFeedRow = { primary: string; secondary: string | null };

function researchAlgorithmRowsFromPicks(
  picks: PickRecord[],
  secondaryFor: (p: PickRecord) => string | null,
): ResearchAlgorithmFeedRow[] {
  return sortPicksByKickoffLatestFirst(picks).map((p) => ({
    primary: pickDisplayTitle(p),
    secondary: secondaryFor(p),
  }));
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
  const oc = pickPrimitiveText(p.outcome);
  if (oc) parts.push(oc.toUpperCase());
  const league = pickPrimitiveText(p.league);
  if (league) parts.push(league);
  const kick = formatKickoffFromPickRecord(p);
  if (kick) parts.push(kick);
  return parts.length ? parts.join(' · ') : pickDisplaySubtitle(p);
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
 * - All Models macOS: `{ groups: [{ homeTeam, awayTeam, selections: [...ArchivedServedPick], ... }] }` (researchAlgorithmSelections)
 * - Single string
 *
 * Pick-like rows are ordered by kickoff (several field names + group-inherited times), latest UTC first; unparseable last.
 * Plain string arrays (`lines`, etc.) keep upload order.
 */
export function researchAlgorithmFeedRows(val: unknown): ResearchAlgorithmFeedRow[] {
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
    return researchAlgorithmRowsFromPicks(picks, pickDisplaySubtitle);
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
        return researchAlgorithmRowsFromPicks(allPicks, researchAlgorithmPickSubtitleFromAllModels);
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
      const sortedGroups = sortPicksByKickoffLatestFirst(groupCandidates);
      const groupRows: ResearchAlgorithmFeedRow[] = sortedGroups.map((grp) => {
        const home = pickPrimitiveText(grp.homeTeam) ?? '';
        const away = pickPrimitiveText(grp.awayTeam) ?? '';
        const labelStr = Array.isArray(grp.modelLabels)
          ? grp.modelLabels.filter((x) => typeof x === 'string').join(' · ')
          : null;
        const parts = [
          labelStr,
          pickPrimitiveText(grp.displayStatus),
          pickPrimitiveText(grp.league),
          formatKickoffFromPickRecord(grp),
        ].filter(Boolean);
        return {
          primary: `${home} vs ${away}`,
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
        return researchAlgorithmRowsFromPicks(nestedPicks, pickDisplaySubtitle);
      }
    }
    const picks = rtdbValueToPickList(val);
    return researchAlgorithmRowsFromPicks(picks, pickDisplaySubtitle);
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
    over: [...m.over.map(ensureManualEditorTag), ...u.over],
    under: [...m.under.map(ensureManualEditorTag), ...u.under],
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
  const home = pickPrimitiveText(p.homeTeam ?? p.home);
  const away = pickPrimitiveText(p.awayTeam ?? p.away);
  if (home && away) return { home, away };
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
