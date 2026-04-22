'use client';

import { ADSENSE_SCRIPT_LOADED_EVENT } from '@/lib/adsense-script-events';
import { stripAdSenseAndCmpArtifacts } from '@/lib/adsense-cleanup';
import { useEffect } from 'react';

const DEFAULT_CLIENT_ID = 'ca-pub-6299348707363839';

function adsenseScriptSrc(clientId: string) {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
}

/**
 * Loads AdSense without `next/script` so we avoid:
 * - preload / script crossOrigin mismatch (React Float preload omits crossOrigin)
 * - `data-nscript` on the tag (AdSense warns about that)
 *
 * On unmount (leaving an ad-enabled layout such as `/best-picks` or `/blog`), strips script + CMP
 * so other routes stay clean (see `pathUsesAdSenseClient`).
 */
export function AdSenseLoader() {
  useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || DEFAULT_CLIENT_ID;
    const src = adsenseScriptSrc(clientId);
    let el: HTMLScriptElement | null = null;
    if (!document.querySelector(`script[src="${src}"]`)) {
      el = document.createElement('script');
      el.async = true;
      el.src = src;
      el.crossOrigin = 'anonymous';
      el.addEventListener('load', () => {
        window.dispatchEvent(new Event(ADSENSE_SCRIPT_LOADED_EVENT));
      });
      document.head.appendChild(el);
    } else {
      queueMicrotask(() => {
        window.dispatchEvent(new Event(ADSENSE_SCRIPT_LOADED_EVENT));
      });
    }

    return () => {
      el?.remove();
      stripAdSenseAndCmpArtifacts();
    };
  }, []);

  return null;
}
