import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'StatStrike — Privacy Policy & Support',
  description:
    'Privacy policy and support information for StatStrike, a football prediction and betting advice app.',
};

export default function StatStrikePrivacySupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
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
          StatStrike — Privacy Policy &amp; Support
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        {/* Privacy Policy Section */}
        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90 mb-16">
          <h2 className="text-2xl font-semibold text-white mb-4">Privacy Policy</h2>

          <p>
            StatStrike is a football prediction and betting advice app that provides statistical
            analysis and forecasts for football matches. This privacy policy explains what data
            the app processes, how it is stored, and how it is used.
          </p>

          <h3 className="text-xl font-semibold mt-6">1. Data We Collect and Process</h3>
          <p>
            StatStrike is designed to work primarily on your device. It does{' '}
            <span className="font-semibold">not</span> require an account, and it does{' '}
            <span className="font-semibold">not</span> send your personal information to any
            external servers controlled by the developer.
          </p>
          <p>On your device, StatStrike may store or process the following information:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Your prediction selections and track record data, stored locally so you can monitor
              your prediction performance over time.
            </li>
            <li>
              Cached fixture data and statistics fetched from third-party football APIs, stored
              locally to reduce API calls and enable offline viewing of recent data.
            </li>
            <li>
              Scoring pattern databases imported from external sources, stored locally for pattern
              analysis and fixture matching.
            </li>
            <li>
              App preferences such as confidence thresholds, criteria settings, and display
              preferences.
            </li>
          </ul>
          <p>
            This information is stored locally on your device using iOS&apos;s standard storage
            mechanisms. It is used only to provide the core features of StatStrike — displaying
            predictions, tracking performance, and analyzing historical patterns.
          </p>

          <h3 className="text-xl font-semibold mt-6">2. Third-Party Data Sources</h3>
          <p>
            StatStrike fetches football fixture data, match statistics, and team information from
            third-party football APIs (such as API-Football). This data includes:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Fixture schedules and match results</li>
            <li>Team statistics and performance data</li>
            <li>Historical match data and head-to-head records</li>
            <li>Goal timing and event data for pattern analysis</li>
          </ul>
          <p>
            This third-party data is cached locally on your device for performance and offline
            access. The app does not modify or share this data with other services.
          </p>

          <h3 className="text-xl font-semibold mt-6">3. No Accounts, Analytics or Ads</h3>
          <p>
            StatStrike does not use in-app analytics SDKs (such as Google Analytics or Firebase),
            does not track you across other apps or websites, and does not include third-party
            advertising. The app does not collect your name, email address, payment details, or any
            other personal profile information.
          </p>

          <h3 className="text-xl font-semibold mt-6">4. Network and Cloud Services</h3>
          <p>
            StatStrike fetches football data from third-party APIs over the internet. This data is
            cached locally on your device. The app does not upload your prediction selections,
            track record, or personal information to any remote server controlled by the developer.
          </p>
          <p>
            Your iOS device and installed apps may communicate with Apple or other services in the
            normal course of operation (for example, App Store updates or iCloud backups), but
            StatStrike does not add any additional tracking or analytics to those services.
          </p>

          <h3 className="text-xl font-semibold mt-6">5. Data Storage &amp; Retention</h3>
          <p>
            All data used by StatStrike is stored locally on your device. This includes cached
            fixture data, your prediction track record, imported pattern databases, and app
            preferences.
          </p>
          <p>
            If you uninstall StatStrike, iOS will remove the application and its local data. You
            can also clear cached data through the app&apos;s settings if available.
          </p>

          <h3 className="text-xl font-semibold mt-6">6. Children&apos;s Privacy</h3>
          <p>
            StatStrike is intended for users 18 years and older due to its betting advice content.
            The app does not knowingly collect personal information from children. If you are a parent
            or guardian and believe a child has used the app, please contact the developer.
          </p>

          <h3 className="text-xl font-semibold mt-6">7. Your Choices</h3>
          <p>You remain in control of your data on your device. You can:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Uninstall StatStrike at any time, which removes the application and its data.</li>
            <li>
              Clear cached fixture data through the app settings (if this feature is available).
            </li>
            <li>
              Delete your track record data by resetting the app or manually clearing its storage.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">8. Changes to This Policy</h3>
          <p>
            We may update this privacy policy from time to time. We will notify you of any
            significant changes by posting the new policy on this page and updating the &quot;Last
            updated&quot; date.
          </p>
        </section>

        {/* Support Section */}
        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90 border-t border-white/10 pt-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Support</h2>

          <p>
            Thanks for using StatStrike. This section explains how to get help, report issues, and
            share feedback.
          </p>

          <h3 className="text-xl font-semibold mt-6">Getting Help</h3>
          <p>
            If you&apos;re experiencing issues with StatStrike, such as:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Predictions not displaying or updating</li>
            <li>Fixture data not loading</li>
            <li>Track record not recording correctly</li>
            <li>Pattern database import issues</li>
            <li>App crashes or unexpected behavior</li>
          </ul>
          <p className="mt-4">
            Please email support with the following information:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your iPhone/iPad model</li>
            <li>Your iOS version</li>
            <li>A description of the issue</li>
            <li>What you expected to happen vs. what actually happened</li>
            <li>Screenshots or screen recordings if possible</li>
            <li>Steps to reproduce the issue (if applicable)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">Common Questions</h3>

          <h4 className="text-lg font-semibold mt-4">Why are no predictions showing?</h4>
          <p>
            Predictions are generated based on statistical criteria and confidence thresholds. If
            no predictions appear, it may mean that today&apos;s fixtures don&apos;t meet the
            current criteria settings. Try adjusting your confidence threshold or criteria
            requirements in the app settings.
          </p>

          <h4 className="text-lg font-semibold mt-4">How often is fixture data updated?</h4>
          <p>
            StatStrike fetches fixture data from third-party APIs. The app caches this data
            locally to reduce API calls. You can manually refresh the data through the app&apos;s
            refresh function.
          </p>

          <h4 className="text-lg font-semibold mt-4">What is the pattern database?</h4>
          <p>
            The pattern database contains team scoring pattern analysis that helps identify
            fixtures where teams have aligned scoring time zones. This database can be imported
            from external sources and is used to enhance prediction accuracy.
          </p>

          <h4 className="text-lg font-semibold mt-4">Are predictions guaranteed?</h4>
          <p>
            No. StatStrike provides statistical analysis and predictions based on historical data
            and patterns. Predictions are not guarantees of outcomes. Always gamble responsibly
            and within your means.
          </p>

          <h3 className="text-xl font-semibold mt-6">Contact</h3>
          <p>
            If you have questions about this privacy policy, need support, or want to report an
            issue, please contact us:
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
        </section>
      </div>
    </main>
  );
}

