import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';

export const metadata: Metadata = {
  title: 'About — Football Predictions & Data-Driven Picks',
  description:
    'What this hub is: App Store links, live research selections, blog, in-development teasers, and disclaimers.',
};

export default function BestPicksAboutPage() {
  return (
    <BestPicksSubpageShell
      title="About Football Predictions & Data-Driven Picks"
      description="What this page is for, what you’ll find on it, and how it relates to the apps."
      hubFooter
    >
      <section className="space-y-4">
        <p>
          This page pulls together a few things in one place: App Store links to shipped products, a live feed of the
          latest research algorithm selections for the London calendar date in the headline, links to{' '}
          <Link href="/blog" className="text-amber-200/85 underline underline-offset-2 hover:text-amber-100/90">
            blog posts
          </Link>
          , optional embedded video, and a column highlighting products still in development (for example PopGoals and
          ProphIt).
        </p>
        <p>
          The site is a technical and product showcase — not a tipping service, not financial advice, and not gambling.
          Picks and forecasts shown here are <strong className="font-medium text-white">informational</strong> only —
          not betting tips, promises, or guarantees of future results.
        </p>
        <p>
          Individual apps have their own branding, terms, and App Store listings; those apply when you use the apps
          themselves. For how each app is meant to work, see{' '}
          <HubFootballLink
            href="/football-predictions#how-apps-work"
            className="text-amber-200/85 underline underline-offset-2 hover:text-amber-100/90"
          >
            How apps work
          </HubFootballLink>
          .
        </p>
        <p className="text-xs text-white/85">
          Questions about this website: see{' '}
          <HubFootballLink
            href="/football-predictions/contact"
            className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
          >
            Contact
          </HubFootballLink>
          . Privacy and cookies:{' '}
          <HubFootballLink
            href="/football-predictions/privacy"
            className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
          >
            Privacy policy
          </HubFootballLink>
          .
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
