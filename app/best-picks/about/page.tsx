import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';

export const metadata: Metadata = {
  title: 'About — Today’s Best Picks',
  description:
    'What Today’s Best Picks is: App Store links, live research selections, blog, in-development teasers, and disclaimers.',
};

export default function BestPicksAboutPage() {
  return (
    <BestPicksSubpageShell
      title="About Today’s Best Picks"
      description="What this page is for, what you’ll find on it, and how it relates to the apps."
    >
      <section className="space-y-4">
        <p>
          This page is part of Jamie McLaren&apos;s public app portfolio. It pulls together a few things in one place:
          App Store links to shipped products, a live feed of the latest research algorithm selections for the London
          calendar date in the headline, links to{' '}
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
          <Link
            href="/best-picks/how-it-works"
            className="text-amber-200/85 underline underline-offset-2 hover:text-amber-100/90"
          >
            How apps work
          </Link>
          .
        </p>
        <p className="text-xs text-white/55">
          Questions about this website: see{' '}
          <Link
            href="/best-picks/contact"
            className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
          >
            Contact
          </Link>
          . Privacy and cookies:{' '}
          <Link href="/privacy" className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90">
            Privacy policy
          </Link>
          .
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
