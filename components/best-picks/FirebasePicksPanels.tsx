'use client';

import type { ReactNode } from 'react';
import { BestPicksNewProductPanel } from '@/components/best-picks/BestPicksExtraPanels';
import { BestPicksResearchAlgorithmPanel } from '@/components/best-picks/BestPicksResearchAlgorithmPanel';
import { BestPicksVideo } from '@/components/best-picks/BestPicksVideo';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import { isFirebaseClientConfigured } from '@/lib/firebase-client';

/** Placeholder tile (former Under 2.5 slot); replace body when beta app copy is ready. */
function BestPicksComingSoonPanel() {
  return (
    <div className={bestPicksGridTileClassName}>
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2 shrink-0">Coming Soon!</h2>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth">
        <p className="text-sm text-white/55 leading-relaxed">
          A beta app preview will live here — details to follow.
        </p>
      </div>
    </div>
  );
}

export function FirebasePicksPanels({
  dateKey,
  children,
}: {
  dateKey: string;
  children: ReactNode;
}) {
  const configHint = !isFirebaseClientConfigured();

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-5">
      {configHint && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95 leading-relaxed">
          Firebase is not configured. Copy{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">.env.example</code> to{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">.env.local</code>, add your
          web app keys and Realtime Database URL, then restart{' '}
          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded">npm run dev</code>.
        </div>
      )}
      {/*
        md: 3×2 with explicit placement — left: App / Video; centre: Latest Research (row-span 2);
        right: Coming Soon / ProphIt. Mobile: same stack top-to-bottom.
      */}
      <div className="grid grid-cols-1 gap-4 max-md:[grid-template-rows:repeat(5,minmax(0,26rem))] md:grid-cols-3 md:gap-5 md:[grid-template-rows:repeat(2,minmax(0,26rem))] [&>*]:min-h-0 [&>*]:min-w-0">
        <div className="min-h-0 md:col-start-1 md:row-start-1">{children}</div>
        <div className="min-h-0 md:col-start-1 md:row-start-2">
          <BestPicksVideo />
        </div>
        <div className="flex min-h-0 flex-col md:col-start-2 md:row-start-1 md:row-span-2 md:h-full md:min-h-0">
          <BestPicksResearchAlgorithmPanel dateKey={dateKey} />
        </div>
        <div className="min-h-0 md:col-start-3 md:row-start-1">
          <BestPicksComingSoonPanel />
        </div>
        <div className="min-h-0 md:col-start-3 md:row-start-2">
          <BestPicksNewProductPanel />
        </div>
      </div>
    </div>
  );
}

// Over 2.5 / Under 2.5 pick tiles + Firebase listeners: full copy preserved in
// `FirebasePicksPanels.over-under-panels.archive.txt` for restore — copy from there into this file
// and wire grid order as needed.
