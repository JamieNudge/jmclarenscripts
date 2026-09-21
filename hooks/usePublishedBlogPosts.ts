'use client';

import { useEffect, useState } from 'react';
import type { BlogPostPreview } from '@/lib/blog-post';

export type PublishedBlogPostsState = {
  posts: BlogPostPreview[];
  loading: boolean;
  err: string | null;
  configured: boolean;
};

/** Published post summaries via cached API — never the full `blogPosts` RTDB root. */
export function usePublishedBlogPosts(): PublishedBlogPostsState {
  const [posts, setPosts] = useState<BlogPostPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/blog/previews');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { posts?: BlogPostPreview[] };
        if (cancelled) return;
        setPosts(Array.isArray(json.posts) ? json.posts : []);
        setErr(null);
      } catch (e) {
        if (cancelled) return;
        setPosts([]);
        setErr(e instanceof Error ? e.message : 'Failed to load blog posts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    posts,
    loading,
    err,
    configured: true,
  };
}
