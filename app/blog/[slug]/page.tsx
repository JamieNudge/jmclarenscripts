import type { Metadata } from 'next';
import Link from 'next/link';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { BlogPostClient } from '@/components/blog/BlogPostClient';

export const metadata: Metadata = {
  title: 'Blog post',
  description: 'Article from the blog.',
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.trim() ?? '';
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <nav
          aria-label="Today's Best Picks section"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/80 mb-10"
        >
          <Link href="/best-picks" className="hover:text-white underline-offset-4 hover:underline">
            Today&apos;s Best Picks
          </Link>
          <span className="text-white/30" aria-hidden>
            ·
          </span>
          <Link href="/blog" className="hover:text-white underline-offset-4 hover:underline">
            Blog
          </Link>
        </nav>

        <BlogPostClient slug={slug} />

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
