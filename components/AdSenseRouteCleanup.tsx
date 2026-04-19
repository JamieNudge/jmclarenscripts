'use client';

import { stripAdSenseAndCmpArtifacts } from '@/lib/adsense-cleanup';
import { pathUsesAdSenseClient } from '@/lib/adsense-client-routes';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * After client navigation away from ad-enabled sections (`/best-picks`, `/blog`), remove AdSense +
 * Google CMP artifacts so the portfolio home and other routes stay clean.
 */
export function AdSenseRouteCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathUsesAdSenseClient(pathname)) return;
    stripAdSenseAndCmpArtifacts();
  }, [pathname]);

  return null;
}
