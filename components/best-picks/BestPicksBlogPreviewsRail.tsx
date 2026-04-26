'use client';

import Link from 'next/link';
import { usePublishedBlogPosts } from '@/hooks/usePublishedBlogPosts';
import { blogTextFontFamily } from '@/lib/fonts';

const MAX_CARDS = 5;
const EXCERPT_CHARS = 120;

function clip(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Narrow column of recent published blog posts for very wide viewports (e.g. full-screen Mac). */
export function BestPicksBlogPreviewsRail() {
  const { posts, loading, err, configured } = usePublishedBlogPosts();
  const slice = posts.slice(0, MAX_CARDS);

  if (!configured) {
    return null;
  }

  return (
    <aside
      className="rounded-2xl border border-zinc-600/50 bg-zinc-950/95 ring-1 ring-white/[0.06] p-4 space-y-3 2xl:sticky 2xl:top-24"
      style={{ fontFamily: blogTextFontFamily }}
      aria-label="Recent blog posts"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-white/95 tracking-tight">From the blog</h2>
        <Link href="/blog" className="text-[11px] text-amber-200/85 hover:text-amber-100 underline-offset-2 shrink-0">
          All →
        </Link>
      </div>

      {loading ? (
        <p className="text-xs text-white/70">Loading…</p>
      ) : err ? (
        <p className="text-xs text-red-300/80 leading-snug" role="alert">
          {err}
        </p>
      ) : slice.length === 0 ? (
        <p className="text-xs text-white/70 leading-snug">No published posts yet.</p>
      ) : (
        <ul className="space-y-3">
          {slice.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${encodeURIComponent(p.slug)}`}
                className="group block rounded-xl border border-white/15 bg-zinc-900/70 p-3 hover:border-amber-200/35 hover:bg-zinc-800/70 transition-colors"
              >
                {p.headerImageUrl ? (
                  <div className="mb-2.5 rounded-lg overflow-hidden border border-white/10 aspect-[16/9] max-h-[88px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.headerImageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                    />
                  </div>
                ) : null}
                <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-amber-100/95 transition-colors line-clamp-2">
                  {p.title}
                </h3>
                {p.excerpt ? (
                  <p className="text-[11px] text-white/72 mt-1.5 leading-relaxed line-clamp-2">{clip(p.excerpt, EXCERPT_CHARS)}</p>
                ) : null}
                <p className="text-[10px] text-white/60 mt-2 tabular-nums">{(p.publishedAt ?? p.updatedAt).slice(0, 10)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
