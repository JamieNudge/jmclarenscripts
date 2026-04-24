import type { Metadata } from 'next';
import { ResearchAlgorithmSelectionsView } from '@/components/best-picks/ResearchAlgorithmSelectionsView';
import {
  FOOTBALL_PREDICTIONS_PAGE_TITLE,
  FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE,
} from '@/lib/football-predictions-brand';

const desc =
  'Daily consensus and per-model research algorithm selections from the hub. Live data when Firebase is configured.';

export const metadata: Metadata = {
  title: `${FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
  description: desc,
  openGraph: {
    title: `${FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
    description: desc,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
    description: desc,
  },
};

export default function ResearchAlgorithmSelectionsPage() {
  return <ResearchAlgorithmSelectionsView />;
}
