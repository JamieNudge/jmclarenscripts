import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

const title = `How it works — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`;

export const metadata: Metadata = {
  title,
  description: 'How GoalLab modelling is described — see Methodology.',
  robots: { index: false, follow: true },
};

/** Legacy path — content lives on Methodology and the home model pipeline. */
export default function HowItWorksPage() {
  redirect('/football-predictions/methodology');
}
