import type { ReactNode } from 'react';
import { BestPicksVerticalAdAside } from '@/components/best-picks/BestPicksVerticalAdAside';
import { hubPageShellClass } from '@/lib/hub/ui';

type Props = { children: ReactNode };

/**
 * Same page shell + main column + right vertical ad (lg+) as publication subpages, without the subpage `h1`/back-link chrome.
 * Use for blog, redirects, and any long-form page that should match the hub ad placement.
 */
export function BestPicksContentWithSideAdLayout({ children }: Props) {
  return (
    <main className={hubPageShellClass}>
      <div className="flex w-full min-h-0 flex-1 flex-col lg:flex-row lg:min-h-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-10 md:py-14 lg:px-6 lg:pr-4 2xl:pr-0">
          {children}
        </div>
        <BestPicksVerticalAdAside />
      </div>
    </main>
  );
}
