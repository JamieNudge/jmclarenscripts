'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { BestPicksNewProductPanel } from '@/components/best-picks/BestPicksExtraPanels';
import { BestPicksHowAppsWorkPanel } from '@/components/best-picks/BestPicksHowAppsWorkPanel';
import { BestPicksVideo } from '@/components/best-picks/BestPicksVideo';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import { bestPicksPopgoalsComingSoonMeta } from '@/lib/best-picks-popgoals-coming-soon-meta';
import { isFirebaseClientConfigured } from '@/lib/firebase-client';

/** Right column: PopGoals teaser + ProphIt in one tile (md: spans both rows). */
function BestPicksComingSoonAndProphitPanel() {
  const m = bestPicksPopgoalsComingSoonMeta;
  return (
    <div className={`${bestPicksGridTileClassName} gap-0`}>
      <h2 className="text-lg md:text-xl font-semibold text-white tracking-tight shrink-0 mb-3">
        Coming Soon!
      </h2>
      <section className="shrink-0 space-y-3 pb-4 border-b border-white/15">
        <div className="flex gap-3 min-w-0">
          <div className="shrink-0 rounded-2xl overflow-hidden border border-amber-200/30 bg-zinc-900/90 w-14 h-14 md:w-16 md:h-16">
            <Image
              src={m.iconSrc}
              alt={`${m.displayName} app icon`}
              width={144}
              height={144}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h3 className="text-base md:text-lg font-semibold text-white tracking-tight min-w-0">
                {m.displayName}
              </h3>
              <span className="shrink-0 rounded-full border border-amber-400/35 bg-amber-500/12 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-100/95">
                Coming soon
              </span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              iOS app in development. App Store listing and preview copy will follow.
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col pt-5 -mx-1 px-1">
        <BestPicksNewProductPanel embedded />
      </section>
    </div>
  );
}

export function FirebasePicksPanels({ children }: { children: ReactNode }) {
  const configHint = !isFirebaseClientConfigured();

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-5">
      {configHint && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-50/95 leading-relaxed">
          Firebase is not configured. Copy{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">.env.example</code> to{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">.env.local</code>, add your
          web app keys and Realtime Database URL, then restart{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">npm run dev</code>.
        </div>
      )}
      {/*
        md: 3×2 with explicit placement — left: App / Video; centre: How apps work (row-span 2);
        right: PopGoals (coming soon) + ProphIt in one cell (row-span 2). Mobile: four stacked rows.
      */}
      <div className="grid grid-cols-1 gap-4 max-md:[grid-template-rows:repeat(4,minmax(0,26rem))] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,1.3fr)] md:gap-5 md:[grid-template-rows:repeat(2,minmax(0,26rem))] [&>*]:min-h-0 [&>*]:min-w-0">
        <div className="min-h-0 h-full flex flex-col md:col-start-1 md:row-start-1">{children}</div>
        <div className="min-h-0 md:col-start-1 md:row-start-2">
          <BestPicksVideo />
        </div>
        <div className="flex min-h-0 flex-col md:col-start-2 md:row-start-1 md:row-span-2 md:h-full md:min-h-0">
          <BestPicksHowAppsWorkPanel />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col md:col-start-3 md:row-start-1 md:row-span-2 md:h-full md:min-h-0">
          <BestPicksComingSoonAndProphitPanel />
        </div>
      </div>
    </div>
  );
}

// Over 2.5 / Under 2.5 pick tiles + Firebase listeners: full copy preserved in
// `FirebasePicksPanels.over-under-panels.archive.txt` for restore — copy from there into this file
// and wire grid order as needed.
