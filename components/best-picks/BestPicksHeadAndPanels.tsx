'use client';

import type { ReactNode } from 'react';
import { BestPicksIntro } from '@/components/best-picks/BestPicksIntro';
import { FirebasePicksPanels } from '@/components/best-picks/FirebasePicksPanels';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';

/** One London date clock for hero (avoids duplicate timers). First grid cell: pass {@link BplHubCell} as children. */
export function BestPicksHeadAndPanels({ children }: { children: ReactNode }) {
  const dateKey = useBestPicksLondonDateKey();
  return (
    <>
      <BestPicksIntro dateKey={dateKey} />
      <FirebasePicksPanels>{children}</FirebasePicksPanels>
    </>
  );
}
