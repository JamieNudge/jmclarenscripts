import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GoalLabV2FixtureDetail } from '@/components/goallab/v2/GoalLabV2FixtureDetail';
import { GoalLabV2Shell } from '@/components/goallab/v2/GoalLabV2Shell';
import {
  FOOTBALL_PREDICTIONS_FIXTURES_TITLE,
  FOOTBALL_PREDICTIONS_PAGE_TITLE,
} from '@/lib/football-predictions-brand';

export const metadata: Metadata = {
  title: `Fixture — ${FOOTBALL_PREDICTIONS_FIXTURES_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
  robots: { index: false, follow: true },
};

export default function FixtureDetailPage() {
  return (
    <GoalLabV2Shell>
      <Suspense
        fallback={
          <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-[var(--gl-text-muted)]">Loading fixture…</p>
        }
      >
        <GoalLabV2FixtureDetail />
      </Suspense>
    </GoalLabV2Shell>
  );
}
