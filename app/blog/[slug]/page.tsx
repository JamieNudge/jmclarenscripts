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
          <span className="text-white/30" aria-hidden>
            ·
          </span>
          <Link href="/blog" className="hover:text-white underline-offset-4 hover:underline">
            Blog
          </Link>
        </nav>

        <AdSenseAutoPlaceholder orientation="horizontal" className="w-full min-h-[72px] mb-8" />
        <p className="text-[10px] text-white/35 -mt-6 mb-8 leading-snug">
          Reserved regions for Google AdSense Auto ads when your account and site are enabled.
        </p>

        <BlogPostClient slug={slug} />

        <div className="mt-12 pt-8 border-t border-white/10">
          <AdSenseAutoPlaceholder orientation="horizontal" className="w-full min-h-[90px]" />
        </div>
      </div>
    </main>
  );
}
