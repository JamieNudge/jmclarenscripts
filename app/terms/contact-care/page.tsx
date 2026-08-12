import type { Metadata } from 'next';
import Link from 'next/link';

const APPLE_STANDARD_EULA_URL =
  'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export const metadata: Metadata = {
  title: 'Contact Care — Terms of Use',
  description:
    'Terms of Use for Contact Care, including Apple’s Licensed Application End User License Agreement.',
};

export default function ContactCareTermsPage() {
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
          Contact Care — Terms of Use
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: March 2026
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Contact Care is licensed, not sold, to you. Your use of the iOS app is subject to
            Apple&apos;s Licensed Application End User License Agreement (Standard EULA), unless a
            custom EULA is provided.
          </p>

          <p>
            <a
              href={APPLE_STANDARD_EULA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-teal-300"
            >
              Apple Standard EULA (Licensed Application End User License Agreement)
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-8">Subscriptions and purchases</h2>
          <p>
            Premium features may be offered through auto-renewable subscriptions or one-time
            in-app purchases processed by Apple (App Store) or Google (Google Play). Pricing,
            renewal, and cancellation terms are shown in the store at the time of purchase and
            managed through your Apple ID or Google account settings.
          </p>

          <h2 className="text-xl font-semibold mt-8">Support and privacy</h2>
          <p>
            For help with the app, see our{' '}
            <Link href="/support/contact-care" className="underline hover:text-teal-300">
              support page
            </Link>
            . For how we handle data, see our{' '}
            <Link href="/privacy/contact-care" className="underline hover:text-teal-300">
              privacy policy
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold mt-8">Contact</h2>
          <p>
            Questions about these terms:{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Contact%20Care%20Terms"
              className="underline hover:text-teal-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
