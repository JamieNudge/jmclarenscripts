'use client';

import { useEffect, useState } from 'react';
import {
  msUntilNextPicksCalendarDateKeyChange,
  picksDateStringInTimeZone,
  picksTimeZoneFromEnv,
} from '@/lib/best-picks-firebase';

/**
 * Same calendar day as Firebase listeners (`NEXT_PUBLIC_PICKS_DATE_TIMEZONE`, default Europe/London).
 * Refreshes on a 60s tick, on tab focus, and on a timer aligned to the next local calendar-day change
 * so paths like `researchAlgorithmSelections/{dateKey}` do not lag up to a minute after midnight.
 */
export function useBestPicksLondonDateKey(): string {
  const [dateKey, setDateKey] = useState(() => picksDateStringInTimeZone(picksTimeZoneFromEnv()));

  useEffect(() => {
    const tz = picksTimeZoneFromEnv();
    const refresh = () => setDateKey(picksDateStringInTimeZone(tz));

    refresh();

    let midnightTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleMidnight = () => {
      if (midnightTimer != null) clearTimeout(midnightTimer);
      const delay = msUntilNextPicksCalendarDateKeyChange(tz);
      midnightTimer = setTimeout(() => {
        refresh();
        scheduleMidnight();
      }, delay);
    };
    scheduleMidnight();

    const id = setInterval(refresh, 60_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      if (midnightTimer != null) clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return dateKey;
}
