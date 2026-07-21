import { isHubHostname } from '@/lib/hub-football-routes';

/**
 * Matches {@link AdSenseScriptGate}: pages where the AdSense client should be present.
 * Used so the async snippet exists in the initial HTML for crawlers (e.g. AdSense site verification).
 */
export function shouldInjectAdSenseInInitialHtml(pathname: string, host: string): boolean {
  const p = pathname || '/';
  if (p.startsWith('/admin')) return false;
  if (p === '/dgc' || p.startsWith('/dgc/')) return false;
  const hub = isHubHostname(host);
  if ((p === '/' || p === '') && !hub) return false;
  return true;
}
