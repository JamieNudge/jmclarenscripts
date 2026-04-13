import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PopGoals — Disclaimer',
  description:
    'Disclaimer for PopGoals: informational football picks and league banding; not betting or financial advice.',
};

export default function PopGoalsDisclaimerPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">PopGoals — Disclaimer</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: April 2026</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p className="font-semibold text-yellow-300/95">
            PopGoals provides statistical and model-based information for entertainment and general
            information only. Nothing in the app is a recommendation to bet, invest, or take any
            financial action.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Bands vs model reads</h2>
          <p>
            League-performance “bands” and per-fixture model percentages measure different things.
            A high band does not mean a given pick will win; a lower model percentage may still sit
            in a higher band when league pooled stats differ from the single-fixture read.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">No warranty</h2>
          <p>
            The app, data feeds, and visuals are provided “as is” without warranties of any kind.
            The developer does not warrant uninterrupted service, error-free data, or fitness for
            any particular purpose.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the developer is not responsible for any loss
            or damage arising from use of or reliance on PopGoals, including any gambling or
            staking decisions made by users.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Third parties</h2>
          <p>
            Fixtures, odds context, and hosted data may come from third parties. Their terms and
            accuracy are their responsibility.
          </p>

          <p className="pt-8 border-t border-white/10 text-white/70 text-sm">
            See also{' '}
            <Link href="/privacy/popgoals" className="underline hover:text-violet-300">
              Privacy policy
            </Link>{' '}
            and{' '}
            <Link href="/terms/popgoals" className="underline hover:text-violet-300">
              Terms of use
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
