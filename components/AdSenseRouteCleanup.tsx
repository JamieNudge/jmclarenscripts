'use client';

import { stripAdSenseAndCmpArtifacts } from '@/lib/adsense-cleanup';
import { pathUsesAdSenseClient } from '@/lib/adsense-client-routes';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * On the portfolio home (`/`) and admin, strip AdSense + CMP DOM/script artifacts after navigation
 * so those routes stay clean. All other paths keep the ad client; see `pathUsesAdSenseClient`.
 */
export function AdSenseRouteCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathUsesAdSenseClient(pathname)) return;
    stripAdSenseAndCmpArtifacts();
  }, [pathname]);

  return null;
}
