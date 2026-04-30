'use client';

import { useEffect } from 'react';
import { isHubHostname, longFpPathToPublicHubPath } from '@/lib/hub-football-routes';

/** Former standalone page: “How apps work” now lives in the home grid (`#how-apps-work`). */
export function HowItWorksFromHubRedirect() {
  useEffect(() => {
    const hub = isHubHostname(window.location.hostname);
    window.location.replace(longFpPathToPublicHubPath('/football-predictions#how-apps-work', hub));
  }, []);
  return (
    <p className="text-sm text-white/90 px-4 py-6" role="status">
      Taking you to How apps work on the home page…
    </p>
  );
}
