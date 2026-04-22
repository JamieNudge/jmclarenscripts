import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';

export const metadata: Metadata = {
  title: 'Methodology — Today’s Best Picks',
  description:
    'Methodology for Today’s Best Picks: multi-model inputs, selection logic at a high level, and limitations.',
};

export default function BestPicksMethodologyPage() {
  return (
    <BestPicksSubpageShell
      title="Methodology"
      description="High-level view of how selections are produced and what the page is not claiming."
    >
      <section className="space-y-4">
        <p>
          Today&apos;s Best Picks brings together outputs from separate forecasting pipelines (for example StatStrike
          and GoalLab) and, where configured, live feeds for research-style selections. Each source applies its own
          modelling and thresholds; this site surfaces those outputs for the calendar day shown on the page.
        </p>
        <p>
          <strong className="font-medium text-white">Consensus vs per-model lines.</strong> Where a daily consensus
          feed exists, it reflects agreement rules and filters defined in upload tooling (for example minimum sources
          or caps). Per-model lines list individual contributing sources for the same day so readers can see alignment
          or disagreement at a glance.
        </p>
        <p>
          <strong className="font-medium text-white">Limitations.</strong> Past patterns and model outputs are not
          guarantees of future results. Match status, data quality, and late changes can affect what was true at upload
          time versus kickoff. The page does not offer financial advice, real-money gambling, prizes, or simulated
          gambling. Past performance is no guarantee of future results. All fixture forecasts, blog content, and other
          site material on this page are for informational purposes only.
        </p>
        <p className="text-xs text-white/55">
          For how each app is described for visitors, see{' '}
          <Link
            href="/best-picks/how-it-works"
            className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
          >
            How apps work
          </Link>
          .
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
