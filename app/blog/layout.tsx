import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Tab / bookmark icon for `/blog` and `/blog/*` (same hub as football-predictions).
 * Root `app/icon.png` remains the portfolio favicon for other routes.
 * AdSense script: {@link AdSenseScriptGate} in root layout.
 */
export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/images/goallab-icon.png', type: 'image/png', sizes: 'any' }],
    apple: [{ url: '/images/goallab-icon.png', type: 'image/png', sizes: '180x180' }],
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
