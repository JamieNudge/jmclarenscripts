import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nudgetronic — Privacy Policy',
  description:
    'Privacy policy for Nudgetronic, an iOS app for screen time management with smart app blocking, grace periods, and auto-end timers.',
};

export default function NudgetronicPrivacyPage() {
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
          Nudgetronic — Privacy Policy
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: September 7, 2025
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Nudgetronic is designed to run on‑device. We do not collect, transmit, or sell personal data.
          </p>

          <h2 className="text-xl font-semibold mt-6">Data We Access</h2>
          <p>
            Nudgetronic may access the following data on your device, all of which is used locally and never
            transmitted or shared:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <span className="font-semibold">Screen Time/Family Controls:</span> Used locally to apply app
              reminders and shields. This data remains on your device and is not sent to any external servers.
            </li>
            <li>
              <span className="font-semibold">Notifications:</span> Used to deliver your scheduled reminders.
              Notification permissions are managed through iOS settings and are used only for the app&apos;s
              core functionality.
            </li>
            <li>
              <span className="font-semibold">Microphone (optional):</span> Only if you choose to record a
              personal voice cue. Audio recordings stay on your device and are never transmitted or shared.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Data Sharing</h2>
          <p>
            No personal data is shared with third parties. No analytics SDKs are included in Nudgetronic.
            The app operates entirely on your device, and all data processing happens locally.
          </p>

          <h2 className="text-xl font-semibold mt-6">Data Retention</h2>
          <p>
            Settings and reminders are stored on your device and can be deleted by uninstalling the app.
            All data associated with Nudgetronic remains on your iOS device and is never backed up to
            external servers controlled by the developer.
          </p>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>
            If you have any questions about this privacy policy or how Nudgetronic handles data, please
            get in touch:
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

