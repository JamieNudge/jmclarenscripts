'use client';

import { useEffect } from 'react';

/** Former standalone page: “How apps work” now lives in the home grid (`#how-apps-work`). */
export function HowItWorksFromHubRedirect() {
  useEffect(() => {
    window.location.replace('/football-predictions#how-apps-work');
  }, []);
  return (
    <p className="text-sm text-white/60 px-4 py-6" role="status">
      Taking you to How apps work on the home page…
    </p>
  );
}
