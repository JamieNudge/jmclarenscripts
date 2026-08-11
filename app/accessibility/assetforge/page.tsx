import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AssetForge — Accessibility',
  description:
    'Accessibility information for AssetForge, a macOS SwiftUI Developer Image Toolkit using standard controls, VoiceOver labels, and system typography.',
};

export default function AssetForgeAccessibilityPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">AssetForge — Accessibility</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            AssetForge is built with <span className="font-semibold">SwiftUI</span> and standard macOS
            controls so it follows system behaviour for Dynamic Type where applicable, keyboard navigation,
            and VoiceOver.
          </p>

          <h2 className="text-xl font-semibold mt-6">VoiceOver and keyboard</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Primary actions use labelled buttons, toggles, and pickers.</li>
            <li>Drag-and-drop targets are exposed as interactive regions with descriptive labels.</li>
            <li>You can move through the window with Tab and activate controls with Space or Return.</li>
            <li>
              Settings (⌘,) includes clearly labelled links to Privacy Policy, Support, and Accessibility.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Visual design</h2>
          <p>
            The interface supports light and dark appearance following system settings. Status text uses
            colour together with symbols (for example checkmarks and crosses) so state is not conveyed by
            colour alone.
          </p>

          <h2 className="text-xl font-semibold mt-6">Motion</h2>
          <p>
            The app uses light system animations (for example progress indicators). There are no essential
            animations that block use of the app if you enable Reduce Motion in macOS.
          </p>

          <h2 className="text-xl font-semibold mt-6">Feedback</h2>
          <p>
            If you use assistive technologies and hit a barrier, please email{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=AssetForge%20Accessibility"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>{' '}
            with steps to reproduce so future updates can improve the experience.
          </p>
          <p>
            <Link href="/privacy/assetforge" className="underline hover:text-blue-300">
              Privacy policy
            </Link>
            {' · '}
            <Link href="/support/assetforge" className="underline hover:text-blue-300">
              Support
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
