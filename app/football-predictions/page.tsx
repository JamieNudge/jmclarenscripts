import type { Metadata } from 'next';
import { GoalLabV2Home } from '@/components/goallab/v2/GoalLabV2Home';
import { GoalLabV2Shell } from '@/components/goallab/v2/GoalLabV2Shell';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

const hubDescription =
  'GoalLab — professional football forecasting for desktop. Explore today’s fixtures, research selections, and methodology. Live data from Firebase when configured; informational only.';

const hubOgImage = {
  url: '/football-predictions/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${FOOTBALL_PREDICTIONS_PAGE_TITLE} — football forecasting`,
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

export default function GoalLabHomePage() {
  return (
    <GoalLabV2Shell>
      <GoalLabV2Home />
    </GoalLabV2Shell>
  );
}
