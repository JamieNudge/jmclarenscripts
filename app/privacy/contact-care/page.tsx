import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Care — Privacy Policy',
  description:
    'Privacy policy for Contact Care: contact permissions, local data storage, and local notifications. No contact data is uploaded or shared.',
};

export default function ContactCarePrivacyPage() {
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
          Contact Care — Privacy Policy
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: March 2026
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <h2 className="text-xl font-semibold mt-6">Overview</h2>
          <p>
            This app is designed to help users stay connected with their friends and family by
            providing reminders to contact them.
          </p>

          <h2 className="text-xl font-semibold mt-6">Contact Permissions</h2>
          <p>
            Contact Care requires access to your device&apos;s contacts (READ_CONTACTS). We only access
            this information to display your list of contacts within the app so you can select who to
            set reminders for.
          </p>

          <h2 className="text-xl font-semibold mt-6">Data Storage</h2>
          <p>
            We do not upload your contacts to our servers. All contact data stays locally on your
            device and is never shared with the developer or any third party.
          </p>

          <h2 className="text-xl font-semibold mt-6">Notifications</h2>
          <p>
            We use local notifications to provide reminders at the times you specify. These
            notifications are processed entirely on your device.
          </p>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>
            If you have questions about this privacy policy or how Contact Care handles data, please
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
