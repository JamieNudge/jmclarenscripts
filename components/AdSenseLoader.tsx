'use client';

import { useEffect } from 'react';

const DEFAULT_CLIENT_ID = 'ca-pub-6299348707363839';

function adsenseScriptSrc(clientId: string) {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
}

/**
 * Loads AdSense without `next/script` so we avoid:
 * - preload / script crossOrigin mismatch (React Float preload omits crossOrigin)
 * - `data-nscript` on the tag (AdSense warns about that)
 */
export function AdSenseLoader() {
  useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || DEFAULT_CLIENT_ID;
    const src = adsenseScriptSrc(clientId);
    if (document.querySelector(`script[src="${src}"]`)) return;

    const el = document.createElement('script');
    el.async = true;
    el.src = src;
    el.crossOrigin = 'anonymous';
    document.head.appendChild(el);
  }, []);

  return null;
}
