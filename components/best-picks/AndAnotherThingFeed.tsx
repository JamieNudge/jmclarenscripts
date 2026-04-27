'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AnotherThingPost } from '@/lib/and-another-thing';

type Props = {
  /**
   * When set (e.g. from a Server Component), first paint comes from RTDB on the server.
   * We skip the initial client `fetch` so a cached/stale **API** response cannot overwrite good data.
   * Refetch still runs when the tab becomes visible.
   */
  initialPosts?: AnotherThingPost[];
};

export function AndAnotherThingFeed({ initialPosts }: Props) {
  const [posts, setPosts] = useState<AnotherThingPost[] | null>(
    initialPosts !== undefined ? initialPosts : null,
  );
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const res = await fetch(`/api/and-another-thing-live?v=2&t=${Date.now()}`, { cache: 'no-store' });
      const j = (await res.json()) as { posts?: AnotherThingPost[]; error?: string };
      if (!res.ok) {
        setErr(j.error || 'Could not load.');
        setPosts((prev) => (prev && prev.length > 0 ? prev : []));
        return;
      }
      setPosts(j.posts ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load.');
      setPosts((prev) => (prev && prev.length > 0 ? prev : []));
    }
  }, []);

  useEffect(() => {
    if (initialPosts === undefined) {
      void load();
    }
  }, [initialPosts, load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [load]);

  if (posts === null) {
    return <p className="text-sm text-white/60">Loading…</p>;
  }

  if (err && posts.length === 0) {
    return (
      <p className="text-sm text-amber-200/90" role="alert">
        {err}
      </p>
    );
  }

  if (posts.length === 0) {
    return <p className="text-sm text-white/70">No posts yet — check back soon.</p>;
  }

  return (
    <div className="space-y-4 min-w-0">
      {err ? (
        <p className="text-xs text-amber-200/85" role="status">
          {err} (showing last loaded posts.)
        </p>
      ) : null}
      <ul className="space-y-5 min-w-0">
      {posts.map((p) => (
        <li
          key={p.id}
          className="rounded-2xl border border-zinc-600/50 bg-zinc-950/80 px-4 py-4 sm:px-5 sm:py-5"
        >
          {p.imageUrl ? (
            <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} alt="" className="w-full max-h-[min(50vh,28rem)] object-contain bg-black/40" />
            </div>
          ) : null}
          <p className="text-sm sm:text-base text-white/92 leading-relaxed whitespace-pre-wrap break-words">
            {p.text}
          </p>
          <p className="mt-3 text-[11px] text-white/50 tabular-nums">
            {new Date(p.createdAt).toLocaleString('en-GB', {
              timeZone: 'UTC',
              dateStyle: 'medium',
              timeStyle: 'short',
            })}{' '}
            (UTC)
          </p>
        </li>
      ))}
      </ul>
    </div>
  );
}
