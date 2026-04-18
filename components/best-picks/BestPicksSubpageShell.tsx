import type { ReactNode } from 'react';
import Link from 'next/link';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';

export function BestPicksSubpageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
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
        <div className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">{children}</div>
      </div>
    </main>
  );
}
