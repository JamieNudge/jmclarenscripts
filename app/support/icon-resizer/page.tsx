import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Icon Resizer — Support',
  description:
    'Support information for the Icon Resizer macOS app, including TestFlight, exports, sandbox folder access, and how to contact the developer.',
};

export default function IconResizerSupportPage() {
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">Icon Resizer — Support</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Thanks for trying Icon Resizer. This page covers common questions, especially for beta testers
            on <span className="font-semibold">TestFlight</span> or the Mac App Store build.
          </p>

          <h2 className="text-xl font-semibold mt-6">Getting help</h2>
          <p>If something goes wrong, include when you can:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>macOS version and whether you installed from TestFlight or the App Store.</li>
            <li>Which mode you used (App Icons, Screenshots, Web headers, Image lab).</li>
            <li>What you expected vs what happened (for example, export count, error text).</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Exports and sandbox</h2>
          <p>
            The sandboxed build can only write where macOS allows. If the default folder is not available,
            use the <span className="font-semibold">folder picker</span> when the app offers it and select a
            destination (for example a folder on your Desktop or in Documents). After you grant access,
            exports should complete normally.
          </p>

          <h2 className="text-xl font-semibold mt-6">Source code</h2>
          <p>
            The project repository is public for transparency and issues:{' '}
            <a
              href="https://github.com/JamieNudge/IconResizerAppleApps"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              github.com/JamieNudge/IconResizerAppleApps
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p>
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Icon%20Resizer%20Support"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
          <p>
            Icon Resizer is an indie app; response times may vary, but legitimate bug reports and
            usability feedback are welcome.
          </p>
        </section>
      </div>
    </main>
  );
}
