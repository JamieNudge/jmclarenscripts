import type { Metadata } from 'next';
import { BplHubCell } from '@/components/best-picks/BplHubCell';
import { BestPicksHeadAndPanels } from '@/components/best-picks/BestPicksHeadAndPanels';
import { BestPicksHubWithSideAdLayout } from '@/components/best-picks/BestPicksHubWithSideAdLayout';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';
import { loadAndAnotherThingPostsForPublic } from '@/lib/and-another-thing.posts.server';
import { hubContentWidthClass } from '@/lib/hub/ui';

const hubDescription =
  "Football Predictions & Data-Driven Picks — BPL hub, how each app works, video, Today's Research Selections on a dedicated page, and a coming-soon beta slot. Live data from Firebase when configured; informational only.";

const hubOgImage = {
  url: '/football-predictions/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${FOOTBALL_PREDICTIONS_PAGE_TITLE} — GoalLab`,
} as const;

export const metadata: Metadata = {
  title: FOOTBALL_PREDICTIONS_PAGE_TITLE,
  description: hubDescription,
  openGraph: {
    title: FOOTBALL_PREDICTIONS_PAGE_TITLE,
    description: hubDescription,
    type: 'website',
    images: [hubOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: FOOTBALL_PREDICTIONS_PAGE_TITLE,
    description: hubDescription,
    images: [hubOgImage.url],
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BestPicksPage() {
  const andAnotherThingInitialPosts = await loadAndAnotherThingPostsForPublic();
  return (
    <BestPicksHubWithSideAdLayout>
      {/*
        Hub: intro + (grid + blog at 2xl) inside one flex-1; ad + footer come from the layout.
      */}
      <div className={hubContentWidthClass}>
        <BestPicksHeadAndPanels andAnotherThingInitialPosts={andAnotherThingInitialPosts}>
          <BplHubCell showTodayFixtures={false} />
        </BestPicksHeadAndPanels>
      </div>
    </BestPicksHubWithSideAdLayout>
  );
}
