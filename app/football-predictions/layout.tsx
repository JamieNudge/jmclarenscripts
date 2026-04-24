import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Tab / bookmark icon for `/football-predictions` only (not the same as `og:image` for link previews).
 * Root `app/icon.png` stays the portfolio favicon elsewhere.
 * AdSense script: {@link AdSenseScriptGate} in root layout.
 */
export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/images/goallab-icon.png', type: 'image/png', sizes: 'any' }],
    apple: [{ url: '/images/goallab-icon.png', type: 'image/png', sizes: '180x180' }],
  },
};

export default function BestPicksLayout({ children }: { children: ReactNode }) {
  return children;
}
