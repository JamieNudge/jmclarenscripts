'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { mergeAnotherThingPostLists, type AnotherThingPost } from '@/lib/and-another-thing';
import { AND_ANOTHER_THING_PATH, AND_ANOTHER_THING_TITLE } from '@/lib/football-predictions-brand';

const shellCls =
  'rounded-2xl border border-zinc-600/50 bg-zinc-950/95 ring-1 ring-white/[0.06] flex flex-col min-w-0 overflow-hidden';

type Props = {
  initialPosts: AnotherThingPost[];
  /** Square tile beside blog rail (2xl+); matches column width `w-56`. */
  variant: 'sidebar' | 'gridCompact';
};

export function AndAnotherThingHubPreview({ initialPosts, variant }: Props) {
  const [posts, setPosts] = useState<AnotherThingPost[]>(initialPosts);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/and-another-thing-live?v=2&t=${Date.now()}`, { cache: 'no-store' });
      const j = (await res.json()) as { posts?: AnotherThingPost[] };
      if (!res.ok) return;
      setPosts((prev) =>
        mergeAnotherThingPostLists(prev.length > 0 ? prev : initialPosts, j.posts ?? []),
      );
    } catch {
      // keep last good data
    }
  }, [initialPosts]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [load]);

  const latest = posts[0] ?? null;

  const frameClassName =
    variant === 'sidebar'
      ? `${shellCls} w-full aspect-square`
      : `${shellCls} w-full max-h-56`;

  return (
    <aside
      className={frameClassName}
      aria-label={AND_ANOTHER_THING_TITLE}
    >
      <div className="flex shrink-0 items-baseline justify-between gap-2 border-b border-white/10 px-3 py-2.5">
        <h2 className="text-sm font-semibold text-white/95 tracking-tight line-clamp-1">{AND_ANOTHER_THING_TITLE}</h2>
        <Link
          href={AND_ANOTHER_THING_PATH}
          className="shrink-0 text-[11px] text-amber-200/85 hover:text-amber-100 underline-offset-2"
        >
          Open
        </Link>
      </div>
      <div
        className={
          variant === 'sidebar' ? 'min-h-0 flex-1 overflow-y-auto p-2.5' : 'min-h-0 flex-1 overflow-y-auto p-3'
        }
      >
        {!latest ? (
          <p className="text-xs text-white/60 leading-snug">No posts yet.</p>
        ) : (
          <Link
            href={AND_ANOTHER_THING_PATH}
            className="group block h-full min-h-0 rounded-xl border border-zinc-200 bg-white p-2.5 text-left text-zinc-900 shadow-sm shadow-black/10 transition-colors hover:border-amber-200/50 hover:shadow-md"
          >
            {latest.imageUrl ? (
              <div className="mb-2 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 aspect-[16/9] max-h-[72px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={latest.imageUrl}
                  alt=""
                  className="h-full w-full object-cover group-hover:opacity-95"
                />
              </div>
            ) : null}
            <p className="text-xs font-semibold leading-snug line-clamp-3 group-hover:text-zinc-950">
              {latest.text}
            </p>
            <p className="mt-2 text-[10px] text-zinc-500 tabular-nums">
              {new Date(latest.createdAt).toLocaleString('en-GB', {
                timeZone: 'UTC',
                dateStyle: 'medium',
                timeStyle: 'short',
              })}{' '}
              (UTC)
            </p>
          </Link>
        )}
      </div>
    </aside>
  );
}
