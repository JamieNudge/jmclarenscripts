import type { Metadata } from 'next';
import { GoalLabV2Shell } from '@/components/goallab/v2/GoalLabV2Shell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BlogPostClient } from '@/components/blog/BlogPostClient';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

export const metadata: Metadata = {
  title: `Insights — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
  description: 'Article from GoalLab Insights.',
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.trim() ?? '';
  return (
    <GoalLabV2Shell>
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14 space-y-8">
        <div>
          <HubFootballLink
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[var(--gl-text-muted)] hover:text-[var(--gl-text)] transition-colors"
          >
            <span aria-hidden>←</span> Back to Insights
          </HubFootballLink>
        </div>

        <div className="gl-v2-hub-bridge">
          <BlogPostClient slug={slug} />
        </div>

        <p className="text-[11px] leading-relaxed text-[var(--gl-text-muted)] border-t border-[var(--gl-border)] pt-6">
          <HubFootballLink
            href="/football-predictions/privacy"
            className="underline underline-offset-2 hover:text-[var(--gl-text-soft)]"
          >
            Privacy policies
          </HubFootballLink>
          <span> · </span>
          Informational content only.
        </p>
      </div>
    </GoalLabV2Shell>
  );
}
