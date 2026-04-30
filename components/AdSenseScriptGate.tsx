'use client';

import { AdSenseLoader } from '@/components/AdSenseLoader';
import { isHubHostname } from '@/lib/hub-football-routes';
import { usePathname } from 'next/navigation';

/**
 * Loads the AdSense client on ad-enabled routes.
 * Skips the portfolio home (`/` on non-hub hosts only).
 * On GoalLab hub hosts, `/` is the predictions hub — loads the client there too.
 * Nested layouts must not mount a second {@link AdSenseLoader}.
 */
export function AdSenseScriptGate({ requestHost }: { requestHost: string }) {
  const pathname = usePathname();
  if (!pathname || pathname.startsWith('/admin')) {
    return null;
  }
  if (pathname === '/' && !isHubHostname(requestHost)) {
    return null;
  }
  return <AdSenseLoader />;
}
