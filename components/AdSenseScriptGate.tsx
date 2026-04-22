'use client';

import { AdSenseLoader } from '@/components/AdSenseLoader';
import { usePathname } from 'next/navigation';

/**
 * Loads the AdSense client on every route except the portfolio home (`/`) and admin.
 * Nested layouts must not mount a second {@link AdSenseLoader}.
 */
export function AdSenseScriptGate() {
  const pathname = usePathname();
  if (!pathname || pathname === '/' || pathname.startsWith('/admin')) {
    return null;
  }
  return <AdSenseLoader />;
}
