import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PopGoals — Support',
  description:
    'Support information for the PopGoals iOS app — help with the bubble lake, hot-zone targets, alerts, ads, purchases, and contacting the developer.',
};

export default function PopGoalsSupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a0d2e] to-[#581c87] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to portfolio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">PopGoals — Support</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Thanks for using PopGoals. This page explains how to get help with the bubble lake,
            hot-zone targets, fixture detail, alerts, Firebase-backed data not appearing, ads, or purchases.
          </p>

          <h2 className="text-xl font-semibold mt-6">Getting Help</h2>
          <p>Please include where possible:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Device model and iOS version.</li>
            <li>What you expected vs what happened (blank lake, purchase not unlocking, crash).</li>
            <li>Approximate date/time if data looked stale.</li>
            <li>Screenshots or a short screen recording.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=PopGoals%20Support"
              className="underline hover:text-violet-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-6">Related</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <Link href="/privacy/popgoals" className="underline hover:text-violet-300">
                Privacy policy &amp; support notes
              </Link>
            </li>
            <li>
              <Link href="/terms/popgoals" className="underline hover:text-violet-300">
                Terms of use
              </Link>
            </li>
            <li>
              <Link href="/disclaimer/popgoals" className="underline hover:text-violet-300">
                Disclaimer
              </Link>
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">What to Expect</h2>
          <p>
            PopGoals is an indie project. Replies may not be instant, but serious bug reports and
            purchase issues are prioritised.
          </p>
        </section>
      </div>
    </main>
  );
}
