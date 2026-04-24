import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ProphIt — Privacy',
  description:
    'Privacy information for ProphIt, a football goal-band prediction product in development.',
};

export default function ProphitPrivacyPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">ProphIt — Privacy</h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()} · Product in development
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            <span className="font-semibold">ProphIt</span> is a football-related product in development. It
            is intended to help you test prediction approaches against real goal-band outcomes, with
            transparent tracking — see{' '}
            <Link
              href="/football-predictions#how-apps-work"
              className="underline hover:text-blue-300"
            >
              How apps work
            </Link>{' '}
            for a high-level description.
          </p>
          <p>
            A full, release-ready privacy policy and support page will be published with the public app
            and/or beta programme. Until then, the app is not distributed on the App Store as a
            finished product. If you are invited to a test build, that build may use third-party
            services (for example data sources or ads); the detailed list will be documented here
            and in the app when those features are final.
          </p>
          <p>
            The Football Predictions &amp; Data-Driven Picks and blog area is covered by the{' '}
            <Link href="/football-predictions/privacy" className="underline hover:text-blue-300">
              Predictions hub &amp; blog privacy policy
            </Link>
            . The portfolio home has a separate{' '}
            <Link href="/privacy" className="underline hover:text-blue-300">
              portfolio privacy policy
            </Link>
            . For questions about ProphIt specifically, you can still reach the developer at:
          </p>
          <p>
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=ProphIt%20privacy"
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
