import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MainCode — Privacy Policy',
  description:
    'Privacy policy for MainCode, an iOS app for discovering local concerts and performing-arts events by postcode, with optional Firebase backup.',
};

export default function MainCodePrivacyPage() {
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
          MainCode — Privacy Policy
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: February 2026
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            MainCode helps you discover local concerts and performing-arts events by postcode.
            This policy describes what data the app uses, where it is stored, and how it is shared.
          </p>

          <h2 className="text-xl font-semibold mt-6">Data You Provide</h2>
          <p>
            <span className="font-semibold">Postcode:</span> You enter a postcode (e.g. 11237) to load
            and find events. This is sent only to the PredictHQ API and, if you enable Firebase
            backup in Settings, used to request listing data from Firebase. We do not store your
            postcode on our own servers or associate it with your identity.
          </p>

          <h2 className="text-xl font-semibold mt-6">Third-Party Services</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <span className="font-semibold">PredictHQ:</span> When you tap &quot;Load events&quot;, the app
              sends your postcode and a date range to PredictHQ&apos;s API to fetch event and venue
              data. PredictHQ has its own privacy policy; we do not control their data practices.
            </li>
            <li>
              <span className="font-semibold">Firebase (Google):</span> MainCode uses Firebase
              Authentication (anonymous sign-in) and Firebase Realtime Database. When Firebase
              backup is enabled, the app may read event listings stored under your postcode.
              Anonymous auth creates a unique ID that is not linked to your email or name. Firebase
              is subject to Google&apos;s privacy policy.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Data Stored on Your Device</h2>
          <p>
            The following are stored only on your iPhone or iPad and are not sent to us:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Saved events (for the Saved tab and batch sharing).</li>
            <li>Calendar/planner events you add (e.g. from &quot;Add to calendar&quot; or &quot;Add event&quot;).</li>
            <li>Settings (e.g. Firebase backup on/off, onboarding completed).</li>
          </ul>
          <p>
            This data can be removed by deleting the app.
          </p>

          <h2 className="text-xl font-semibold mt-6">Data Sharing</h2>
          <p>
            We do not sell or share your personal data. We do not include analytics or advertising
            SDKs in MainCode. Event data shown in the app comes from PredictHQ and, when enabled,
            from Firebase; we do not collect or retain that data on our own systems.
          </p>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>
            If you have questions about this privacy policy or how MainCode handles data, please
            contact:
          </p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com"
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
