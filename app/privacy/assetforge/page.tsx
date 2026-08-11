import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AssetForge — Privacy Policy',
  description:
    'Privacy policy for AssetForge (Developer Image Toolkit), a macOS app that prepares app icons, screenshots, and related image assets locally under App Sandbox.',
};

export default function AssetForgePrivacyPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">AssetForge — Privacy Policy</h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            AssetForge (subtitle: Developer Image Toolkit) is a macOS utility that runs on your Mac to
            prepare developer image assets — app icons, store screenshots, web and social images, brand
            marks, and related exports — and write PNG/JPEG (and related) files into folders you choose or
            that the app is allowed to access under Apple&apos;s{' '}
            <span className="font-semibold">App Sandbox</span>. This page explains what data is processed,
            where it stays, and what never leaves your machine.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Data we collect</h2>
          <p>
            The app does <span className="font-semibold">not</span> require an account. It does{' '}
            <span className="font-semibold">not</span> send your images, filenames, or usage analytics to
            servers operated by the developer.
          </p>
          <p>Processing happens locally and includes:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              Images you provide by drag-and-drop, file picker, or paste workflow — held in memory (and
              temporary on-disk caches only as macOS requires) while you resize, crop, or export.
            </li>
            <li>
              Optional app preferences (for example, last-used tool or output options) stored with standard
              macOS mechanisms such as <span className="font-mono">UserDefaults</span> on your device.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. Network and third parties</h2>
          <p>
            AssetForge is not designed to upload your artwork to the internet. Normal macOS behaviour
            (such as software updates, crash logs if you opt in at the system level, or iCloud if you save
            into an iCloud-backed folder) is outside the app&apos;s control.
          </p>
          <p>
            The app does not embed advertising SDKs, social trackers, or cross-app analytics frameworks.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. File access and sandbox</h2>
          <p>
            On Mac App Store builds, the app runs inside the App Sandbox. It can read and write files only
            where macOS allows — for example folders you explicitly select in an Open or Save dialog, or
            other scoped locations granted by the system. If a default path is not writable, the app may ask
            you to pick a destination.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Retention and deletion</h2>
          <p>
            Exported images remain on disk until you delete them. Uninstalling the app removes the
            application bundle; preferences may remain until you clear them or remove support files for the
            app from your Library if you choose to.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Children&apos;s privacy</h2>
          <p>
            AssetForge is a general-purpose developer/designer tool. It is not directed at children and
            does not knowingly collect personal information from minors.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Contact</h2>
          <p>
            Questions about this policy:{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=AssetForge%20Privacy"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
            .
          </p>
          <p>
            Related pages:{' '}
            <Link href="/support/assetforge" className="underline hover:text-blue-300">
              Support
            </Link>
            {' · '}
            <Link href="/accessibility/assetforge" className="underline hover:text-blue-300">
              Accessibility
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
