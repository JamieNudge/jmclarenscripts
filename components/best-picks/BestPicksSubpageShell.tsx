import type { ReactNode } from 'react';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BestPicksHubFooter } from '@/components/best-picks/BestPicksHubFooter';
import { BestPicksVerticalAdAside } from '@/components/best-picks/BestPicksVerticalAdAside';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import {
  hubAdPlaceholder,
  hubBorderT,
  hubPageShellClass,
  hubTextSoft,
} from '@/lib/hub/ui';

const bodyProse = `space-y-6 text-sm md:text-base leading-relaxed ${hubTextSoft}`;

export function BestPicksSubpageShell({
  title,
  description,
  children,
  footer,
  hubFooter = false,
  showBackToHub = true,
  alwaysShowHeaderNav = false,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Renders in `<footer>`, with a top border. When set, main column grows so the footer can sit at the bottom on short pages. Ignored when `hubFooter` is true. */
  footer?: ReactNode;
  /** If true, skip the in-column ad strip and use the full shared hub footer (nav + ad + disclaimer), full width. */
  hubFooter?: boolean;
  /** If false, hides the “Back to [hub]” row (e.g. publication privacy). */
  showBackToHub?: boolean;
  /** Show the main section nav even when `NEXT_PUBLIC_BEST_PICKS_EXTENDED_SITE_NAV=0` (e.g. privacy so visitors can always move within this publication). */
  alwaysShowHeaderNav?: boolean;
}) {
  const showHeaderNav = alwaysShowHeaderNav || BEST_PICKS_EXTENDED_SITE_NAV;
  return (
    <main className={hubPageShellClass}>
      <div className="flex w-full min-h-0 flex-1 flex-col lg:flex-row lg:min-h-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-4 py-10 md:py-14 lg:px-6 lg:pr-4 2xl:pr-0">
          <div className="mx-auto flex min-h-0 w-full max-w-6xl 2xl:max-w-none flex-1 flex-col">
            {showHeaderNav ? <BestPicksSiteNav variant="header" /> : null}
            {showBackToHub ? (
              <div className={showHeaderNav ? 'mt-6' : ''}>
                <HubFootballLink
                  href="/football-predictions"
                  className={`mb-8 inline-flex items-center gap-2 text-sm ${hubTextSoft} transition-colors hover:opacity-100`}
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Football Predictions
                </HubFootballLink>
              </div>
            ) : showHeaderNav ? (
              <div className="mt-8" aria-hidden />
            ) : null}

            <h1 className="mb-3 text-3xl font-bold md:text-4xl">{title}</h1>
            {description ? (
              <div className={`mb-8 text-sm ${hubTextSoft} leading-relaxed`}>{description}</div>
            ) : null}
            {hubFooter ? (
              <div className={`${bodyProse} min-h-0 flex-1`}>{children}</div>
            ) : footer ? (
              <>
                <div className={`${bodyProse} min-h-0 flex-1`}>{children}</div>
                <div className="mt-8 w-full shrink-0">
                  <AdSenseAutoPlaceholder
                    orientation="horizontal"
                    className={`w-full min-h-[90px] ${hubAdPlaceholder}`}
                  />
                </div>
                <footer
                  className={`mt-10 shrink-0 ${hubBorderT} pt-6 text-xs ${hubTextSoft} leading-relaxed pb-[max(0.5rem,env(safe-area-inset-bottom))]`}
                  role="contentinfo"
                >
                  {footer}
                </footer>
              </>
            ) : (
              <>
                <div className={`${bodyProse} min-h-0 flex-1`}>{children}</div>
                <footer
                  className={`mt-10 w-full shrink-0 ${hubBorderT} pt-6 pb-[max(0.5rem,env(safe-area-inset-bottom))]`}
                  role="contentinfo"
                  aria-label="Advertising"
                >
                  <AdSenseAutoPlaceholder
                    orientation="horizontal"
                    className={`w-full min-h-[90px] ${hubAdPlaceholder}`}
                  />
                </footer>
              </>
            )}
          </div>
        </div>
        <BestPicksVerticalAdAside />
      </div>
      {hubFooter ? <BestPicksHubFooter /> : null}
    </main>
  );
}
