import type { Metadata } from 'next';
import Link from 'next/link';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { BestPicksContentWithSideAdLayout } from '@/components/best-picks/BestPicksContentWithSideAdLayout';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { BlogPostClient } from '@/components/blog/BlogPostClient';

export const metadata: Metadata = {
  title: 'Blogs',
  description: 'Article from the blogs.',
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.trim() ?? '';
  return (
    <BestPicksContentWithSideAdLayout>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <BestPicksSiteNav variant="header" />
        </div>

        <BlogPostClient slug={slug} />

        <footer className="mt-12 space-y-4 border-t border-white/10 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <AdSenseAutoPlaceholder orientation="horizontal" className="w-full min-h-[90px]" />
          <p className="max-w-[min(100%,42rem)] text-left text-[11px] leading-relaxed text-white/75 md:text-xs">
            <Link href="/football-predictions/privacy" className="underline hover:text-white/70 underline-offset-2">
              Privacy policy
            </Link>
            <span className="text-white/25"> · </span>
            Google ads may appear on this page; the privacy policy covers cookies and how ads work.
          </p>
        </footer>
      </div>
    </BestPicksContentWithSideAdLayout>
  );
}
