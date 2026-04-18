'use client';

import Link from 'next/link';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';

/**
 * Compact hero + one collapsible block so the picks grid stays high on the viewport.
 * `dateKey` is supplied by {@link BestPicksHeadAndPanels} so it stays in sync with Firebase paths.
 */
export function BestPicksIntro({ dateKey }: { dateKey: string }) {
  return (
    <header className="max-w-4xl mb-5 md:mb-6 space-y-3">
      {BEST_PICKS_EXTENDED_SITE_NAV ? <BestPicksSiteNav variant="header" /> : null}
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span>Today&apos;s Best Picks</span>
          <span className="text-lg md:text-2xl lg:text-3xl font-semibold text-amber-200/75 tabular-nums tracking-wide shrink-0">
            {dateKey}
          </span>
        </h1>
        <p className="mt-2 md:mt-3 text-lg md:text-xl lg:text-2xl font-semibold text-amber-50/90 leading-snug">
          Selected by filtering the work of four different algorithms and what each does best!
        </p>
      </div>

      <details className="group rounded-xl border border-amber-200/15 bg-black/25 px-3 py-2.5 md:px-4 md:py-3">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-2 text-xs md:text-sm font-semibold text-amber-50/95 hover:text-amber-50 [&::-webkit-details-marker]:hidden">
          <span>About data sources, how it works &amp; stat labels</span>
          <svg
            className="w-4 h-4 text-amber-200/50 shrink-0 transition-transform duration-200 group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-3 pt-3 border-t border-white/10 space-y-4 text-sm text-white/70 leading-relaxed">
          <ul className="space-y-2.5 list-none pl-0 border-l-2 border-amber-400/20 pl-3">
            <li>
              <span className="font-semibold text-amber-100/90">StatStrike</span> — In-app daily selection with
              criteria-style confidence on goal bands (App Store link in the first grid tile).
            </li>
            <li>
              <span className="font-semibold text-amber-100/90">GoalLab</span> — Four independent models on Over /
              Under 2.5; curated picks when models align.
            </li>
            <li>
              <span className="font-semibold text-amber-100/90">This page</span> —{' '}
              <strong className="font-medium text-white/85">Latest Research Selections</strong> (daily consensus and
              per-model lines from Firebase), App Store tiles, optional video, ProphIt, and a{' '}
              <strong className="font-medium text-white/85">Coming Soon</strong> slot for an upcoming beta app.
            </li>
          </ul>

          <p>
            Picks are <strong className="font-medium text-white/85">informational</strong> only—not betting tips,
            promises, or financial advice.
          </p>
          <p>
            <strong className="font-medium text-white/85">Latest Research Selections</strong> reads{' '}
            <code className="text-[10px] text-white/60">dailyConsensusSelections</code> and{' '}
            <code className="text-[10px] text-white/60">researchAlgorithmSelections</code> for the London calendar date
            shown in the headline. Over and Under 2.5 style bands can both appear in that panel when your upload
            includes them.
          </p>
          <p>
            <strong className="font-medium text-white/85">Stat labels</strong> on model lines use whatever match
            window the forecasting pipeline attached; it can differ by statistic—not always a fixed &quot;last
            six&quot; sample unless the label says so.
          </p>
          <p className="text-xs text-white/50">
            App terms &amp; privacy: App Store listings and{' '}
            <Link href="/privacy" className="text-amber-200/70 underline underline-offset-2 hover:text-amber-100/90">
              site privacy policy
            </Link>
            .
            {BEST_PICKS_EXTENDED_SITE_NAV ? (
              <>
                {' '}
                <Link
                  href="/best-picks/how-it-works"
                  className="text-amber-200/70 underline underline-offset-2 hover:text-amber-100/90"
                >
                  How it works (full page)
                </Link>
                .
              </>
            ) : null}
          </p>
        </div>
      </details>
    </header>
  );
}
