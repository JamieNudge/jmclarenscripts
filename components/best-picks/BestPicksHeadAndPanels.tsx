'use client';

import type { ReactNode } from 'react';
import { AndAnotherThingHubPreview } from '@/components/best-picks/AndAnotherThingHubPreview';
import { BestPicksBlogPreviewsRail } from '@/components/best-picks/BestPicksBlogPreviewsRail';
import { BestPicksIntro } from '@/components/best-picks/BestPicksIntro';
import { FirebasePicksPanels } from '@/components/best-picks/FirebasePicksPanels';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import type { AnotherThingPost } from '@/lib/and-another-thing';

/** One London date clock for hero (avoids duplicate timers). First grid cell: pass {@link BplHubCell} as children. */
export function BestPicksHeadAndPanels({
  children,
  andAnotherThingInitialPosts,
}: {
  children: ReactNode;
  andAnotherThingInitialPosts: AnotherThingPost[];
}) {
  const dateKey = useBestPicksLondonDateKey();
  return (
    <>
      <BestPicksIntro dateKey={dateKey} />
      {/*
        At 2xl+, the blog rail is in-flow so its top lines up with the main grid (and Coming Soon). And Another
        Thing is placed above it with absolute + bottom-full so it does not push the rail down; it sits in the
        band above the shared row (with the bordered intro to the left).
      */}
      <div className="2xl:flex 2xl:min-w-0 2xl:items-start 2xl:gap-5">
        <div className="min-w-0 w-full 2xl:flex-1 2xl:min-w-0 min-h-0">
          <FirebasePicksPanels andAnotherThingInitialPosts={andAnotherThingInitialPosts}>
            {children}
          </FirebasePicksPanels>
        </div>
        <div className="hidden 2xl:block w-56 shrink-0 min-w-0 min-h-0 relative">
          <div className="absolute bottom-full left-0 right-0 mb-4 w-full min-w-0 z-[1]">
            <AndAnotherThingHubPreview initialPosts={andAnotherThingInitialPosts} variant="sidebar" />
          </div>
          <BestPicksBlogPreviewsRail />
        </div>
      </div>
    </>
  );
}
