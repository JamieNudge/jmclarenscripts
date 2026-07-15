'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { get, ref } from 'firebase/database';
import {
  BLOG_POSTS_RTDB_ROOT,
  parseBlogPostFromRtdb,
  type BlogPostRecord,
} from '@/lib/blog-post';
import { BlogPostArticleView } from '@/components/blog/BlogPostArticleView';
import { usePublishedBlogCategories } from '@/hooks/usePublishedBlogCategories';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

export function BlogPostClient({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<BlogPostRecord | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { labelBySlug } = usePublishedBlogCategories();

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setLoading(false);
      setPost(null);
      setErr(null);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setLoading(false);
      setPost(null);
      return;
    }
    setLoading(true);
    setErr(null);
    let cancelled = false;
    void (async () => {
      try {
        const snap = await get(ref(db, `${BLOG_POSTS_RTDB_ROOT}/${slug}`));
        if (cancelled) return;
        const p = parseBlogPostFromRtdb(snap.val());
        if (!p || !p.published) {
          setPost(null);
          setErr(null);
        } else {
          setPost(p);
          setErr(null);
          if (typeof document !== 'undefined') {
            document.title = `${p.title} — Blogs`;
          }
        }
      } catch (e) {
        if (!cancelled) {
          setPost(null);
          setErr(e instanceof Error ? e.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!isFirebaseClientConfigured()) {
    return (
      <p className="text-sm text-[var(--hub-text-muted)]">
        Firebase is not configured — this post cannot be loaded here.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-[var(--hub-text-muted)]">Loading…</p>;
  }

  if (err) {
    return (
      <p className="text-sm text-red-300/90" role="alert">
        {err}
      </p>
    );
  }

  if (!post) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--hub-text-muted)]">This post is not available or is still a draft.</p>
        <p className="text-xs text-[var(--hub-text-muted)] leading-relaxed max-w-xl">
          To preview a <strong className="text-[var(--hub-text-muted)]">draft</strong> before publishing, open{' '}
          <Link href="/admin/picks" className="text-amber-200/85 underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]">
            Admin picks
          </Link>
          , paste your admin key, find the post in the list, and use <strong className="text-[var(--hub-text-muted)]">Preview</strong>{' '}
          (opens <code className="text-[11px] text-[var(--hub-text-muted)]">/admin/blog-preview/…</code>).
        </p>
        <Link href="/blog" className="text-sm text-amber-200/85 underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]">
          ← Back to blogs
        </Link>
      </div>
    );
  }

  return <BlogPostArticleView post={post} categoryLabels={labelBySlug} />;
}
