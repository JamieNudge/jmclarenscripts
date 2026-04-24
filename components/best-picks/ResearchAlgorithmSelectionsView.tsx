'use client';

import { BestPicksResearchAlgorithmPanel } from '@/components/best-picks/BestPicksResearchAlgorithmPanel';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';
import { FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE } from '@/lib/football-predictions-brand';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import Link from 'next/link';

/**
 * Full-page view for live consensus + per-model research feeds (moved out of the hub grid).
 */
export function ResearchAlgorithmSelectionsView() {
  const dateKey = useBestPicksLondonDateKey();

  return (
    <BestPicksSubpageShell
      title={FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE}
      description={
        <>
          Day <span className="tabular-nums text-amber-100/90">{dateKey}</span> in the picks calendar. Selections
          update when Firebase is configured. For the app overview, see{' '}
          <Link
            href="/football-predictions#how-apps-work"
            className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
          >
            How apps work
          </Link>{' '}
          on the home page.
        </>
      }
    >
      <div className="min-h-[min(60vh,36rem)]">
        <BestPicksResearchAlgorithmPanel dateKey={dateKey} showPanelHeading={false} />
      </div>
    </BestPicksSubpageShell>
  );
}
