/**
 * Accepts common handwritten date forms and returns canonical YYYY-MM-DD for RTDB paths.
 * Defaults to UK order (D/M/Y) when ambiguous (matches NEXT_PUBLIC_PICKS_DATE_TIMEZONE usage).
 */

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function isValidYmd(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day
  );
}

/**
 * Parse user-typed calendar date → `YYYY-MM-DD`, or `null` if unrecognisable.
 * Supports:
 * - `2026-03-23` (ISO)
 * - `23/03/2026`, `23-03-2026`, `23.03.2026` (UK D/M/Y)
 * - `23/03/26` (2-digit year → 20xx)
 * - `2026/03/23`, `2026.03.23` (Y/M/D)
 */
export function normalizePicksCalendarDateInput(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const y = +m[1];
    const mo = +m[2];
    const d = +m[3];
    return isValidYmd(y, mo, d) ? `${m[1]}-${m[2]}-${m[3]}` : null;
  }

  m = s.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/);
  if (m) {
    const y = +m[1];
    const mo = +m[2];
    const d = +m[3];
    return isValidYmd(y, mo, d) ? `${y}-${pad2(mo)}-${pad2(d)}` : null;
  }

  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (m) {
    const p1 = +m[1];
    const p2 = +m[2];
    let y = +m[3];
    if (y < 100) y += 2000;

    const asDmy = isValidYmd(y, p2, p1) ? `${y}-${pad2(p2)}-${pad2(p1)}` : null;
    const asMdy = isValidYmd(y, p1, p2) ? `${y}-${pad2(p1)}-${pad2(p2)}` : null;

    if (asDmy && !asMdy) return asDmy;
    if (asMdy && !asDmy) return asMdy;
    if (asDmy && asMdy) return asDmy === asMdy ? asDmy : asDmy;
    return null;
  }

  return null;
}
