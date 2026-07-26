import type { Metadata } from 'next';
import Link from 'next/link';
import { passCreatePath } from '@/lib/statstrike/pass-constants';

export const metadata: Metadata = {
  title: 'Checkout cancelled — StatStrike',
  description: 'Stripe checkout was cancelled. No charge was made.',
};

export default function StatStrikePassCancelledPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-xl mx-auto px-4 py-12 md:py-16 space-y-6">
        <h1 className="text-3xl font-bold">Checkout cancelled</h1>
        <p className="text-sm text-white/80 leading-relaxed">
          You have not been charged and no access changes were made.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={passCreatePath()}
            className="inline-flex rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-200"
          >
            Return to Create Pass
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
          >
            Return to GoalLab
          </Link>
        </div>
      </div>
    </main>
  );
}
