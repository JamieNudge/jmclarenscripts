'use client';

import type { ReactNode } from 'react';
import { BestPicksBlogPreviewsRail } from '@/components/best-picks/BestPicksBlogPreviewsRail';
import { BestPicksIntro } from '@/components/best-picks/BestPicksIntro';
import { FirebasePicksPanels } from '@/components/best-picks/FirebasePicksPanels';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';

/** One London date clock for hero (avoids duplicate timers). First grid cell: pass {@link BplHubCell} as children. */
export function BestPicksHeadAndPanels({ children }: { children: ReactNode }) {
  const dateKey = useBestPicksLondonDateKey();
  return (
    <>
      <BestPicksIntro dateKey={dateKey} />
      {/*
        At 2xl+, blog is in the same row as the 3×2 grid (not beside the full hero) so the rail tops align
        with the grid, and the ad is flush to the right of the hub column with no dead flex-1 gap before it.
      */}
      <div className="2xl:flex 2xl:min-w-0 2xl:items-start 2xl:gap-5">
        <div className="min-w-0 w-full 2xl:flex-1 2xl:min-w-0 min-h-0">
          <FirebasePicksPanels>{children}</FirebasePicksPanels>
        </div>
        <div className="hidden 2xl:block w-56 shrink-0 min-w-0 min-h-0">
          <BestPicksBlogPreviewsRail />
        </div>
      </div>
    </>
  );
}
