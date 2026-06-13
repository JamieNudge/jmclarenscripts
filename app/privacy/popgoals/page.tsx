import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PopGoals — Privacy Policy & Support',
  description:
    'Privacy policy and support information for PopGoals, an iOS football app focused on live hot-zone targets, Firebase-backed data, and optional ads.',
};

export default function PopGoalsPrivacySupportPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          PopGoals — Privacy Policy &amp; Support
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90 mb-16">
          <h2 className="text-2xl font-semibold text-white mb-4">Privacy Policy</h2>

          <p>
            PopGoals is an iOS app that presents football fixtures in a visual “bubble lake” and
            focuses on live hot-zone targets for in-play use. This policy explains what data is
            processed, where it comes from, and how third-party services are used.
          </p>

          <h3 className="text-xl font-semibold mt-6">1. Data We Collect and Process</h3>
          <p>
            PopGoals is designed to work <span className="font-semibold">without an account</span>.
            The app does not ask you to sign in, and it does not send your name, email, or contact
            list to servers controlled by the developer.
          </p>
          <p>On your device, PopGoals may store or process:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Cached copies of published selection, fixture, prediction, and statistics data
              fetched from Firebase Realtime Database (read-only listener), used to render the
              lake, bands, and fixture detail.
            </li>
            <li>
              Local preferences (for example motion pause, Reduce Motion override) stored with
              standard iOS app storage.
            </li>
            <li>
              Subscription and purchase state for ad removal, managed through StoreKit on device.
            </li>
          </ul>
          <p>
            This information is used only to provide the app&apos;s features — displaying picks,
            bands, and match detail, respecting your purchase state, and honouring accessibility
            choices.
          </p>

          <h3 className="text-xl font-semibold mt-6">2. Third-Party Services</h3>
          <p>PopGoals may use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <span className="font-semibold">Firebase (Google):</span> For reading published daily
              selection, predictions, and related data. Firebase&apos;s own privacy practices apply
              to infrastructure and tooling; consult Google&apos;s documentation for details.
            </li>
            <li>
              <span className="font-semibold">Google AdMob:</span> For showing ads to users who have
              not purchased ad removal. AdMob may process device identifiers and ad-related
              signals. You can limit ad tracking and reset identifiers in iOS Settings.
            </li>
            <li>
              <span className="font-semibold">Apple App Store:</span> For in-app purchases and
              subscription management.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">3. Advertising</h3>
          <p>
            If ads are enabled, Google AdMob may show personalised or non-personalised ads. You can
            remove ads by purchasing the in-app subscription or lifetime option. You can also adjust
            ad privacy settings on your device.
          </p>

          <h3 className="text-xl font-semibold mt-6">4. Data Storage &amp; Retention</h3>
          <p>
            Cached data lives on your device to improve responsiveness. If you uninstall PopGoals,
            iOS removes the app and its local data. Firebase holds publisher-controlled data on
            Google&apos;s infrastructure; the app does not provide a separate “cloud profile” for
            you to delete from within the app.
          </p>

          <h3 className="text-xl font-semibold mt-6">5. Children&apos;s Privacy</h3>
          <p>
            PopGoals is intended for adults (18+) because it relates to betting-market style
            content. The app does not knowingly collect personal information from children.
          </p>

          <h3 className="text-xl font-semibold mt-6">6. Your Choices</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Uninstall the app to remove local data.</li>
            <li>Purchase ad removal to stop AdMob banners in the app.</li>
            <li>Use in-app controls to pause motion and respect Reduce Motion.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6">7. Changes to This Policy</h3>
          <p>
            We may update this page from time to time. The “Last updated” context may change when
            material edits are made.
          </p>
        </section>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90 border-t border-white/10 pt-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Support</h2>
          <p>
            Thanks for trying PopGoals. For bugs, blank data, purchases that don&apos;t unlock, or
            general feedback, email with your device model, iOS version, and what you expected vs
            what happened. Screenshots help.
          </p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=PopGoals%20Support"
              className="underline hover:text-violet-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
          <p className="text-white/70 text-sm mt-6">
            For legal text only, see also{' '}
            <Link href="/terms/popgoals" className="underline hover:text-violet-300">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link href="/disclaimer/popgoals" className="underline hover:text-violet-300">
              Disclaimer
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
