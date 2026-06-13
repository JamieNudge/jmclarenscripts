import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PopGoals — Terms of Use',
  description:
    'Terms of Use for PopGoals, an iOS football app with bubble-lake targets, hot-zone alerts, and optional advertisements.',
};

export default function PopGoalsTermsPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">PopGoals — Terms of Use</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: April 2026</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Welcome to PopGoals. By downloading, installing, or using this application, you agree
            to be bound by these Terms of Use. If you do not agree, please do not use the app.
          </p>

          <h2 className="text-xl font-semibold mt-8">1. Nature of the Service</h2>
          <p>
            PopGoals displays football fixtures, bubble-lake targets, and hot-zone timing guidance
            for information and entertainment. Features may change between updates.
          </p>
          <p className="font-semibold text-yellow-300/95">
            PopGoals is for informational and entertainment purposes only. Outputs are not guarantees
            of match outcomes. Past or pooled statistics do not guarantee future results.
          </p>

          <h2 className="text-xl font-semibold mt-8">2. No Gambling Advice</h2>
          <p>
            The developer does not provide gambling, betting, or financial advice. If you use any
            information from the app in connection with betting, you do so entirely at your own
            risk.
          </p>

          <h2 className="text-xl font-semibold mt-8">3. Age Requirement</h2>
          <p>
            PopGoals is intended for users aged 18 and older. By using the app, you confirm you
            meet this requirement.
          </p>

          <h2 className="text-xl font-semibold mt-8">4. Responsible Gambling</h2>
          <p>
            If you gamble, do so responsibly. Help (UK example):{' '}
            <a
              href="https://www.begambleaware.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-violet-300"
            >
              BeGambleAware.org
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold mt-8">5. Advertising</h2>
          <p>
            PopGoals may show advertisements through Google AdMob unless you purchase ad removal.
          </p>

          <h2 className="text-xl font-semibold mt-8">6. Subscriptions and Purchases</h2>
          <p>Ad removal is offered via in-app purchases managed by Apple, for example:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Charges apply to your Apple ID as shown at purchase time.</li>
            <li>Subscriptions renew until cancelled in App Store account settings.</li>
            <li>Lifetime purchases do not renew.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">7. Data Accuracy</h2>
          <p>
            Fixture data, results, and published model outputs may be incomplete or delayed.
            Verify material facts independently before decisions.
          </p>

          <h2 className="text-xl font-semibold mt-8">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, the developer is not liable for indirect or
            consequential loss arising from use of the app, reliance on any pick or band label, or
            third-party service outages.
          </p>

          <h2 className="text-xl font-semibold mt-8">9. Intellectual Property</h2>
          <p>
            PopGoals, including its design and code, is protected by intellectual property laws.
            Do not copy or redistribute the app or its assets without permission.
          </p>

          <h2 className="text-xl font-semibold mt-8">10. Termination</h2>
          <p>
            Access to published data feeds may be withdrawn or changed. The developer may stop
            distributing the app on the App Store at any time in line with store policies.
          </p>

          <h2 className="text-xl font-semibold mt-8">11. Governing Law</h2>
          <p>
            These terms are governed by the laws of the United Kingdom, without regard to conflict
            of law rules.
          </p>

          <h2 className="text-xl font-semibold mt-8">12. Contact</h2>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=PopGoals%20Terms%20of%20Use"
              className="underline hover:text-violet-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-white/60 text-sm">
              By using PopGoals, you acknowledge that you have read and agree to these Terms of Use.
            </p>
            <p className="mt-4">
              <Link href="/privacy/popgoals" className="underline hover:text-violet-300">
                View Privacy Policy
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
