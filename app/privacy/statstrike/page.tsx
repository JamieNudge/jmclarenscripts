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
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to GoalLab
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

          <h3 className="text-xl font-semibold mt-6">3. Advertising and Third-Party Services</h3>
          <p>
            StatStrike may display banner advertisements through Google AdMob while you are using
            the free tier of the app. If you purchase an eligible subscription, those ads are
            removed while the subscription remains active.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <span className="font-semibold">Google AdMob:</span> Used to show banner ads to users
              on the free tier. AdMob may process device identifiers and ad-related data to deliver
              personalised or non-personalised ads, subject to your device settings and Google&apos;s
              policies.
            </li>
            <li>
              <span className="font-semibold">Apple App Store:</span> Used to process subscriptions
              and purchases that unlock premium or ad-free access.
            </li>
          </ul>
          <p>
            StatStrike does not require an account and does not add separate social tracking SDKs.
            Aside from ad delivery on the free tier, the app does not collect your name, email
            address, or other personal profile information directly.
          </p>
          <p>
            When ads are shown, Google may act as an independent controller for certain advertising
            data it processes through AdMob and related ad serving systems. You can learn more about
            how Google uses data on partner sites and apps in Google&apos;s{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              className="underline hover:text-blue-300"
              target="_blank"
              rel="noreferrer"
            >
              partner sites policy
            </a>{' '}
            and review AdMob advertising partners in Google&apos;s{' '}
            <a
              href="https://support.google.com/admob/answer/9012903"
              className="underline hover:text-blue-300"
              target="_blank"
              rel="noreferrer"
            >
              ad technology providers list
            </a>
            .
          </p>
          <p>
            StatStrike uses Google&apos;s certified Consent Management Platform to collect and manage
            advertising privacy choices where required. Users in the EEA, UK, and Switzerland may be
            shown a consent message before ads are requested. Users in applicable US states can use
            the in-app privacy entry point to opt out of the sale or sharing of personal information
            for advertising purposes.
          </p>

          <h3 className="text-xl font-semibold mt-6">4. Network and Cloud Services</h3>
          <p>
            StatStrike fetches football data from third-party APIs over the internet. This data is
            cached locally on your device. The native app does not upload your prediction selections,
            track record, or personal information to any remote server controlled by the developer.
          </p>
          <p>
            Your iOS device and installed apps may communicate with Apple or other services in the
            normal course of operation (for example, App Store updates or iCloud backups), but
            StatStrike does not add any additional tracking or analytics to those services.
          </p>

          <h3 className="text-xl font-semibold mt-6">4a. StatStrike Web — 24h Supporter Pass (Stripe)</h3>
          <p>
            The browser version at thegoallab.net may offer a one-time 24-hour Supporter Pass
            processed by <span className="font-semibold">Stripe</span>. When you create a pass we may
            store: Checkout Session identifiers, amount, pass expiry, an access token hash (not the
            raw token), optional email, and consent choices you make on the Create Pass page.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <span className="font-semibold">Welcome email:</span> transactional confirmation of
              your pass (sent when an email is available).
            </li>
            <li>
              <span className="font-semibold">Marketing updates:</span> only if you tick the
              marketing checkbox (unchecked by default).
            </li>
            <li>
              <span className="font-semibold">End-of-pass survey:</span> only if you tick the survey
              checkbox (unchecked by default); sent around when access ends. If you reply through
              the linked form, your response is stored with the related pass identifier so we can
              improve StatStrike.
            </li>
            <li>
              <span className="font-semibold">Your Picks / My Record on web:</span> stored locally in
              your browser (IndexedDB), not uploaded as a cloud account.
            </li>
          </ul>
          <p>
            You can contact{' '}
            <a href="mailto:jmclarenscripts@gmail.com" className="underline hover:text-blue-300">
              jmclarenscripts@gmail.com
            </a>{' '}
            to withdraw marketing consent, request deletion of pass contact data, or ask about
            pass-related data.
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
            <li>Purchase an eligible subscription to remove in-app banner ads.</li>
            <li>Opt out of personalised advertising in your device settings where supported.</li>
            <li>Open Settings in the app and tap &quot;Manage privacy choices&quot; when available.</li>
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

          <h4 className="text-lg font-semibold mt-4">How do I remove ads?</h4>
          <p>
            Banner ads are shown on the free tier. If you purchase an eligible subscription, those
            ads are removed while the subscription is active. If ads continue to appear after
            subscribing, contact support and include your device details and purchase status.
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


