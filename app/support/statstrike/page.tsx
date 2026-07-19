import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { StatStrikeSupportPassSection } from '@/components/statstrike/StatStrikeSupportPassSection';

export const metadata: Metadata = {
  title: 'StatStrike — Support & 24h Pass',
  description:
    'Create a StatStrike 24-hour web pass (£1–£10), or get help with the StatStrike iOS and Android apps.',
};

export default function StatStrikeSupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to GoalLab
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Support The Goal Lab</h1>
        <p className="text-sm text-white/60 mb-8">
          StatStrike web · 24-hour pass · last updated {new Date().getFullYear()}
        </p>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-white/70">
              Loading pass options…
            </div>
          }
        >
          <StatStrikeSupportPassSection />
        </Suspense>

        <section className="mt-12 space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <h2 className="text-xl font-semibold">App support (iOS &amp; Android)</h2>
          <p>
            If you&apos;re having trouble with the native apps — predictions, subscriptions, ads, or
            crashes — email with device model, OS version, what you expected, and what happened:
          </p>
          <p>
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=StatStrike%20Support"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
          <p className="text-white/70">
            Web pass questions (checkout, unlock, consents) can use the same address with subject
            “StatStrike Web Pass”.
          </p>
        </section>
      </div>
    </main>
  );
}
