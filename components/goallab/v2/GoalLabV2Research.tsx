'use client';

import { BplHubCell } from '@/components/best-picks/BplHubCell';
import { BestPicksResearchAlgorithmPanel } from '@/components/best-picks/BestPicksResearchAlgorithmPanel';
import { GOAL_LAB_V2_HOME_PATH } from '@/components/goallab/v2/paths';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';

/**
 * Same research + BPL data panels as V1, presented inside the V2 shell with hub→gl token bridging.
 */
export function GoalLabV2Research() {
  const dateKey = useBestPicksLondonDateKey();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14 space-y-8">
      <div>
        <HubFootballLink
          href={GOAL_LAB_V2_HOME_PATH}
          className="inline-flex items-center gap-2 text-sm text-[var(--gl-text-muted)] hover:text-[var(--gl-text)] transition-colors"
        >
          <span aria-hidden>←</span> Back to Home
        </HubFootballLink>
      </div>

      <header className="space-y-2 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--gl-text)]">
          Today&apos;s research selections
        </h1>
        <p className="text-base text-[var(--gl-text-soft)] leading-relaxed">
          Day <span className="tabular-nums text-[var(--gl-accent)]">{dateKey}</span> — consensus and per-model
          feeds from the daily Firebase pipelines.
        </p>
      </header>

      <div className="gl-v2-hub-bridge grid w-full min-h-0 grid-cols-1 gap-5 xl:grid-cols-2 xl:grid-rows-1 xl:items-stretch xl:gap-6 xl:min-h-[32rem] xl:max-h-[min(90vh,52rem)]">
        <div className="min-w-0 min-h-0 order-2 flex flex-col max-xl:min-h-[min(50vh,22rem)] xl:order-1 xl:h-full xl:min-h-0">
          <BplHubCell />
        </div>
        <div className="min-w-0 min-h-0 order-1 flex flex-col max-xl:min-h-[min(60vh,28rem)] xl:order-2 xl:h-full xl:min-h-0">
          <BestPicksResearchAlgorithmPanel dateKey={dateKey} showPanelHeading={false} />
        </div>
      </div>
    </div>
  );
}
