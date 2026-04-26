import type { ReactNode } from 'react';
import Link from 'next/link';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { BestPicksHubFooter } from '@/components/best-picks/BestPicksHubFooter';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';

const bodyProse = 'space-y-6 text-sm md:text-base leading-relaxed text-white/92';

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
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white flex flex-col">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14 w-full flex-1 flex flex-col min-h-0">
        {showHeaderNav ? <BestPicksSiteNav variant="header" /> : null}
        {showBackToHub ? (
          <div className={showHeaderNav ? 'mt-6' : ''}>
            <Link
              href="/football-predictions"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 text-sm"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Football Predictions
            </Link>
          </div>
        ) : showHeaderNav ? (
          <div className="mt-8" aria-hidden />
        ) : null}

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
        {description ? (
          <div className="text-sm text-white/80 mb-8 leading-relaxed">{description}</div>
        ) : null}
        {hubFooter ? (
          <div className={`${bodyProse} flex-1 min-h-0`}>{children}</div>
        ) : footer ? (
          <>
            <div className={`${bodyProse} flex-1 min-h-0`}>{children}</div>
            <div className="shrink-0 mt-8 w-full">
              <AdSenseAutoPlaceholder
                orientation="horizontal"
                className="w-full min-h-[90px] !border-white/30 !bg-zinc-900/50 !text-white/70"
              />
            </div>
            <footer
              className="shrink-0 mt-10 border-t border-white/10 pt-6 text-xs text-white/75 leading-relaxed pb-[max(0.5rem,env(safe-area-inset-bottom))]"
              role="contentinfo"
            >
              {footer}
            </footer>
          </>
        ) : (
          <>
            <div className={`${bodyProse} flex-1 min-h-0`}>{children}</div>
            <footer
              className="shrink-0 w-full border-t border-white/10 pt-6 mt-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
              role="contentinfo"
              aria-label="Advertising"
            >
              <AdSenseAutoPlaceholder
                orientation="horizontal"
                className="w-full min-h-[90px] !border-white/30 !bg-zinc-900/50 !text-white/70"
              />
            </footer>
          </>
        )}
      </div>
      {hubFooter ? <BestPicksHubFooter /> : null}
    </main>
  );
}
