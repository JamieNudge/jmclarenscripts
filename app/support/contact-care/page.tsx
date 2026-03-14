import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Care — Support',
  description:
    'Support information for the Contact Care cross-platform app, including how to get help and how to contact the developer.',
};

export default function ContactCareSupportPage() {
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
          Contact Care — Support
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: March 2026
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Thanks for your interest in Contact Care. This page explains how to get help, report
            issues, and share feedback about the app.
          </p>

          <p className="text-white/70 italic">
            This is a placeholder. Full support information will be available when the app is released.
          </p>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>
            For support, bug reports, or feature requests:
          </p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Contact%20Care%20Support"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
