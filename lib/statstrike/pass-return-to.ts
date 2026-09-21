import { goalLabPublicBase } from '@/lib/hub-football-routes';

const ADMIN_RETURN_HOSTS = new Set([
  'thegoallab.net',
  'www.thegoallab.net',
  'localhost',
  '127.0.0.1',
  'jmclarenscripts.vercel.app',
]);

/**
 * Only allow bounce-back to known admin hosts (no open redirect).
 * Accepts preview `*.vercel.app` as well as production aliases.
 */
export function safeAdminReturnTo(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    const host = u.hostname.toLowerCase();
    const hostOk = ADMIN_RETURN_HOSTS.has(host) || host.endsWith('.vercel.app');
    if (!hostOk) return null;
    if (!u.pathname.startsWith('/admin')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Hub admin URL so the pass cookie and owner tools share thegoallab.net. */
export function hubAdminReturnToUrl(pathname: string, search = ''): string {
  const path = pathname.startsWith('/admin') ? pathname : '/admin/picks';
  const q = !search || search === '?' ? '' : search.startsWith('?') ? search : `?${search}`;
  return `${goalLabPublicBase()}${path}${q}`;
}

/** Drop claim/returnTo so Back cannot replay auto-claim. */
export function successPathWithoutClaimParams(href: string): string | null {
  try {
    const u = new URL(href);
    u.searchParams.delete('claim');
    u.searchParams.delete('returnTo');
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return null;
  }
}
