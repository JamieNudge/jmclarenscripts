'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

const CLASS_NAME = 'best-picks-route';

function syncBestPicksRouteClass(pathname: string | null) {
  const on = Boolean(pathname?.startsWith('/football-predictions'));
  document.documentElement.classList.toggle(CLASS_NAME, on);
  document.body.classList.toggle(CLASS_NAME, on);
}

/**
 * Keeps `best-picks-route` on `<html>` and `<body>` whenever the URL is under `/football-predictions` so
 * global CSS can style that section (e.g. `bp-best-picks-surface` background in globals.css).
 * Consent / CMP placement: configure in AdSense Privacy & messaging (not layout CSS here).
 * Lives in the root layout so it runs on client navigations, with `useLayoutEffect` before paint.
 */
export function BestPicksDocumentRouteClass() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    syncBestPicksRouteClass(pathname ?? null);
  }, [pathname]);

  return null;
}
