'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { apps } from '@/lib/apps-data';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';

const statStrike = apps.find((a) => a.id === 'stat-strike');
const goalLab = apps.find((a) => a.id === 'goallab');

/** Floated in copy so the first line sits beside the icon; later lines can run full width under it. */
const iconFloatClass =
  'shrink-0 float-left mt-0.5 mr-3 sm:mr-3.5 mb-1.5 rounded-2xl overflow-hidden border border-amber-200/20 bg-[var(--hub-inset)] w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem]';

const scrollArea =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth overscroll-y-contain';

function storeAppLink(
  href: string | undefined,
  label: string,
  iconSrc: string | undefined,
  description: ReactNode,
) {
  return (
    <li className="list-none pl-0 [&:after]:content-[''] [&:after]:block [&:after]:clear-both">
      {href && iconSrc ? (
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${iconFloatClass} block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50`}
          aria-label={`${label} on the App Store`}
        >
          <Image src={iconSrc} alt="" width={144} height={144} className="w-full h-full object-cover" />
        </Link>
      ) : (
        <div className={iconFloatClass} aria-hidden>
          {iconSrc ? (
            <Image src={iconSrc} alt="" width={144} height={144} className="w-full h-full object-cover" />
          ) : null}
        </div>
      )}
      <div className="min-w-0 space-y-1.5">
        <p className="font-semibold text-[var(--hub-accent-link)] text-sm sm:text-base">
          {href ? (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
            >
              {label}
            </Link>
          ) : (
            <span>{label}</span>
          )}
        </p>
        <div className="text-xs sm:text-sm leading-relaxed text-[var(--hub-text-soft)]">{description}</div>
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
        <h2 className="text-lg md:text-xl font-semibold text-[var(--hub-text)]">How apps work</h2>
        <p className="text-sm text-[var(--hub-text-soft)] leading-relaxed">
          What each product does. Live apps link to the App Store; coming-soon items are described here only.
        </p>
      </div>

      <div className={scrollArea}>
        <div className="space-y-5 pb-1">
          <div>
            <h3 className="text-sm font-semibold text-[var(--hub-accent-link)] mb-2">Live on the App Store</h3>
            <ul className="space-y-4 list-none pl-0">
              {storeAppLink(
                statStrike?.appStoreUrl,
                'StatStrike',
                statStrike?.icon,
                <div className="space-y-2">
                  <p>StatStrike is a football forecasting app focused on quality over quantity.</p>
                  <p>
                    Every day, StatStrike monitors leagues worldwide and publishes Over 2.5 and Under 2.5 forecasts from
                    leagues currently meeting performance standards. Rather than flooding users with predictions, the
                    app focuses on fixtures supported by historical league performance and statistical criteria.
                  </p>
                  <div>
                    <p className="font-semibold text-[var(--hub-accent-link)] mt-3">Each forecast includes:</p>
                    <ul className="list-disc pl-4 space-y-0.5 mt-1">
                      <li>Goal band forecast (Over 2.5 / Under 2.5)</li>
                      <li>League track record for the band</li>
                      <li>Key statistical signals behind the pick</li>
                      <li>Aggregate market odds (when available)</li>
                      <li>Transparent track record data</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--hub-accent-link)] mt-3">FEATURES</p>
                    <ul className="list-disc pl-4 space-y-0.5 mt-1">
                      <li>Daily Over 2.5 forecasts</li>
                      <li>Daily Under 2.5 forecasts</li>
                      <li>Best Performing category featuring leagues with a proven historical record</li>
                      <li>Full prediction archive</li>
                      <li>Automatic result tracking</li>
                      <li>Performance transparency</li>
                      <li>Fixture filtering tools</li>
                      <li>Historical league qualification metrics</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--hub-accent-link)] mt-3">TRANSPARENCY FIRST</p>
                    <p className="mt-1">Every forecast is archived and tracked.</p>
                    <p>
                      Users can review historical performance, win rates and prediction history directly within the
                      app. No deleted losses. No cherry-picked results. Just measurable forecasting performance.
                    </p>
                    <p>
                      StatStrike is designed for football fans who value transparency, accountability and
                      data-driven forecasting.
                    </p>
                  </div>
                </div>,
              )}
              {storeAppLink(
                goalLab?.appStoreUrl,
                'GoalLab',
                goalLab?.icon,
                <>
                  GoalLab forecasts the majority of published global fixtures daily. The algorithm uses an 11-criteria
                  model to forecast Over 2.5 and Under 2.5 football goal bands. It will forecast with all 11 criteria
                  when available for the fixture, or whatever data exists for that match — fewer checks means less
                  supporting detail, not necessarily a weaker pick. Historical win rates by league and band are tracked
                  in a rich and growing archive.
                </>,
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--hub-accent-link)] mb-2">Coming soon</h3>
            <ul className="space-y-4 list-none pl-0">
              <li className="list-none pl-0 [&:after]:content-[''] [&:after]:block [&:after]:clear-both">
                <div className={iconFloatClass} aria-hidden>
                  <Image
                    src="/images/popgoals-icon.png"
                    alt="PopGoals app icon"
                    width={144}
                    height={144}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-[var(--hub-accent-link)] text-sm sm:text-base">PopGoals</p>
                  <p className="text-xs sm:text-sm text-[var(--hub-text-soft)] leading-relaxed">
                    A calm bubble-lake app for live hot-zone targets, alerts, and settled win/loss tracking. Not on
                    the App Store yet.
                  </p>
                </div>
              </li>
              <li className="space-y-1.5 text-xs sm:text-sm text-[var(--hub-text-soft)]">
                <p>
                  <span className="font-semibold text-[var(--hub-accent-link)]">ProphIt </span>
                  <span className="font-medium text-[var(--hub-heading-accent)] text-sm normal-case">Coming Soon!</span>
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
