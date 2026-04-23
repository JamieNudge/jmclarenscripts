'use client';

import Link from 'next/link';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { apps } from '@/lib/apps-data';

const statStrike = apps.find((a) => a.id === 'stat-strike');
const goalLab = apps.find((a) => a.id === 'goallab');

function appStoreLink(href: string | undefined, label: string) {
  if (!href) return <span className="font-semibold text-amber-100/90">{label}</span>;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-amber-100/90 underline underline-offset-2 hover:text-amber-50/95"
    >
      {label}
    </Link>
  );
}

/**
 * Hero for Best Picks. With extended site nav on, header/footer carry the links — no duplicate line here.
 * When nav is off (`NEXT_PUBLIC_BEST_PICKS_EXTENDED_SITE_NAV=0`), the collapsible block is kept so nothing is lost.
 */
export function BestPicksIntro({ dateKey }: { dateKey: string }) {
  return (
    <header className="max-w-4xl mb-5 md:mb-6 space-y-3">
      {BEST_PICKS_EXTENDED_SITE_NAV ? <BestPicksSiteNav variant="header" /> : null}
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span>Today&apos;s Best Picks</span>
          <span className="text-lg md:text-2xl lg:text-3xl font-semibold text-amber-200/90 tabular-nums tracking-wide shrink-0">
            {dateKey}
          </span>
        </h1>
        <p className="mt-2 md:mt-3 text-lg md:text-xl lg:text-2xl font-semibold text-amber-50/90 leading-snug">
          Daily selections based on a four-algorithm system (
          <Link
            href="/best-picks/how-it-works"
            className="text-amber-100/95 underline underline-offset-2 hover:text-amber-50/95"
          >
            see How Apps Work
          </Link>
          ), combining different modelling approaches to identify more reliable outcomes.
        </p>
      </div>

      {!BEST_PICKS_EXTENDED_SITE_NAV ? (
        <details className="group rounded-xl border border-amber-200/30 bg-zinc-950/90 px-3 py-2.5 md:px-4 md:py-3">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-2 text-xs md:text-sm font-semibold text-amber-50/95 hover:text-amber-50 [&::-webkit-details-marker]:hidden">
            <span>Apps, this page &amp; where to read more</span>
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
          <div className="mt-3 pt-3 border-t border-white/15 space-y-4 text-sm text-white/75 leading-relaxed">
            <ul className="space-y-2.5 list-none pl-0 border-l-2 border-amber-400/20 pl-3">
              <li>
                {appStoreLink(statStrike?.appStoreUrl, 'StatStrike')} — In-app daily selection with criteria-style
                confidence on goal bands.
              </li>
              <li>
                {appStoreLink(goalLab?.appStoreUrl, 'GoalLab')} — An 11-criteria algorithm forecasting Over 2.5 and
                Under 2.5 goal bands with forecaster confidence, full track history and transparent track record.
              </li>
            </ul>

            <p>
              Picks are <strong className="font-medium text-white/85">informational</strong> only—not betting tips,
              promises, or financial advice.
            </p>
            <p>
              What this screen contains (feeds, blog, in-development teasers) is summarised on{' '}
              <Link
                href="/best-picks/about"
                className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
              >
                About Today&apos;s Best Picks
              </Link>
              . Technical detail on feeds is on{' '}
              <Link
                href="/best-picks/methodology"
                className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
              >
                Methodology
              </Link>
              .
            </p>
            <p className="text-xs text-white/50">
              App terms &amp; privacy: App Store listings and{' '}
              <Link
                href="/best-picks/privacy"
                className="text-amber-200/70 underline underline-offset-2 hover:text-amber-100/90"
              >
                site privacy policy
              </Link>
              .{' '}
              <Link
                href="/best-picks/how-it-works"
                className="text-amber-200/70 underline underline-offset-2 hover:text-amber-100/90"
              >
                How apps work
              </Link>
              {' · '}
              <Link href="/best-picks/about" className="text-amber-200/70 underline underline-offset-2 hover:text-amber-100/90">
                About
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
      ) : null}
    </header>
  );
}
