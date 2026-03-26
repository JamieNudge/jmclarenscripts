'use client';

import { useEffect } from 'react';

const CLASS_NAME = 'best-picks-route';

/**
 * Marks the document while on `/best-picks` so global CSS can style third-party UI (e.g. Google CMP).
 */
export function BestPicksRouteBodyClass() {
  useEffect(() => {
    document.body.classList.add(CLASS_NAME);
    return () => document.body.classList.remove(CLASS_NAME);
  }, []);

  return null;
}
