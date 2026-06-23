'use client';

import { useEffect, useState } from 'react';
import { picksTimeZoneFromEnv } from '@/lib/best-picks-firebase';

/** Browser IANA timezone for kickoff display; env fallback until client resolves. */
export function useVisitorTimeZone(): string {
  const [timeZone, setTimeZone] = useState(() => picksTimeZoneFromEnv());

  useEffect(() => {
    try {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
      if (browserTz) setTimeZone(browserTz);
    } catch {
      // keep env fallback
    }
  }, []);

  return timeZone;
}
