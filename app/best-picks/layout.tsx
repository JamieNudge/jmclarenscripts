import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdSenseLoader } from '@/components/AdSenseLoader';

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

/** AdSense Auto ads: script loads under `/best-picks` (see `app/blog/layout.tsx` for `/blog`). */
export default function BestPicksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdSenseLoader />
      {children}
    </>
  );
}
