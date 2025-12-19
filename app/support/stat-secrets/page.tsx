import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Stat Secrets — Support',
  description:
    'Support information for the Stat Secrets iOS app, including how to get help and contact the developer.',
};

export default function StatSecretsSupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#111827] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to portfolio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">Stat Secrets — Support</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Thanks for using Stat Secrets. This page explains how to get help, report issues, and
            share feedback.
          </p>

          <h2 className="text-xl font-semibold mt-6">Getting Help</h2>
          <p>
            If you&apos;re having trouble with predictions, live score tracking, or notifications,
            please email support with:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your iPhone model and iOS version</li>
            <li>What you expected to happen vs what happened</li>
            <li>The fixture or match involved (if relevant)</li>
            <li>A screenshot or screen recording if possible</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Common Questions</h2>
          
          <h3 className="text-lg font-medium mt-4">Why are there no predictions today?</h3>
          <p>
            Our algorithm only surfaces predictions when the statistical criteria are strong. 
            Some days, no fixtures meet our validation thresholds — this is by design to 
            maintain quality over quantity.
          </p>

          <h3 className="text-lg font-medium mt-4">Why isn&apos;t the Live Activity updating?</h3>
          <p>
            Live Activities require background refresh permissions. Make sure Background App 
            Refresh is enabled for Stat Secrets in Settings → General → Background App Refresh.
          </p>

          <h3 className="text-lg font-medium mt-4">How do I track a match?</h3>
          <p>
            Tap on any fixture in the predictions list, then tap the &quot;Track&quot; button. 
            You&apos;ll receive live score updates and goal notifications for that match.
          </p>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Stat%20Secrets%20Support"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-6">Important Note</h2>
          <p>
            Stat Secrets provides statistical analysis for informational and entertainment 
            purposes only. Predictions are based on historical data and do not guarantee 
            future outcomes. Please see our{' '}
            <Link href="/disclaimer/stat-secrets" className="underline hover:text-blue-300">
              Disclaimer
            </Link>{' '}
            for full details.
          </p>
        </section>
      </div>
    </main>
  );
}

