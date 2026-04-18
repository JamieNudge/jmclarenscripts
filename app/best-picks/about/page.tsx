import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';

export const metadata: Metadata = {
  title: 'About — Today’s Best Picks',
  description:
    'About Today’s Best Picks on Jamie McLaren’s site: purpose, publisher, and how this page relates to the apps.',
};

export default function BestPicksAboutPage() {
  return (
    <BestPicksSubpageShell
      title="About Today’s Best Picks"
      description="Who publishes this page and why it exists."
    >
      <section className="space-y-4">
        <p>
          This page is part of Jamie McLaren&apos;s public app portfolio. It showcases how statistical football
          forecasting tools (such as StatStrike and GoalLab) can be combined with live research feeds to produce a
          daily, informational view of model activity.
        </p>
        <p>
          The site is a technical and product showcase — not a tipping service, not financial advice, and not
          gambling. Individual apps may have their own branding, terms, and App Store listings; those apply when you
          use the apps themselves.
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
