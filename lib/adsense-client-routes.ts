import { isHubHostname } from '@/lib/hub-football-routes';

/**
 * Routes where the AdSense script is active and should not be torn down by {@link AdSenseRouteCleanup}.
 * Portfolio home (`/` on non-hub hosts) and admin stay ad-free; hub home (`/` on GoalLab) matches {@link AdSenseScriptGate}.
 */
export function pathUsesAdSenseClient(
  pathname: string | null,
  hostname?: string | null,
): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/admin')) return false;
  if (pathname === '/') {
    return Boolean(hostname && isHubHostname(hostname));
  }
  return true;
}
