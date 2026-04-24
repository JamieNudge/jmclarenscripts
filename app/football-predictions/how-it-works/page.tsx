import type { Metadata } from 'next';
import { HowItWorksFromHubRedirect } from './HowItWorksFromHubRedirect';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

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
    <div className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14 w-full">
        <HowItWorksFromHubRedirect />
      </div>
    </div>
  );
}
