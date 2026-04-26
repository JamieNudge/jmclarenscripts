'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apps } from '@/lib/apps-data';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';

const statStrike = apps.find((a) => a.id === 'stat-strike');
const goalLab = apps.find((a) => a.id === 'goallab');

const iconBoxClass =
  'shrink-0 rounded-2xl overflow-hidden border border-amber-200/20 bg-black/30 w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem]';

const scrollArea =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth overscroll-y-contain';

function storeAppLink(
  href: string | undefined,
  label: string,
  iconSrc: string | undefined,
  description: ReactNode,
) {
  return (
    <li className="flex flex-col sm:flex-row gap-3 sm:items-start">
      {href && iconSrc ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${iconBoxClass} block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50`}
          aria-label={`${label} on the App Store`}
        >
          <Image src={iconSrc} alt="" width={144} height={144} className="w-full h-full object-cover" />
        </Link>
      ) : (
        <div className={iconBoxClass} aria-hidden>
          {iconSrc ? (
            <Image src={iconSrc} alt="" width={144} height={144} className="w-full h-full object-cover" />
          ) : null}
        </div>
      )}
      <div className="min-w-0 space-y-1.5">
        <p className="font-semibold text-amber-100/90 text-sm sm:text-base">
          {href ? (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-amber-50/95"
            >
              {label}
            </Link>
          ) : (
            <span>{label}</span>
          )}
        </p>
        <div className="text-xs sm:text-sm leading-relaxed text-white/92">{description}</div>
      </div>
    </li>
  );
}

/**
 * "How apps work" explainer: lives in the hub grid (centre column on md+).
 * Same copy as the former dedicated page; scrolls inside the tile.
 */
export function BestPicksHowAppsWorkPanel() {
  return (
    <div
      className={`${bestPicksGridTileClassName} min-h-0 h-full justify-start scroll-mt-6 md:scroll-mt-8`}
      id="how-apps-work"
    >
      <div className="shrink-0 mb-2 space-y-1.5">
        <h2 className="text-lg md:text-xl font-semibold text-white">How apps work</h2>
        <p className="text-sm text-white/88 leading-relaxed">
          What each product does. Live apps link to the App Store; coming-soon items are described here only.
        </p>
      </div>

      <div className={scrollArea}>
        <div className="space-y-5 pb-1">
          <div>
            <h3 className="text-sm font-semibold text-amber-100/90 mb-2">Live on the App Store</h3>
            <ul className="space-y-4 list-none pl-0">
              {storeAppLink(
                statStrike?.appStoreUrl,
                'StatStrike',
                statStrike?.icon,
                <>
                  A daily selection of Over 2.5 and Under 2.5 football forecasts. The statistical criteria used is
                  listed with most forecasts and the algorithm&apos;s confidence in its work. App includes Track Record
                  for performance transparency, filters to tighten focus on big fixture list days, aggregate market
                  odds when available before KO, and a Best Performing category that only includes forecasts where the
                  model has a minimum of 70% league accuracy historically.
                </>,
              )}
              {storeAppLink(
                goalLab?.appStoreUrl,
                'GoalLab',
                goalLab?.icon,
                <>
                  GoalLab forecasts the majority of published global fixtures daily. The algorithm uses an 11 criteria
                  model to forecast Over 2.5 and Under 2.5 football goal bands. It will forecast with all 11 criteria,
                  if available for the fixture, or whatever it can get - forecast confidence is reflected in the volume
                  of criteria available for any given fixture. This doesn&apos;t mean a lower confidence forecast is
                  necessarily less accurate than one with more criteria - it depends on the criteria mix and how they
                  interact. Historical win rates of every confidence level is listed as tracked by a rich and growing
                  archive.
                </>,
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-amber-100/90 mb-2">Coming soon</h3>
            <ul className="space-y-4 list-none pl-0">
              <li className="flex flex-col sm:flex-row gap-3 sm:items-start">
                <div className="shrink-0 rounded-2xl overflow-hidden border border-amber-200/20 bg-black/30 w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem]">
                  <Image
                    src="/images/popgoals-icon.png"
                    alt="PopGoals app icon"
                    width={144}
                    height={144}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-amber-100/90 text-sm sm:text-base">PopGoals</p>
                  <p className="text-xs sm:text-sm text-white/92">
                    Three golden balls every day with the top slice of Over and Under 2.5 selections. Not on the App
                    Store yet.
                  </p>
                </div>
              </li>
              <li className="space-y-1.5 text-xs sm:text-sm text-white/92">
                <p>
                  <span className="font-semibold text-amber-100/90">ProphIt </span>
                  <span className="font-medium text-amber-200/75 text-sm normal-case">Coming Soon!</span>
                </p>
                <p>A new service! Have a theory for predicting goal band outcomes?</p>
                <p>
                  This service lets you test your approach using real data, live execution, and transparent tracking —
                  so you can see how it actually performs.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
