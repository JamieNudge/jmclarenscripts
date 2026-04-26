import type { ReactNode } from 'react';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { BestPicksHubFooter } from '@/components/best-picks/BestPicksHubFooter';

type Props = { children: ReactNode };

/**
 * Main column + right-hand vertical ad (lg+) + shared hub footer — matches `/football-predictions` chrome.
 */
export function BestPicksHubWithSideAdLayout({ children }: Props) {
  return (
    <main className="min-h-screen bp-best-picks-surface text-white flex flex-col">
      <div className="flex flex-1 flex-col lg:flex-row lg:min-h-0 w-full min-h-0">
        <div className="flex-1 min-w-0 min-h-0 px-4 py-10 md:py-14 lg:px-6 lg:pr-4 2xl:pr-0">
          {children}
        </div>
        <aside className="hidden lg:flex w-[150px] xl:w-[170px] flex-shrink-0 flex-col border-l border-zinc-700/70 bg-zinc-950/90">
          <AdSenseAutoPlaceholder
            orientation="vertical"
            className="flex-1 w-full min-h-[min(360px,45vh)] lg:min-h-[min(560px,72vh)] rounded-l-lg border-y-0 border-r-0 border-l-0 !border-dashed !border-white/30 !bg-zinc-900/50 !text-white/70"
          />
        </aside>
      </div>
      <BestPicksHubFooter />
    </main>
  );
}
