'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
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

/** Live list of published posts from RTDB `blogPosts`, newest first. */
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
    const r = ref(db, BLOG_POSTS_RTDB_ROOT);
    const unsub = onValue(
      r,
      (snap) => {
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
      },
      (e) => {
        setLoading(false);
        setErr(e.message);
      },
    );
    return () => unsub();
  }, []);

  return {
    posts,
    loading,
    err,
    configured: isFirebaseClientConfigured(),
  };
}
