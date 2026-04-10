'use client';

import { useEffect, useState } from 'react';
import { picksDateStringInTimeZone, picksTimeZoneFromEnv } from '@/lib/best-picks-firebase';

/** Same calendar day as Firebase listeners (`NEXT_PUBLIC_PICKS_DATE_TIMEZONE`, default Europe/London). */
export function useBestPicksLondonDateKey(): string {
  const [dateKey, setDateKey] = useState(() => picksDateStringInTimeZone(picksTimeZoneFromEnv()));

  useEffect(() => {
    const tz = picksTimeZoneFromEnv();
    const refresh = () => setDateKey(picksDateStringInTimeZone(tz));
    const id = setInterval(refresh, 60_000);
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return dateKey;
}
