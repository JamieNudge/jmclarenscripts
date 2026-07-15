import type { Metadata } from 'next';
import { BestPicksContentWithSideAdLayout } from '@/components/best-picks/BestPicksContentWithSideAdLayout';
import { HowItWorksFromHubRedirect } from './HowItWorksFromHubRedirect';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';
import { hubContentWidthClass } from '@/lib/hub/ui';

const title = `How apps work — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`;

export const metadata: Metadata = {
  title,
  description:
    'This information now appears on the Football Predictions & Data-Driven Picks home page. Redirecting…',
  robots: { index: false, follow: true },
  openGraph: { title, description: 'Content moved to the home page.', type: 'website' },
};

export default function HowItWorksPage() {
  return (
    <BestPicksContentWithSideAdLayout>
      <div className={hubContentWidthClass}>
        <HowItWorksFromHubRedirect />
      </div>
    </BestPicksContentWithSideAdLayout>
  );
}
