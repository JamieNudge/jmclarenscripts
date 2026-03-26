import type { ReactNode } from 'react';
import Script from 'next/script';

/** AdSense Auto ads: script loads only under `/best-picks` (not portfolio, admin, or other routes). */
const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() ?? 'ca-pub-6299348707363839';

export default function BestPicksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT_ID)}`}
        strategy="beforeInteractive"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}
