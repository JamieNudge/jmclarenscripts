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
            <span className="font-semibold text-amber-100/90">GoalLab</span> — Four independent models on Over /
            Under 2.5; curated picks when models align.
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
        <p>
          <strong className="font-medium text-white">Latest Research Selections</strong> reads{' '}
          <code className="text-xs text-white/65 bg-black/30 px-1.5 py-0.5 rounded">dailyConsensusSelections</code> and{' '}
          <code className="text-xs text-white/65 bg-black/30 px-1.5 py-0.5 rounded">researchAlgorithmSelections</code>{' '}
          for the London calendar date shown on the Best Picks headline. Over and Under 2.5 style bands can both
          appear when your upload includes them.
        </p>
        <p>
          <strong className="font-medium text-white">Stat labels</strong> on model lines use whatever match window the
          forecasting pipeline attached; it can differ by statistic — not always a fixed &quot;last six&quot; sample
          unless the label says so.
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
