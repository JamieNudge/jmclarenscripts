import type { ReactNode } from 'react';
import Link from 'next/link';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';

const bodyProse = 'space-y-6 text-sm md:text-base leading-relaxed text-white/90';

export function BestPicksSubpageShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  /** Renders in `<footer>`, with a top border. When set, main column grows so the footer can sit at the bottom on short pages. */
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white flex flex-col">
      <div
        className={
          footer
            ? 'max-w-3xl mx-auto px-4 py-10 md:py-14 w-full flex-1 flex flex-col min-h-0'
            : 'max-w-3xl mx-auto px-4 py-10 md:py-14 w-full'
        }
      >
        {BEST_PICKS_EXTENDED_SITE_NAV ? <BestPicksSiteNav variant="header" /> : null}
        <div className={BEST_PICKS_EXTENDED_SITE_NAV ? 'mt-6' : ''}>
          <Link
            href="/best-picks"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Today&apos;s Best Picks
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
        {description ? <p className="text-sm text-white/60 mb-8 leading-relaxed">{description}</p> : null}
        {footer ? (
          <>
            <div className={`${bodyProse} flex-1 min-h-0`}>{children}</div>
            <footer
              className="shrink-0 mt-10 border-t border-white/10 pt-6 text-xs text-white/55 leading-relaxed pb-[max(0.5rem,env(safe-area-inset-bottom))]"
              role="contentinfo"
            >
              {footer}
            </footer>
          </>
        ) : (
          <div className={bodyProse}>{children}</div>
        )}
      </div>
    </main>
  );
}
