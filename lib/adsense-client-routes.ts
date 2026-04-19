/** Routes where the AdSense script is mounted and should not be torn down by {@link AdSenseRouteCleanup}. */
export function pathUsesAdSenseClient(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/best-picks')) return true;
  return pathname === '/blog' || pathname.startsWith('/blog/');
}
