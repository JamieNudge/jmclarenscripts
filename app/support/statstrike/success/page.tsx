import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { StatStrikePassSuccessSection } from '@/components/statstrike/StatStrikeSupportPassSection';

export const metadata: Metadata = {
  title: 'StatStrike Supporter Pass — Confirmed',
  description: 'Confirming your StatStrike 24-hour Supporter Pass after Stripe checkout.',
};

export default function StatStrikePassSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-xl mx-auto px-4 py-12 md:py-16 space-y-6">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← GoalLab
        </Link>
        <h1 className="text-3xl font-bold">Thank you for supporting GoalLab</h1>
        <p className="text-sm text-white/70">
          Your payment was received. We’re confirming your StatStrike Supporter Pass — this normally
          happens automatically.
        </p>
        <Suspense fallback={<p className="text-sm text-white/60">Confirming your access…</p>}>
          <StatStrikePassSuccessSection />
        </Suspense>
      </div>
    </main>
  );
}
