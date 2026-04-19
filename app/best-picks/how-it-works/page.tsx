import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';

export const metadata: Metadata = {
  title: 'How it works — Today’s Best Picks',
  description:
    'How Today’s Best Picks works: StatStrike, GoalLab, Firebase research selections, and what the numbers mean. Informational only.',
};

export default function BestPicksHowItWorksPage() {
  return (
    <BestPicksSubpageShell
      title="How it works"
      description="What you see on Today’s Best Picks, where the data comes from, and how to read it."
    >
      <section className="space-y-4">
        <ul className="space-y-3 list-none pl-0 border-l-2 border-amber-400/25 pl-4">
          <li>
            <span className="font-semibold text-amber-100/90">StatStrike</span> — In-app daily selection with
            criteria-style confidence on goal bands (App Store link on the main Best Picks page).
          </li>
          <li>
            <span className="font-semibold text-amber-100/90">GoalLab</span> — An 11-criteria algorithm forecasting
            Over 2.5 and Under 2.5 goal bands with forecaster confidence, full track history and transparent track
            record.
          </li>
          <li>
            <span className="font-semibold text-amber-100/90">This page</span> —{' '}
            <strong className="font-medium text-white">Latest Research Selections</strong> (daily consensus and
            per-model lines from Firebase), App Store tiles, optional video, and a right-hand column with{' '}
            <strong className="font-medium text-white">PopGoals</strong> (beta) plus{' '}
            <strong className="font-medium text-white">ProphIt</strong>.
          </li>
        </ul>

        <p>
          Picks are <strong className="font-medium text-white">informational</strong> only — not betting tips,
          promises, or financial advice.
        </p>
        <p className="text-xs text-white/55">
          App terms and privacy: see App Store listings and the{' '}
          <Link href="/privacy" className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90">
            site privacy policy
          </Link>
          .
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
