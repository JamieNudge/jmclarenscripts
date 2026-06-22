import type { Metadata } from 'next';
import { FixturesListView } from '@/components/fixtures/FixturesListView';
import {
  FOOTBALL_PREDICTIONS_FIXTURES_TITLE,
  FOOTBALL_PREDICTIONS_PAGE_TITLE,
} from '@/lib/football-predictions-brand';

const description =
  "Today's fixtures from the daily upload — league-grouped list with forecast detail per match. Live when Firebase is configured.";

export const metadata: Metadata = {
  title: `${FOOTBALL_PREDICTIONS_FIXTURES_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
  description,
  openGraph: {
    title: `${FOOTBALL_PREDICTIONS_FIXTURES_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${FOOTBALL_PREDICTIONS_FIXTURES_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
    description,
  },
};

export default function FixturesPage() {
  return <FixturesListView />;
}
