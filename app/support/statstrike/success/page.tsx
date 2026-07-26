import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GoalLabV2SubpageShell } from '@/components/goallab/v2/GoalLabV2SubpageShell';
import { StatStrikePassSuccessSection } from '@/components/statstrike/StatStrikeSupportPassSection';

export const metadata: Metadata = {
  title: 'StatStrike Supporter Pass — Confirmed',
  description: 'Confirming your StatStrike 24-hour Supporter Pass after Stripe checkout.',
};

export default function StatStrikePassSuccessPage() {
  return (
    <GoalLabV2SubpageShell
      title="Thank you for supporting GoalLab"
      description="Your payment was received. We’re confirming your StatStrike Supporter Pass — this normally happens automatically."
    >
      <Suspense
        fallback={
          <p className="text-sm text-[var(--gl-text-soft)]" role="status">
            Confirming your access…
          </p>
        }
      >
        <StatStrikePassSuccessSection />
      </Suspense>
    </GoalLabV2SubpageShell>
  );
}
