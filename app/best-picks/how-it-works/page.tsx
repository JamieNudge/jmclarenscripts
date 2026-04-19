import type { Metadata } from 'next';
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

function storeLink(href: string | undefined, label: string) {
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

export default function BestPicksHowAppsWorkPage() {
  return (
    <BestPicksSubpageShell
      title="How apps work"
      description="What each product does. Live apps link to the App Store; coming-soon items are described here only."
    >
      <section className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Live on the App Store</h2>
          <ul className="space-y-3 list-none pl-0 border-l-2 border-amber-400/25 pl-4">
            <li>
              {storeLink(statStrike?.appStoreUrl, 'StatStrike')} — In-app daily selection with criteria-style
              confidence on goal bands.
            </li>
            <li>
              {storeLink(goalLab?.appStoreUrl, 'GoalLab')} — An 11-criteria algorithm forecasting Over 2.5 and Under 2.5
              goal bands with forecaster confidence, full track history and transparent track record.
            </li>
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

        <p className="text-xs text-white/55">
          For what appears on Today&apos;s Best Picks (feeds, blog, layout), see{' '}
          <Link href="/best-picks/about" className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90">
            About Today&apos;s Best Picks
          </Link>
          . App terms and privacy: App Store listings and the{' '}
          <Link href="/privacy" className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90">
            site privacy policy
          </Link>
          .
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
