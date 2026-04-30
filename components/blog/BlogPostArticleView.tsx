import Link from 'next/link';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { MarkdownBody } from '@/components/blog/MarkdownBody';
import { splitBlogMarkdownForAdPlaceholders } from '@/lib/blog-body-ad-slots';
import { resolveBlogCategoryLabel } from '@/lib/blog-category';
import type { BlogPostRecord } from '@/lib/blog-post';
import { blogTextFontFamily } from '@/lib/fonts';

type Props = {
  post: BlogPostRecord;
  /** Default: link back to public blog index */
  backHref?: string;
  backLabel?: string;
  /** Slug → label from RTDB `blogCategories`; omit to show title-cased slug only when needed */
  categoryLabels?: Record<string, string>;
};

export function BlogPostArticleView({
  post,
  backHref = '/blog',
  backLabel = '← All posts',
  categoryLabels = {},
}: Props) {
  const bodySegments = splitBlogMarkdownForAdPlaceholders(post.bodyMarkdown);
  const categoryLine = resolveBlogCategoryLabel(post.categorySlug, categoryLabels);

  return (
    <article style={{ fontFamily: blogTextFontFamily }}>
      <Link
        href={backHref}
        className="text-sm text-white/60 hover:text-white underline-offset-2 mb-6 inline-block"
      >
        {backLabel}
      </Link>
      {post.headerImageUrl ? (
        <div className="mb-6 rounded-xl overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.headerImageUrl} alt="" className="w-full max-h-[min(420px,50vh)] object-cover" />
        </div>
      ) : null}
      <header className="mb-8">
        {categoryLine ? (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-200/90 mb-3">{categoryLine}</p>
        ) : null}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{post.title}</h1>
        <p className="text-xs text-white/70 tabular-nums">
          {post.publishedAt?.slice(0, 10) ?? post.updatedAt.slice(0, 10)}
        </p>
      </header>
      {bodySegments.map((seg, i) => {
        if (seg.type === 'markdown') {
          return <MarkdownBody key={`md-${i}`} markdown={seg.markdown} />;
        }
        return (
          <div
            key={`ad-${i}`}
            className="my-8 w-full"
          >
            <AdSenseAutoPlaceholder
              orientation="horizontal"
              className="w-full min-h-[90px] !border-white/30 !bg-zinc-900/50 !text-white/70"
            />
          </div>
        );
      })}
    </article>
  );
}
