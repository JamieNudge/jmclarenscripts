import type { ReactNode } from 'react';
import { AdSenseLoader } from '@/components/AdSenseLoader';

/** AdSense Auto ads script for blog index + posts (same client id as Best Picks). */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdSenseLoader />
      {children}
    </>
  );
}
