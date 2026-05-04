import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'GoalLab — Privacy Policy & Support',
  description:
    'Privacy policy and support information for GoalLab, a football prediction app for Over and Under 2.5 Goals markets.',
};

export default function GoalLabPrivacySupportPage() {
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
          GoalLab — Privacy Policy &amp; Support
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        {/* Privacy Policy Section */}
        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90 mb-16">
          <h2 className="text-2xl font-semibold text-white mb-4">Privacy Policy</h2>

          <p>
            GoalLab is a football prediction app for Over and Under 2.5 Goals markets, built around
            an 11-criteria algorithm with forecaster confidence, full track history, and a
            transparent track record. This privacy policy explains what data the app processes,
            how it is stored, and how it is used.
          </p>

          <h3 className="text-xl font-semibold mt-6">1. Data We Collect and Process</h3>
          <p>
            GoalLab is designed to work primarily on your device. It does{' '}
            <span className="font-semibold">not</span> require an account, and it does{' '}
            <span className="font-semibold">not</span> send your personal information to any
            external servers controlled by the developer.
          </p>
          <p>On your device, GoalLab may store or process the following information:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Your track record data, stored locally and synced to Firebase so you can monitor
              prediction performance over time and across devices.
            </li>
            <li>
              Cached fixture data, forecasts, and confidence band statistics fetched from our
              prediction servers, stored locally to enable offline viewing of recent data.
            </li>
            <li>
              App preferences such as display settings and session counts.
            </li>
            <li>
              Subscription, introductory trial, and purchase status for access and advertising
              entitlements.
            </li>
          </ul>
          <p>
            This information is stored locally on your device using iOS&apos;s standard storage
            mechanisms and synced via Firebase for cloud backup. It is used only to provide the
            core features of GoalLab — displaying forecasts and confidence, curating Best Picks,
            tracking performance, and managing your subscription status.
          </p>

          <h3 className="text-xl font-semibold mt-6">2. Third-Party Services</h3>
          <p>
            GoalLab uses the following third-party services:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <span className="font-semibold">Firebase:</span> For fetching daily predictions,
              fixture data, and syncing your track record across devices. Firebase may collect
              anonymous usage analytics.
            </li>
            <li>
              <span className="font-semibold">Google AdMob:</span> For displaying advertisements
              to users in the ad-supported state, including users in the introductory trial period.
              AdMob may collect device identifiers and usage data for ad personalisation. You can
              opt out of personalised ads in your device settings.
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
          <p>
            When ads are shown, Google may act as an independent controller for certain advertising
            data it processes through AdMob and related ad serving systems. You can learn more about
            how Google uses data on partner sites and apps in Google&apos;s{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              className="underline hover:text-cyan-300"
              target="_blank"
              rel="noreferrer"
            >
              partner sites policy
            </a>{' '}
            and review AdMob advertising partners in Google&apos;s{' '}
            <a
              href="https://support.google.com/admob/answer/9012903"
              className="underline hover:text-cyan-300"
              target="_blank"
              rel="noreferrer"
            >
              ad technology providers list
            </a>
            .
          </p>

          <h3 className="text-xl font-semibold mt-6">3. Advertising</h3>
          <p>
            GoalLab displays advertisements through Google AdMob while you are in the ad-supported
            state. This can include the introductory free-trial period for the monthly subscription.
            These ads may be personalised based on your interests and usage patterns. You can:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Start the monthly subscription, which may include an App Store introductory free trial
              if you are eligible
            </li>
            <li>
              Purchase lifetime access through a one-time in-app purchase
            </li>
            <li>Opt out of personalised advertising in your iOS device settings</li>
            <li>Reset your advertising identifier in your device settings</li>
          </ul>
          <p>
            If you start the monthly subscription and receive an introductory free trial through App
            Store Connect, GoalLab remains unlocked during that trial while advertising may still be
            shown. If the subscription continues into the paid period, advertising is removed. If
            the subscription ends without renewal, app access ends.
          </p>
          <p>
            GoalLab uses Google&apos;s certified Consent Management Platform to collect and manage
            advertising privacy choices where required. Users in the EEA, UK, and Switzerland may be
            shown a consent message before ads are requested. Users in applicable US states can use
            the in-app privacy entry point to opt out of the sale or sharing of personal information
            for advertising purposes.
          </p>

          <h3 className="text-xl font-semibold mt-6">4. Data Storage &amp; Retention</h3>
          <p>
            User data is stored locally on your device and backed up to Firebase for cloud sync.
            This includes cached fixture data, your prediction track record, and app preferences.
          </p>
          <p>
            If you uninstall GoalLab, iOS will remove the application and its local data. Cloud
            data stored in Firebase may be retained for a period to allow restoration if you
            reinstall the app. You can also clear cached data through the app&apos;s settings.
          </p>

          <h3 className="text-xl font-semibold mt-6">5. Children&apos;s Privacy</h3>
          <p>
            GoalLab is intended for users 18 years and older due to its betting advice content.
            The app does not knowingly collect personal information from children. If you are a
            parent or guardian and believe a child has used the app, please contact the developer.
          </p>

          <h3 className="text-xl font-semibold mt-6">6. Your Choices</h3>
          <p>You remain in control of your data on your device. You can:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Uninstall GoalLab at any time, which removes the application and its local data.</li>
            <li>
              Start or cancel the monthly subscription in your Apple subscription settings, including
              during any introductory trial period.
            </li>
            <li>
              Purchase lifetime access through the app if you prefer a one-time payment option.
            </li>
            <li>Opt out of personalised advertising in your device settings.</li>
            <li>Open Settings in the app and tap &quot;Manage privacy choices&quot; when available.</li>
            <li>
              Reset your track record data through the app&apos;s settings.
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
            Thanks for using GoalLab. This section explains how to get help, report issues, and
            share feedback.
          </p>

          <h3 className="text-xl font-semibold mt-6">Getting Help</h3>
          <p>
            If you&apos;re experiencing issues with GoalLab, such as:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Predictions or Best Picks not displaying or updating</li>
            <li>Fixture data not loading</li>
            <li>Track record not syncing across devices</li>
            <li>Subscription, introductory trial, or lifetime purchase issues</li>
            <li>App crashes or unexpected behaviour</li>
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

          <h4 className="text-lg font-semibold mt-4">Why are no Best Picks showing?</h4>
          <p>
            GoalLab curates Best Picks based on strict criteria across the 11-criteria algorithm
            (including forecaster confidence and historical context). If no picks appear, it may
            mean that today&apos;s fixtures don&apos;t meet the quality threshold, or all picks
            have already kicked off and been cleared from the list.
          </p>

          <h4 className="text-lg font-semibold mt-4">How often are predictions updated?</h4>
          <p>
            Predictions are typically uploaded daily before the main fixtures begin. The app
            will automatically fetch new predictions when you open it.
          </p>

          <h4 className="text-lg font-semibold mt-4">What do the confidence bands mean?</h4>
          <p>
            Each prediction is assigned a confidence percentage based on forecaster confidence
            and historical context. Higher confidence bands have historically correlated with better
            win rates. You can view detailed performance by confidence band in the Performance and
            Track Record sections.
          </p>

          <h4 className="text-lg font-semibold mt-4">How do I remove ads?</h4>
          <p>
            GoalLab offers a monthly subscription and a separate lifetime purchase through the
            app&apos;s paywall. The monthly subscription may include a 3-day introductory free trial
            if you are eligible. Ads may still be shown during the introductory trial period, and
            are removed once the paid subscription period begins. Lifetime access removes ads
            immediately.
          </p>

          <h4 className="text-lg font-semibold mt-4">Are predictions guaranteed?</h4>
          <p>
            No. GoalLab provides statistical analysis and predictions based on historical data
            and the algorithm&apos;s criteria. Predictions are not guarantees of outcomes. Always
            gamble responsibly and within your means.
          </p>

          <h3 className="text-xl font-semibold mt-6">Contact</h3>
          <p>
            If you have questions about this privacy policy, need support, or want to report an
            issue, please contact us:
          </p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=GoalLab%20Support"
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
