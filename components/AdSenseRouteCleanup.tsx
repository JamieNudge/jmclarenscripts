'use client';

import { stripAdSenseAndCmpArtifacts } from '@/lib/adsense-cleanup';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * After client navigation away from `/best-picks`, remove AdSense + Google CMP artifacts
 * so the rest of the site (e.g. portfolio home) does not keep the consent banner.
 */
export function AdSenseRouteCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/best-picks')) return;
    stripAdSenseAndCmpArtifacts();
  }, [pathname]);

  return null;
}
