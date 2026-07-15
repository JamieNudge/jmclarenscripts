'use client';

import { BplHubCell } from '@/components/best-picks/BplHubCell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BestPicksHubWithSideAdLayout } from '@/components/best-picks/BestPicksHubWithSideAdLayout';
import { BestPicksResearchAlgorithmPanel } from '@/components/best-picks/BestPicksResearchAlgorithmPanel';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import { FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE } from '@/lib/football-predictions-brand';
import { hubContentWidthClass } from '@/lib/hub/ui';

/**
 * Full page: same chrome as the football-predictions hub (side ad + shared footer) + two columns on
 * `xl+` (BPL / StatStrike hub + research feeds); stacked on small screens (research first).
 */
export function ResearchAlgorithmSelectionsView() {
  const dateKey = useBestPicksLondonDateKey();

  return (
    <BestPicksHubWithSideAdLayout>
      <div className={hubContentWidthClass}>
        {BEST_PICKS_EXTENDED_SITE_NAV ? <BestPicksSiteNav variant="header" /> : null}
        <div className={BEST_PICKS_EXTENDED_SITE_NAV ? 'mt-6' : 'mt-0'}>
          <HubFootballLink
            href="/football-predictions"
            className="inline-flex items-center gap-2 text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Football Predictions
          </HubFootballLink>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">{FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE}</h1>
        <div className="text-sm text-[var(--hub-text-soft)] mb-8 leading-relaxed">
          Day <span className="tabular-nums text-[var(--hub-accent-link)]">{dateKey}</span> in the picks calendar. Selections
          update when Firebase is configured. For the app overview, see{' '}
          <HubFootballLink
            href="/football-predictions#how-apps-work"
            className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link)]"
          >
            How apps work
          </HubFootballLink>{' '}
          on the home page.
        </div>

        {/*
          xl: StatStrike (left) + research (right). Below xl: research first, then BPL.
          Fixed row height on xl+ so the hub tile’s in-cell scroll and research list have room.
        */}
        <div className="grid w-full min-h-0 grid-cols-1 gap-5 xl:grid-cols-2 xl:grid-rows-1 xl:items-stretch xl:gap-6 xl:min-h-[32rem] xl:max-h-[min(90vh,52rem)]">
          <div className="min-w-0 min-h-0 order-2 flex flex-col max-xl:min-h-[min(50vh,22rem)] xl:order-1 xl:h-full xl:min-h-0">
            <BplHubCell />
          </div>
          <div className="min-w-0 min-h-0 order-1 flex flex-col max-xl:min-h-[min(60vh,28rem)] xl:order-2 xl:h-full xl:min-h-0">
            <BestPicksResearchAlgorithmPanel dateKey={dateKey} showPanelHeading={false} />
          </div>
        </div>
      </div>
    </BestPicksHubWithSideAdLayout>
  );
}
