'use client';

import Link from 'next/link';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';

const inlineLinkClass =
  'text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90 font-medium text-amber-100/85';

/**
 * Hero for Best Picks. When extended site nav is on, a short pointer replaces the old `<details>` (same content
 * lives on How it works / Methodology). When nav is off (`NEXT_PUBLIC_BEST_PICKS_EXTENDED_SITE_NAV=0`), the
 * collapsible block is kept so nothing is lost.
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

      {BEST_PICKS_EXTENDED_SITE_NAV ? (
        <p className="text-sm text-white/55 leading-relaxed pt-0.5">
          Data sources, how this page works, and stat labels:{' '}
          <Link href="/best-picks/how-it-works" className={inlineLinkClass}>
            How it works
          </Link>
          <span className="text-white/30 mx-1.5" aria-hidden>
            ·
          </span>
          <Link href="/best-picks/methodology" className={inlineLinkClass}>
            Methodology
          </Link>
          <span className="text-white/30 mx-1.5" aria-hidden>
            ·
          </span>
          <Link href="/best-picks/about" className={inlineLinkClass}>
            About
          </Link>
          <span className="text-white/30 mx-1.5" aria-hidden>
            ·
          </span>
          <Link href="/privacy" className={inlineLinkClass}>
            Privacy
          </Link>
          .
        </p>
      ) : (
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
                per-model lines from Firebase), App Store tiles, optional video, and a right-hand column with{' '}
                <strong className="font-medium text-white/85">PopGoals</strong> (beta) plus{' '}
                <strong className="font-medium text-white/85">ProphIt</strong>.
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
              . Pages:{' '}
              <Link
                href="/best-picks/how-it-works"
                className="text-amber-200/70 underline underline-offset-2 hover:text-amber-100/90"
              >
                How it works
              </Link>
              {' · '}
              <Link
                href="/best-picks/methodology"
                className="text-amber-200/70 underline underline-offset-2 hover:text-amber-100/90"
              >
                Methodology
              </Link>
              .
            </p>
          </div>
        </details>
      )}
    </header>
  );
}
