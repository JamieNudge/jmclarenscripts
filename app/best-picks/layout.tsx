import type { ReactNode } from 'react';
import { AdSenseLoader } from '@/components/AdSenseLoader';

/** AdSense Auto ads: script loads only under `/best-picks` (see `AdSenseLoader`). */
export default function BestPicksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdSenseLoader />
      {children}
    </>
  );
}
