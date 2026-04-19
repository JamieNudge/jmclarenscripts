import Link from 'next/link';
import type { BlogPostRecord } from '@/lib/blog-post';
import { blogTextFontFamily } from '@/lib/fonts';
import { MarkdownBody } from '@/components/blog/MarkdownBody';

type Props = {
  post: BlogPostRecord;
  /** Default: link back to public blog index */
  backHref?: string;
  backLabel?: string;
};

export function BlogPostArticleView({ post, backHref = '/blog', backLabel = '← All posts' }: Props) {
  return (
    <article style={{ fontFamily: blogTextFontFamily }}>
      <Link
        href={backHref}
        className="text-sm text-white/60 hover:text-white underline-offset-2 mb-6 inline-block"
      >
        {backLabel}
      </Link>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{post.title}</h1>
        <p className="text-xs text-white/45 tabular-nums">
          {post.publishedAt?.slice(0, 10) ?? post.updatedAt.slice(0, 10)}
        </p>
      </header>
      {post.headerImageUrl ? (
        <div className="mb-8 rounded-xl overflow-hidden border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.headerImageUrl} alt="" className="w-full max-h-[min(420px,50vh)] object-cover" />
        </div>
      ) : null}
      <MarkdownBody markdown={post.bodyMarkdown} />
    </article>
  );
}
