import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'StatStrike — Support',
  description:
    'Support information for the StatStrike app (iOS & Android), including how to get help with predictions, subscriptions, and contact the developer.',
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
          Back to portfolio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          StatStrike — Support
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Thanks for using StatStrike. This page explains how to get help, report issues,
            and share feedback about the app (iOS and Android).
          </p>

          <h2 className="text-xl font-semibold mt-6">Getting Help</h2>
          <p>
            If you&apos;re having trouble — for example, predictions or track record not loading,
            subscription, ad removal, or free trial issues, or the app crashing — please reach out
            with as much detail as you can:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your device (iPhone/Android), model and OS version.</li>
            <li>What you expected to happen.</li>
            <li>What actually happened (including any error messages, if shown).</li>
            <li>Whether the issue happens every time or only occasionally.</li>
            <li>A screenshot or screen recording if possible.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>
            For support, bug reports or feature requests:
          </p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=StatStrike%20Support"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-6">What to Expect</h2>
          <p>
            StatStrike is an indie app. Response times may vary, but bug reports and feedback
            are taken seriously and, where possible, fixes and improvements are included in
            future updates on the App Store and Google Play.
          </p>
        </section>
      </div>
    </main>
  );
}
