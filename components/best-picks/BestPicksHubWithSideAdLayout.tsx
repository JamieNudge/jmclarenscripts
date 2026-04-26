import type { ReactNode } from 'react';
import { BestPicksHubFooter } from '@/components/best-picks/BestPicksHubFooter';
import { BestPicksVerticalAdAside } from '@/components/best-picks/BestPicksVerticalAdAside';

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
        <BestPicksVerticalAdAside />
      </div>
      <BestPicksHubFooter />
    </main>
  );
}
