import type { Metadata } from 'next';
import Link from 'next/link';

const APPLE_STANDARD_EULA_URL =
  'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export const metadata: Metadata = {
  title: 'AssetForge — Terms of Use',
  description:
    'Terms of Use for AssetForge (Developer Image Toolkit), including Apple’s Licensed Application End User License Agreement.',
};

export default function AssetForgeTermsPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">AssetForge — Terms of Use</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            AssetForge (subtitle: Developer Image Toolkit) is licensed, not sold, to you. Your use of
            the macOS app distributed through the Mac App Store or TestFlight is subject to Apple&apos;s
            Licensed Application End User License Agreement (Standard EULA). AssetForge does not ship a
            custom EULA.
          </p>

          <p>
            <a
              href={APPLE_STANDARD_EULA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              Apple Standard EULA (Licensed Application End User License Agreement)
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-8">Purchase</h2>
          <p>
            AssetForge is offered as a one-time Mac App Store purchase. There are no subscriptions,
            in-app purchases, ads, or accounts. Refunds, if any, are handled by Apple under App Store
            terms.
          </p>

          <h2 className="text-xl font-semibold mt-8">Local processing</h2>
          <p>
            Images you load are processed on your Mac. The app does not upload your artwork to the
            developer. File access on Mac App Store builds follows Apple&apos;s App Sandbox.
          </p>

          <h2 className="text-xl font-semibold mt-8">Support and privacy</h2>
          <p>
            For help with the app, see our{' '}
            <Link href="/support/assetforge" className="underline hover:text-blue-300">
              support page
            </Link>
            . For how data is handled, see our{' '}
            <Link href="/privacy/assetforge" className="underline hover:text-blue-300">
              privacy policy
            </Link>
            . Accessibility information is on the{' '}
            <Link href="/accessibility/assetforge" className="underline hover:text-blue-300">
              accessibility page
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold mt-8">Contact</h2>
          <p>
            Questions about these terms:{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=AssetForge%20Terms"
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
