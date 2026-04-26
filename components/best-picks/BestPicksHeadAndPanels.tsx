'use client';

import type { ReactNode } from 'react';
import { BplHubCell } from '@/components/best-picks/BplHubCell';
import { BestPicksIntro } from '@/components/best-picks/BestPicksIntro';
import { FirebasePicksPanels } from '@/components/best-picks/FirebasePicksPanels';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';

/**
 * One London date clock for hero + Firebase listeners (avoids duplicate timers).
 * BPL hub sits full width above the 3×2 grid so row 1 is not overfilled (grid rows are height-capped at md).
 */
export function BestPicksHeadAndPanels({ children }: { children: ReactNode }) {
  const dateKey = useBestPicksLondonDateKey();
  return (
    <>
      <BestPicksIntro dateKey={dateKey} />
      <div className="mb-4 min-w-0 md:mb-5">
        <BplHubCell />
      </div>
      <FirebasePicksPanels>{children}</FirebasePicksPanels>
    </>
  );
}
