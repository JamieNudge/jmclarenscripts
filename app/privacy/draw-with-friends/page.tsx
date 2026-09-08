import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Draw With Friends — Privacy Policy',
  description:
    'Privacy policy for Draw With Friends: no accounts, temporary collaborative drawing sessions, optional photo backgrounds, and Firebase.',
};

export default function DrawWithFriendsPrivacyPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">Draw With Friends — Privacy Policy</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: November 16, 2025</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Draw With Friends is a collaborative drawing app that values your privacy. This policy explains
            what data we collect and how it is used.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">What we collect</h2>

          <h3 className="text-lg font-medium text-white/95 mt-4">Drawing session data (temporary)</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Session codes and room identifiers</li>
            <li>Drawing strokes sent between devices</li>
            <li>Session participation data</li>
          </ul>

          <h3 className="text-lg font-medium text-white/95 mt-4">Photo backgrounds (optional and temporary)</h3>
          <p>
            Photo sharing is completely optional. You choose if and when to import photos.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>You can optionally import a photo from your device to use as a drawing background.</li>
            <li>
              If you import a photo, it is compressed, uploaded to Firebase, shared with people in that
              drawing room, and automatically deleted after 24 hours of inactivity.
            </li>
            <li>The app warns you before import so you know the photo will be shared with the room.</li>
            <li>We only access the specific photo you pick — not your whole library.</li>
          </ul>

          <h3 className="text-lg font-medium text-white/95 mt-4">What we do not collect</h3>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>No names, emails, or phone numbers</li>
            <li>No user accounts or logins</li>
            <li>No location tracking</li>
            <li>No advertising data</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">How we use data</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Session data powers real-time collaboration between devices.</li>
            <li>Photo backgrounds (if imported) are shared only with people in that room.</li>
            <li>All session data, including photos, is deleted after 24 hours of inactivity.</li>
            <li>We do not sell, share, or use this data for any other purpose.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">Storage and third parties</h2>
          <p>
            Drawing data and optional photos are stored temporarily on Firebase (Google Cloud). Transmission
            is encrypted. Firebase may collect technical data such as device type and crash reports to keep
            the service working. See{' '}
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              Firebase&apos;s privacy policy
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Children&apos;s privacy</h2>
          <p>
            The app does not collect personal information. We recommend parental supervision when children
            under 13 use photo import, so they only share images they are allowed to share.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Your rights</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>You can stop using the app at any time.</li>
            <li>Session data is deleted automatically within 24 hours of inactivity.</li>
            <li>You control which photos, if any, you import.</li>
            <li>You can clear the canvas and background during a session.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">Contact</h2>
          <p>
            Questions:{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Draw%20With%20Friends%20privacy"
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
