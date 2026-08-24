import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GoalLabV2Shell } from '@/components/goallab/v2/GoalLabV2Shell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BlogPostArticleView } from '@/components/blog/BlogPostArticleView';
import { categoryLabelBySlug, getPublishedPost } from '@/lib/blog-server';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

export const revalidate = 86400;
export const runtime = 'nodejs';

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPublishedPost(params.slug ?? '');
  if (!post) {
    return { title: `Insights — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}` };
  }
  return {
    title: `${post.title} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
    description: post.excerpt.trim() || 'Article from GoalLab Insights.',
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const slug = params.slug?.trim() ?? '';
  const [post, labelBySlug] = await Promise.all([getPublishedPost(slug), categoryLabelBySlug()]);
  if (!post) notFound();

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
          <BlogPostArticleView post={post} categoryLabels={labelBySlug} />
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
