'use client';

import { useEffect, useState } from 'react';

export type PublishedBlogCategoriesState = {
  /** display label for each category slug; empty if none loaded */
  labelBySlug: Record<string, string>;
  loading: boolean;
  err: string | null;
  configured: boolean;
};

/** Category labels via cached API — never the `blogCategories` RTDB root. */
export function usePublishedBlogCategories(): PublishedBlogCategoriesState {
  const [labelBySlug, setLabelBySlug] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/blog/categories');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { labelBySlug?: Record<string, string> };
        if (cancelled) return;
        setLabelBySlug(json.labelBySlug && typeof json.labelBySlug === 'object' ? json.labelBySlug : {});
        setErr(null);
      } catch (e) {
        if (cancelled) return;
        setLabelBySlug({});
        setErr(e instanceof Error ? e.message : 'Failed to load blog categories');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    labelBySlug,
    loading,
    err,
    configured: true,
  };
}
