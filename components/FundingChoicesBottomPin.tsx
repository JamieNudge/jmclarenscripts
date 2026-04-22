'use client';

import { initFundingChoicesBottomPin, stopFundingChoicesBottomPin } from '@/lib/funding-choices-bottom-pin';
import { pathUsesAdSenseClient } from '@/lib/adsense-client-routes';
import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

/**
 * Re-applies bottom layout for Google Funding Choices when it injects or re-styles (blog / best-picks).
 * See globals.css and {@link initFundingChoicesBottomPin}.
 */
export function FundingChoicesBottomPin() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!pathUsesAdSenseClient(pathname)) {
      stopFundingChoicesBottomPin();
      return;
    }
    return initFundingChoicesBottomPin();
  }, [pathname]);

  return null;
}
