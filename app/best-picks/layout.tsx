import type { ReactNode } from 'react';
import { AdSenseLoader } from '@/components/AdSenseLoader';
import { BestPicksRouteBodyClass } from '@/components/best-picks/BestPicksRouteBodyClass';

/** AdSense Auto ads: script loads only under `/best-picks` (see `AdSenseLoader`). */
export default function BestPicksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BestPicksRouteBodyClass />
      <AdSenseLoader />
      {children}
    </>
  );
}
