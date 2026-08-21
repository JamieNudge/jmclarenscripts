'use client';

import { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import {
  BLOG_POSTS_RTDB_ROOT,
  parseBlogPostFromRtdb,
  type BlogPostRecord,
} from '@/lib/blog-post';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

export type PublishedBlogPostsState = {
  posts: BlogPostRecord[];
  loading: boolean;
  err: string | null;
  configured: boolean;
};

/** Snapshot list of published posts from RTDB `blogPosts`, newest first. */
export function usePublishedBlogPosts(): PublishedBlogPostsState {
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setLoading(false);
      setErr(null);
      setPosts([]);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void get(ref(db, BLOG_POSTS_RTDB_ROOT))
      .then((snap) => {
        if (cancelled) return;
        setLoading(false);
        setErr(null);
        const v = snap.val();
        const list: BlogPostRecord[] = [];
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          for (const k of Object.keys(v)) {
            const p = parseBlogPostFromRtdb(v[k]);
            if (p && p.published) list.push(p);
          }
        }
        list.sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt));
        setPosts(list);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLoading(false);
        setErr(e instanceof Error ? e.message : 'Failed to load blog posts');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    posts,
    loading,
    err,
    configured: isFirebaseClientConfigured(),
  };
}
