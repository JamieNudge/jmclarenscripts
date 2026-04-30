'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import {
  BLOG_CATEGORIES_RTDB_ROOT,
  parseBlogCategoryFromRtdb,
  sortBlogCategories,
  type BlogCategoryRecord,
} from '@/lib/blog-category';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

export type PublishedBlogCategoriesState = {
  /** display label for each category slug; empty if none loaded */
  labelBySlug: Record<string, string>;
  loading: boolean;
  err: string | null;
  configured: boolean;
};

/** Live map of blog category slugs → labels from RTDB `blogCategories` (public read). */
export function usePublishedBlogCategories(): PublishedBlogCategoriesState {
  const [list, setList] = useState<BlogCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setLoading(false);
      setErr(null);
      setList([]);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setLoading(false);
      return;
    }
    const r = ref(db, BLOG_CATEGORIES_RTDB_ROOT);
    const unsub = onValue(
      r,
      (snap) => {
        setLoading(false);
        setErr(null);
        const v = snap.val();
        const cats: Parameters<typeof sortBlogCategories>[0] = [];
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          for (const k of Object.keys(v)) {
            const c = parseBlogCategoryFromRtdb(k, v[k]);
            if (c) cats.push(c);
          }
        }
        setList(sortBlogCategories(cats));
      },
      (e) => {
        setLoading(false);
        setErr(e.message);
      },
    );
    return () => unsub();
  }, []);

  const labelBySlug = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of list) {
      m[c.slug] = c.label;
    }
    return m;
  }, [list]);

  return {
    labelBySlug,
    loading,
    err,
    configured: isFirebaseClientConfigured(),
  };
}
