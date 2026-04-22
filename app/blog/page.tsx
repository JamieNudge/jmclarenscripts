import type { Metadata } from 'next';
import Link from 'next/link';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { BlogIndexClient } from '@/components/blog/BlogIndexClient';

export const metadata: Metadata = {
  title: 'Blogs',
  description:
    'Articles and notes from Jamie McLaren — Today’s Best Picks, apps, and related topics.',
};

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <nav aria-label="Today's Best Picks section" className="mb-10">
          <Link href="/best-picks" className="text-sm text-white/80 hover:text-white underline-offset-4 hover:underline">
            Today&apos;s Best Picks
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold mb-3">Blogs</h1>
        <p className="text-sm text-white/65 mb-8 leading-relaxed">
          Original articles and updates. For the picks dashboard and methodology, use{' '}
          <Link href="/best-picks" className="text-amber-200/85 underline underline-offset-2 hover:text-amber-50/95">
            Today&apos;s Best Picks
          </Link>
          .
        </p>

        <BlogIndexClient />

        <footer className="mt-12 pt-8 border-t border-white/10 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <AdSenseAutoPlaceholder orientation="horizontal" className="w-full min-h-[90px]" />
          <p className="text-left text-[11px] md:text-xs text-white/50 leading-relaxed max-w-[min(100%,42rem)]">
            <Link href="/privacy" className="underline hover:text-white/70 underline-offset-2">
              Privacy policy
            </Link>
            <span className="text-white/25"> · </span>
            Google ads may appear on this page; the privacy policy covers cookies and how ads work.
          </p>
        </footer>
      </div>
    </main>
  );
}
