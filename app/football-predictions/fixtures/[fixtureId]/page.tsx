import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FixtureDetailView } from '@/components/fixtures/FixtureDetailView';
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
    <Suspense fallback={<p className="text-sm text-[var(--hub-text)] p-10">Loading fixture…</p>}>
      <FixtureDetailView />
    </Suspense>
  );
}
