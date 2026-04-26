'use client';

import Link from 'next/link';
import { usePublishedBlogPosts } from '@/hooks/usePublishedBlogPosts';
import { blogTextFontFamily } from '@/lib/fonts';

export function BlogIndexClient() {
  const { posts, loading, err, configured } = usePublishedBlogPosts();

  if (!configured) {
    return (
      <p className="text-sm text-white/80 leading-relaxed">
        Firebase is not configured — add keys in <code className="text-xs text-white/70">.env.local</code> to load
        posts here.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-white/78">Loading posts…</p>;
  }

  if (err) {
    return (
      <p className="text-sm text-red-300/90 leading-relaxed" role="alert">
        {err}
      </p>
    );
  }

  if (posts.length === 0) {
    return <p className="text-sm text-white/72 italic">No posts yet — check back soon.</p>;
  }

  return (
    <ul className="space-y-6" style={{ fontFamily: blogTextFontFamily }}>
      {posts.map((p) => (
        <li key={p.slug} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
          <Link href={`/blog/${p.slug}`} className="group block">
            {p.headerImageUrl ? (
              <div className="mb-3 rounded-xl overflow-hidden border border-white/10 aspect-[16/9] max-h-[min(220px,40vh)] bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.headerImageUrl}
                  alt=""
                  className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                />
              </div>
            ) : null}
            <h2 className="text-xl font-semibold text-white group-hover:text-amber-100/95 transition-colors">
              {p.title}
            </h2>
            {p.excerpt ? <p className="text-sm text-white/75 mt-2 leading-relaxed">{p.excerpt}</p> : null}
            <p className="text-xs text-white/65 mt-2 tabular-nums">
              {(p.publishedAt ?? p.updatedAt).slice(0, 10)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
