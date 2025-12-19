import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Recipe Saviour — Support',
  description:
    'Support information for the Recipe Saviour iOS app, including how to get help and contact the developer.',
};

export default function RecipeSaviourSupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1220] to-[#111827] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to portfolio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">Recipe Saviour — Support</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: {new Date().getFullYear()}</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Thanks for using Recipe Saviour. This page explains how to get help, report issues, and
            share feedback.
          </p>

          <h2 className="text-xl font-semibold mt-6">Getting Help</h2>
          <p>
            If you&apos;re having trouble extracting a recipe, saving recipes, or generating meal
            plans/shopping lists, please email support with:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your iPhone/iPad model.</li>
            <li>Your iOS version.</li>
            <li>The recipe URL that didn&apos;t work (if relevant).</li>
            <li>What you expected to happen vs what happened.</li>
            <li>A screenshot or screen recording if possible.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">Contact</h2>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Recipe%20Saviour%20Support"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>

          <h2 className="text-xl font-semibold mt-6">Allergen Feature (Advisory)</h2>
          <p>
            If you use the allergen scanning feature, please note it is an advisory convenience
            tool and may not detect all allergens. Always verify ingredients if you have severe
            allergies.
          </p>
        </section>
      </div>
    </main>
  );
}


