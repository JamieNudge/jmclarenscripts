import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GoalLab — Terms of Use',
  description:
    'Terms of Use for GoalLab, a football prediction app for Over and Under 2.5 Goals markets using an 11-criteria algorithm.',
};

export default function GoalLabTermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0c1929] to-[#164e63] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Back button */}
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
          GoalLab — Terms of Use
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: February 2026
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Welcome to GoalLab. By downloading, installing, or using this application, you agree
            to be bound by these Terms of Use. If you do not agree to these terms, please do not
            use the app.
          </p>

          <h2 className="text-xl font-semibold mt-8">1. Nature of the Service</h2>
          <p>
            GoalLab is a football prediction application for Over and Under 2.5 Goals markets. It
            uses an 11-criteria algorithm with forecaster confidence, full track history, and a
            transparent track record, and it surfaces curated Best Picks when fixtures meet strict
            quality thresholds. The app provides confidence bands, performance insights, and
            historical tracking.
          </p>
          <p className="font-semibold text-yellow-400">
            GoalLab is for informational and entertainment purposes only. Predictions are not
            guarantees of outcomes. Past performance does not guarantee future results.
          </p>

          <h2 className="text-xl font-semibold mt-8">2. No Gambling Advice</h2>
          <p>
            GoalLab does not provide gambling, betting, or financial advice. The app presents
            statistical analysis and predictions that users may choose to use at their own
            discretion. The developer does not recommend, encourage, or endorse gambling of any
            kind.
          </p>
          <p>
            If you choose to use the information provided by GoalLab for betting purposes, you
            do so entirely at your own risk. You are solely responsible for any decisions you make
            based on the app&apos;s content.
          </p>

          <h2 className="text-xl font-semibold mt-8">3. Age Requirement</h2>
          <p>
            GoalLab is intended for users aged 18 years and older. By using this app, you
            confirm that you are at least 18 years of age. The app contains content related to
            betting markets and odds, which may be restricted in certain jurisdictions.
          </p>

          <h2 className="text-xl font-semibold mt-8">4. Responsible Gambling</h2>
          <p>
            If you choose to gamble, please do so responsibly:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Only bet what you can afford to lose</li>
            <li>Set limits on your spending and stick to them</li>
            <li>Never chase losses</li>
            <li>Take regular breaks from gambling</li>
            <li>Seek help if gambling becomes a problem</li>
          </ul>
          <p className="mt-4">
            For support with problem gambling, please contact organisations such as{' '}
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-300">
              BeGambleAware.org
            </a>{' '}
            (UK) or equivalent services in your country.
          </p>

          <h2 className="text-xl font-semibold mt-8">5. Advertising</h2>
          <p>
            GoalLab displays advertisements through Google AdMob. By using the app, you agree to
            the display of advertisements. You may remove advertisements by purchasing an ad-free
            subscription or lifetime access through the app.
          </p>

          <h2 className="text-xl font-semibold mt-8">6. Subscriptions and Purchases</h2>
          <p>
            GoalLab offers ad-free access through in-app purchases managed by Apple&apos;s App Store:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Payment will be charged to your Apple ID account at confirmation of purchase</li>
            <li>Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period</li>
            <li>Your account will be charged for renewal within 24 hours prior to the end of the current period</li>
            <li>You can manage and cancel subscriptions in your App Store account settings</li>
            <li>Lifetime purchases are one-time payments that do not renew</li>
          </ul>
          <p className="mt-4">
            For pricing and terms, please refer to the in-app purchase information displayed
            before purchase.
          </p>

          <h2 className="text-xl font-semibold mt-8">7. Data Accuracy</h2>
          <p>
            GoalLab uses third-party data sources for fixture information, statistics, and
            match results. While we strive to provide accurate information, we cannot guarantee
            the accuracy, completeness, or timeliness of all data. Data may be delayed, incomplete,
            or contain errors.
          </p>
          <p>
            You should verify important information independently before making any decisions
            based on the app&apos;s content.
          </p>

          <h2 className="text-xl font-semibold mt-8">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, the developer of GoalLab shall not be
            liable for any direct, indirect, incidental, special, consequential, or punitive
            damages arising from:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your use of or inability to use the app</li>
            <li>Any predictions or information provided by the app</li>
            <li>Any gambling losses or financial decisions made based on the app&apos;s content</li>
            <li>Any errors or inaccuracies in the data or predictions</li>
            <li>Any interruption or cessation of the service</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">9. Intellectual Property</h2>
          <p>
            GoalLab, including its design, features, and content, is protected by copyright
            and other intellectual property laws. You may not copy, modify, distribute, or create
            derivative works based on the app without express written permission.
          </p>

          <h2 className="text-xl font-semibold mt-8">10. Termination</h2>
          <p>
            We reserve the right to terminate or suspend access to GoalLab at any time, without
            notice, for conduct that we believe violates these Terms of Use or is harmful to other
            users, us, or third parties.
          </p>

          <h2 className="text-xl font-semibold mt-8">11. Changes to Terms</h2>
          <p>
            We may update these Terms of Use from time to time. We will notify you of any
            significant changes by posting the new terms on this page and updating the &quot;Last
            updated&quot; date. Your continued use of the app after changes constitutes acceptance
            of the new terms.
          </p>

          <h2 className="text-xl font-semibold mt-8">12. Governing Law</h2>
          <p>
            These Terms of Use shall be governed by and construed in accordance with the laws of
            the United Kingdom, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-xl font-semibold mt-8">13. Contact</h2>
          <p>
            If you have questions about these Terms of Use, please contact us:
          </p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=GoalLab%20Terms%20of%20Use"
              className="underline hover:text-cyan-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-white/60 text-sm">
              By using GoalLab, you acknowledge that you have read, understood, and agree to
              be bound by these Terms of Use.
            </p>
            <p className="mt-4">
              <Link href="/privacy/goallab" className="underline hover:text-cyan-300">
                View Privacy Policy
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
