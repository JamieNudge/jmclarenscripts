import type { Metadata } from 'next';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';

export const metadata: Metadata = {
  title: 'Methodology — Football Predictions & Data-Driven Picks',
  description:
    'Methodology for this hub: multi-model inputs, selection logic at a high level, and limitations.',
};

export default function BestPicksMethodologyPage() {
  return (
    <BestPicksSubpageShell
      title="Methodology"
      description="High-level view of how selections are produced and what the page is not claiming."
      hubFooter
    >
      <section className="space-y-4">
        <p>
          This hub brings together outputs from separate forecasting pipelines (for example StatStrike
          and GoalLab) and, where configured, live feeds for research-style selections. Each source applies its own
          modelling and thresholds; this site surfaces those outputs for the calendar day shown on the page.
        </p>
        <p>
          <strong className="font-medium text-[var(--hub-text)]">Consensus vs per-model lines.</strong> Where a daily consensus
          feed exists, it reflects agreement rules and filters defined in upload tooling (for example minimum sources
          or caps). Per-model lines list individual contributing sources for the same day so readers can see alignment
          or disagreement at a glance.
        </p>
        <p>
          <strong className="font-medium text-[var(--hub-text)]">Limitations.</strong> Past patterns and model outputs are not
          guarantees of future results. Match status, data quality, and late changes can affect what was true at upload
          time versus kickoff. The page does not offer financial advice, real-money gambling, prizes, or simulated
          gambling. Past performance is no guarantee of future results. All fixture forecasts, blog content, and other
          site material on this page are for informational purposes only.
        </p>
        <p className="text-xs text-[var(--hub-text-soft)]">
          For how each app is described for visitors, see{' '}
          <HubFootballLink
            href="/football-predictions#how-apps-work"
            className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
          >
            How apps work
          </HubFootballLink>
          .
        </p>
      </section>

      <section className="space-y-4 border-t border-[var(--hub-border-soft)] pt-6">
        <h2 className="text-xl font-semibold text-[var(--hub-text)]">How PopGoals works</h2>
        <p>
          PopGoals is designed as a live match-intelligence product rather than a generic prediction feed. The
          app focuses on fixtures with historically interesting scoring patterns, especially matches that can
          show quieter early phases before stronger goal potential later in defined hot zones.
        </p>
        <p>
          At a high level, the app surfaces fixtures from one or more selection models. These can include a
          broader composite model and narrower delayed-action logic that looks for quiet-start conditions,
          possible odds drift, and later goal windows. The app then tracks whether the setup is still intact
          as the match unfolds.
        </p>
        <p>
          PopGoals therefore aims to answer three questions clearly: why a fixture qualified, whether the live
          thesis is still valid, and how the relevant strategy has been performing over time. Archive history,
          per-strategy comparisons, and fixture lifecycle states are used to make the product more transparent,
          but none of these are guarantees of future outcomes.
        </p>
        <p className="text-sm text-[var(--hub-text-soft)]">
          In practical terms, users may see fixtures move through stages such as qualified, watching, trigger,
          and settled, with detail views explaining the target window and the current state of the setup.
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
