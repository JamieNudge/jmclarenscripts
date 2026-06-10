import type { Metadata } from 'next';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BestPicksContentWithSideAdLayout } from '@/components/best-picks/BestPicksContentWithSideAdLayout';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { BlogIndexClient } from '@/components/blog/BlogIndexClient';

export const metadata: Metadata = {
  title: 'Blogs',
  description:
    'Original articles and methodology behind the prediction system. Daily picks: Football Predictions & Data-Driven Picks.',
};

export default function BlogIndexPage() {
  return (
    <BestPicksContentWithSideAdLayout>
      <div className="mx-auto w-full max-w-6xl 2xl:max-w-none">
        <div className="mb-10">
          <BestPicksSiteNav variant="header" />
        </div>

        <h1 className="mb-3 text-3xl font-bold md:text-4xl">Blogs</h1>
        <p className="mb-8 text-sm text-white/65 leading-relaxed">
          Original articles and methodology behind the prediction system. Daily picks are available{' '}
          <HubFootballLink
            href="/football-predictions"
            className="text-amber-200/85 underline underline-offset-2 hover:text-amber-50/95"
          >
            here
          </HubFootballLink>
          .
        </p>

        <BlogIndexClient />

        <footer className="mt-12 space-y-4 border-t border-white/10 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <AdSenseAutoPlaceholder orientation="horizontal" className="w-full min-h-[90px]" />
          <p className="max-w-[min(100%,42rem)] text-left text-[11px] leading-relaxed text-white/75 md:text-xs">
            <HubFootballLink href="/football-predictions/privacy" className="underline hover:text-white/70 underline-offset-2">
              Privacy policies
            </HubFootballLink>
            <span className="text-white/25"> · </span>
            Google ads may appear on this page; the privacy policies cover cookies, ads, and app-specific links.
          </p>
        </footer>
      </div>
    </BestPicksContentWithSideAdLayout>
  );
}
