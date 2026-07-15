import type { Metadata } from 'next';
import { GoalLabV2Shell } from '@/components/goallab/v2/GoalLabV2Shell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BlogIndexClient } from '@/components/blog/BlogIndexClient';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

export const metadata: Metadata = {
  title: `Insights — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
  description:
    'Original articles and methodology notes behind the forecasting system. Daily forecasts on GoalLab.',
};

export default function BlogIndexPage() {
  return (
    <GoalLabV2Shell>
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14 space-y-8">
        <header className="space-y-2 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--gl-text)]">Insights</h1>
          <p className="text-base text-[var(--gl-text-soft)] leading-relaxed">
            Original articles and notes behind the forecasting system. Daily forecasts are on{' '}
            <HubFootballLink
              href="/football-predictions"
              className="font-medium text-[var(--gl-accent)] underline-offset-2 hover:underline"
            >
              GoalLab home
            </HubFootballLink>
            .
          </p>
        </header>

        <div className="gl-v2-hub-bridge">
          <BlogIndexClient />
        </div>

        <p className="text-[11px] leading-relaxed text-[var(--gl-text-muted)] border-t border-[var(--gl-border)] pt-6">
          <HubFootballLink
            href="/football-predictions/privacy"
            className="underline underline-offset-2 hover:text-[var(--gl-text-soft)]"
          >
            Privacy policies
          </HubFootballLink>
          <span> · </span>
          Informational content only. Advertising tech may load site-wide when enabled in configuration.
        </p>
      </div>
    </GoalLabV2Shell>
  );
}
