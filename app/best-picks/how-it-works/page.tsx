import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';
import { apps } from '@/lib/apps-data';

export const metadata: Metadata = {
  title: 'How apps work — Today’s Best Picks',
  description:
    'StatStrike, GoalLab, and work-in-progress products (PopGoals, ProphIt): what each app does and App Store links where available.',
};

const statStrike = apps.find((a) => a.id === 'stat-strike');
const goalLab = apps.find((a) => a.id === 'goallab');

const iconBoxClass =
  'shrink-0 rounded-2xl overflow-hidden border border-amber-200/20 bg-black/30 w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem]';

function storeAppLink(
  href: string | undefined,
  label: string,
  iconSrc: string | undefined,
  description: ReactNode,
) {
  return (
    <li className="flex flex-col sm:flex-row gap-4 sm:items-start">
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
      <div className="min-w-0 space-y-2">
        <p className="font-semibold text-amber-100/90">
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
        <div className="text-sm md:text-base leading-relaxed text-white/90">{description}</div>
      </div>
    </li>
  );
}

export default function BestPicksHowAppsWorkPage() {
  return (
    <BestPicksSubpageShell
      title="How apps work"
      description="What each product does. Live apps link to the App Store; coming-soon items are described here only."
      footer={
        <>
          For what appears on Today&apos;s Best Picks (feeds, blog, layout), see{' '}
          <Link
            href="/best-picks/about"
            className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
          >
            About Today&apos;s Best Picks
          </Link>
          . App terms and privacy: App Store listings and the{' '}
          <Link href="/privacy" className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90">
            site privacy policy
          </Link>
          .
        </>
      }
    >
      <section className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Live on the App Store</h2>
          <ul className="space-y-8 list-none pl-0">
            {storeAppLink(
              statStrike?.appStoreUrl,
              'StatStrike',
              statStrike?.icon,
              <>
                A daily selection of Over 2.5 and Under 2.5 football forecasts. The statistical criteria used is
                listed with most forecasts and the algorithm&apos;s confidence in its work. App includes Track Record
                for performance transparency, filters to tighten focus on big fixture list days, aggregate market odds
                when available before KO, and a Best Performing category that only includes forecasts where the model
                has a minimum of 70% league accuracy historically.
              </>,
            )}
            {storeAppLink(
              goalLab?.appStoreUrl,
              'GoalLab',
              goalLab?.icon,
              <>
                GoalLab forecasts the majority of published global fixtures daily. The algorithm uses an 11 criteria
                model to forecast Over 2.5 and Under 2.5 football goal bands. It will forecast with all 11 criteria, if
                available for the fixture, or whatever it can get - forecast confidence is reflected in the volume of
                criteria available for any given fixture. This doesn&apos;t mean a lower confidence forecast is
                necessarily less accurate than one with more criteria - it depends on the criteria mix and how they
                interact. Historical win rates of every confidence level is listed as tracked by a rich and growing
                archive.
              </>,
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Coming soon</h2>
          <ul className="space-y-6 list-none pl-0">
            <li className="flex flex-col sm:flex-row gap-4 sm:items-start">
              <div className="shrink-0 rounded-2xl overflow-hidden border border-amber-200/20 bg-black/30 w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem]">
                <Image
                  src="/images/popgoals-icon.png"
                  alt="PopGoals app icon"
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="font-semibold text-amber-100/90">PopGoals</p>
                <p>
                  Three golden balls every day with the top slice of Over and Under 2.5 selections. Not on the App
                  Store yet.
                </p>
              </div>
            </li>
            <li className="space-y-1.5">
              <p className="font-semibold text-amber-100/90">ProphIt</p>
              <p>A new service! Have a theory for predicting goal band outcomes?</p>
              <p>
                This service lets you test your approach using real data, live execution, and transparent tracking — so
                you can see how it actually performs.
              </p>
            </li>
          </ul>
        </div>
      </section>
    </BestPicksSubpageShell>
  );
}
