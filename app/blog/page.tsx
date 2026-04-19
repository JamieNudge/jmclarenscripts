import type { Metadata } from 'next';
import Link from 'next/link';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { BlogIndexClient } from '@/components/blog/BlogIndexClient';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles and notes from Jamie McLaren — portfolio, apps, and related topics.',
};

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <nav aria-label="Site" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/80 mb-10">
          <Link href="/" className="hover:text-white underline-offset-4 hover:underline">
            Portfolio
          </Link>
          <span className="text-white/30" aria-hidden>
            ·
          </span>
          <Link href="/best-picks" className="hover:text-white underline-offset-4 hover:underline">
            Today&apos;s Best Picks
          </Link>
        </nav>

        <AdSenseAutoPlaceholder orientation="horizontal" className="w-full min-h-[72px] mb-8" />
        <p className="text-[10px] text-white/35 -mt-6 mb-8 leading-snug">
          Reserved regions for Google AdSense Auto ads when your account and site are enabled.
        </p>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">Blog</h1>
        <p className="text-sm text-white/65 mb-8 leading-relaxed">
          Original articles and updates. For the picks dashboard and methodology, use{' '}
          <Link href="/best-picks" className="text-amber-200/85 underline underline-offset-2 hover:text-amber-50/95">
            Today&apos;s Best Picks
          </Link>
          .
        </p>

        <BlogIndexClient />

        <div className="mt-12 pt-8 border-t border-white/10 space-y-2">
          <AdSenseAutoPlaceholder orientation="horizontal" className="w-full min-h-[90px]" />
        </div>
      </div>
    </main>
  );
}
