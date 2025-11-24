import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Desktop Totem — Support',
  description:
    'Support information for the Desktop Totem macOS app, including how to get help and contact the developer.',
};

export default function DesktopTotemSupportPage() {
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
          Desktop Totem — Support
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Thanks for using Desktop Totem. This page explains how to get help, report issues,
            and share feedback about the app.
          </p>

          <h2 className="text-xl font-semibold mt-6">Getting Help</h2>
          <p>
            If you&apos;re having trouble with Desktop Totem — for example, the totem isn&apos;t
            updating as expected, the desktop window won&apos;t stay pinned, or the menu bar icon
            isn&apos;t behaving correctly — please reach out with as much detail as you can:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Which version of macOS you are using.</li>
            <li>What you expected to happen.</li>
            <li>What actually happened (including any error messages, if shown).</li>
            <li>Whether the issue happens every time or only occasionally.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>
            For support, bug reports or feature requests, you can contact the developer directly:
          </p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Desktop%20Totem%20Support"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-6">What to Expect</h2>
          <p>
            Desktop Totem is an indie macOS app, so response times may vary, but genuine bug reports,
            usability issues and accessibility concerns are taken seriously. Where possible, fixes
            and improvements will be rolled into future updates on the Mac App Store.
          </p>
        </section>
      </div>
    </main>
  );
}



