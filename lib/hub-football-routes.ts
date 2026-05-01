/**
 * GoalLab hub host: shorter public URLs without the `/football-predictions` prefix.
 * Keep in sync with {@link middleware.ts}.
 */

const DEFAULT_HUB_HOSTS = 'thegoallab.net,www.thegoallab.net';

/** First path segment under `/football-predictions/*` that may appear at the domain root on hub hosts. */
export const HUB_FP_SEGMENT_SLUGS = [
  'about',
  'contact',
  'methodology',
  'privacy',
  'how-it-works',
  'research-algorithm-selections',
  'and-another-thing',
] as const;

export const HUB_FP_SLUG_SET = new Set<string>(HUB_FP_SEGMENT_SLUGS);

export function parseHubHostList(raw?: string): Set<string> {
  const s = raw ?? process.env.HUB_ONLY_HOSTS ?? DEFAULT_HUB_HOSTS;
  return new Set(
    s
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isHubHostname(host: string): boolean {
  const h = host.split(':')[0]?.toLowerCase() ?? '';
  return h.length > 0 && parseHubHostList().has(h);
}

/**
 * Map hub short pathname → canonical `/football-predictions/...` for comparisons (nav active state).
 * On non-hub hosts, returns pathname unchanged. Pass `hostname` from `window.location.hostname` on the client.
 */
export function pathnameToLongFpPath(pathname: string | null, hostname: string | null | undefined): string | null {
  if (!pathname) return null;
  if (!hostname || !isHubHostname(hostname)) return pathname;
  if (pathname.startsWith('/football-predictions')) return pathname;
  if (pathname === '/') return '/football-predictions';
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'blog') return pathname;
  if (parts.length >= 1 && HUB_FP_SLUG_SET.has(parts[0])) {
    return `/football-predictions/${parts.join('/')}`;
  }
  return pathname;
}

/**
 * Client-only: hub-friendly href with hash (server cannot see `#` in middleware).
 * Example: `('/football-predictions#how-apps-work', true)` → `/#how-apps-work`
 */
/**
 * Navigation href for the browser / Next router: on GoalLab use short public paths so SPA transitions
 * match middleware shortcuts (mobile Safari especially may keep long `/football-predictions/...` URLs otherwise).
 */
export function hubPublicHref(canonicalFpStyleHref: string, isGoalLabHub: boolean): string {
  if (!isGoalLabHub) return canonicalFpStyleHref;
  return longFpPathToPublicHubPath(canonicalFpStyleHref, true);
}

export function longFpPathToPublicHubPath(longPath: string, useHub: boolean): string {
  if (!useHub) return longPath;
  const i = longPath.indexOf('#');
  const pathOnly = i >= 0 ? longPath.slice(0, i) : longPath;
  const hash = i >= 0 ? longPath.slice(i) : '';
  if (pathOnly === '/football-predictions') {
    return hash ? `/${hash}` : '/';
  }
  if (pathOnly.startsWith('/football-predictions/')) {
    const tail = pathOnly.slice('/football-predictions'.length);
    return `${tail}${hash}`;
  }
  return longPath;
}
