import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdSenseLoader } from '@/components/AdSenseLoader';
import { BestPicksRouteBodyClass } from '@/components/best-picks/BestPicksRouteBodyClass';

/**
 * Tab / bookmark icon for `/best-picks` only (not the same as `og:image` for link previews).
 * Root `app/icon.png` stays the portfolio favicon elsewhere.
 */
export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/images/goallab-icon.png', type: 'image/png', sizes: 'any' }],
    apple: [{ url: '/images/goallab-icon.png', type: 'image/png', sizes: '180x180' }],
  },
};

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
