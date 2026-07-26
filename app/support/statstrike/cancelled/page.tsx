import type { Metadata } from 'next';
import { GoalLabV2SubpageShell } from '@/components/goallab/v2/GoalLabV2SubpageShell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { passCreatePath } from '@/lib/statstrike/pass-constants';

export const metadata: Metadata = {
  title: 'Checkout cancelled — StatStrike',
  description: 'Stripe checkout was cancelled. No charge was made.',
};

export default function StatStrikePassCancelledPage() {
  return (
    <GoalLabV2SubpageShell
      title="Checkout cancelled"
      description="You have not been charged and no access changes were made."
    >
      <div className="flex flex-wrap gap-3">
        <HubFootballLink
          href={passCreatePath()}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--gl-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Return to Create Pass
        </HubFootballLink>
        <HubFootballLink
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-[var(--gl-border-strong)] bg-[var(--gl-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--gl-text)] transition-colors hover:bg-[var(--gl-elevated)]"
        >
          Return to GoalLab
        </HubFootballLink>
      </div>
    </GoalLabV2SubpageShell>
  );
}
