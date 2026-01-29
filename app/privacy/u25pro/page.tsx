import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'U25Pro — Privacy Policy & Support',
  description:
    'Privacy policy and support information for U25Pro, an Under 2.5 Goals football prediction app.',
};

export default function U25ProPrivacySupportPage() {
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
          U25Pro — Privacy Policy &amp; Support
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        {/* Privacy Policy Section */}
        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90 mb-16">
          <h2 className="text-2xl font-semibold text-white mb-4">Privacy Policy</h2>

          <p>
            U25Pro is an Under 2.5 Goals specialist football prediction app that provides
            statistical analysis and forecasts for low-scoring football matches. This privacy
            policy explains what data the app processes, how it is stored, and how it is used.
          </p>

          <h3 className="text-xl font-semibold mt-6">1. Data We Collect and Process</h3>
          <p>
            U25Pro is designed to work primarily on your device. It does{' '}
            <span className="font-semibold">not</span> require an account, and it does{' '}
            <span className="font-semibold">not</span> send your personal information to any
            external servers controlled by the developer.
          </p>
          <p>On your device, U25Pro may store or process the following information:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Your prediction selections and track record data, stored locally so you can monitor
              your prediction performance over time.
            </li>
            <li>
              Cached fixture data and statistics fetched from our prediction servers, stored
              locally to enable offline viewing of recent data.
            </li>
            <li>
              App preferences such as notification settings and display preferences.
            </li>
            <li>
              Subscription and purchase status for ad-free features.
            </li>
          </ul>
          <p>
            This information is stored locally on your device using iOS&apos;s standard storage
            mechanisms. It is used only to provide the core features of U25Pro — displaying
            Under 2.5 predictions, tracking performance, and managing your subscription status.
          </p>

          <h3 className="text-xl font-semibold mt-6">2. Third-Party Services</h3>
          <p>
            U25Pro uses the following third-party services:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <span className="font-semibold">Firebase:</span> For fetching daily Under 2.5
              predictions and fixture data. Firebase may collect anonymous usage analytics.
            </li>
            <li>
              <span className="font-semibold">Google AdMob:</span> For displaying advertisements
              to users who have not purchased ad-free access. AdMob may collect device identifiers
              and usage data for ad personalization. You can opt out of personalized ads in your
              device settings.
            </li>
            <li>
              <span className="font-semibold">Apple App Store:</span> For processing in-app
              purchases and subscriptions.
            </li>
          </ul>
          <p>
            Please refer to the privacy policies of these third-party services for more information
            about their data practices.
          </p>

          <h3 className="text-xl font-semibold mt-6">3. Advertising</h3>
          <p>
            U25Pro displays advertisements through Google AdMob to users who have not purchased
            ad-free access. These ads may be personalized based on your interests and usage
            patterns. You can:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Purchase ad-free access through an in-app subscription or one-time purchase</li>
            <li>Opt out of personalized advertising in your iOS device settings</li>
            <li>Reset your advertising identifier in your device settings</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">4. Data Storage &amp; Retention</h3>
          <p>
            All user data is stored locally on your device. This includes cached fixture data,
            your prediction track record, and app preferences.
          </p>
          <p>
            If you uninstall U25Pro, iOS will remove the application and its local data. You
            can also clear cached data through the app&apos;s settings if available.
          </p>

          <h3 className="text-xl font-semibold mt-6">5. Children&apos;s Privacy</h3>
          <p>
            U25Pro is intended for users 18 years and older due to its betting advice content.
            The app does not knowingly collect personal information from children. If you are a
            parent or guardian and believe a child has used the app, please contact the developer.
          </p>

          <h3 className="text-xl font-semibold mt-6">6. Your Choices</h3>
          <p>You remain in control of your data on your device. You can:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Uninstall U25Pro at any time, which removes the application and its data.</li>
            <li>Purchase ad-free access to remove advertisements.</li>
            <li>Opt out of personalized advertising in your device settings.</li>
            <li>
              Delete your track record data by resetting the app or manually clearing its storage.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">7. Changes to This Policy</h3>
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
            Thanks for using U25Pro. This section explains how to get help, report issues, and
            share feedback.
          </p>

          <h3 className="text-xl font-semibold mt-6">Getting Help</h3>
          <p>
            If you&apos;re experiencing issues with U25Pro, such as:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Predictions not displaying or updating</li>
            <li>Fixture data not loading</li>
            <li>Track record not recording correctly</li>
            <li>Subscription or ad-free purchase issues</li>
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
          </ul>

          <h3 className="text-xl font-semibold mt-6">Common Questions</h3>

          <h4 className="text-lg font-semibold mt-4">Why are no predictions showing?</h4>
          <p>
            U25Pro displays Under 2.5 Goals predictions that meet strict statistical criteria.
            If no predictions appear, it may mean that today&apos;s fixtures don&apos;t have
            any high-confidence Under 2.5 opportunities.
          </p>

          <h4 className="text-lg font-semibold mt-4">How often are predictions updated?</h4>
          <p>
            Predictions are typically uploaded daily before the main fixtures begin. The app
            will automatically fetch new predictions when you open it.
          </p>

          <h4 className="text-lg font-semibold mt-4">How do I remove ads?</h4>
          <p>
            You can remove advertisements by purchasing an ad-free subscription or lifetime
            access through the app&apos;s paywall. Tap the settings or subscription button
            within the app to see available options.
          </p>

          <h4 className="text-lg font-semibold mt-4">Are predictions guaranteed?</h4>
          <p>
            No. U25Pro provides statistical analysis and predictions based on historical data
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
              href="mailto:jmclarenscripts@gmail.com?subject=U25Pro%20Support"
              className="underline hover:text-cyan-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
