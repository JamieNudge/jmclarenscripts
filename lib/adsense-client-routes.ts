/**
 * Routes where the AdSense script is active and should not be torn down by {@link AdSenseRouteCleanup}.
 * Portfolio home and admin stay ad-free; everything else uses {@link AdSenseScriptGate}.
 */
export function pathUsesAdSenseClient(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === '/' || pathname.startsWith('/admin')) return false;
  return true;
}
