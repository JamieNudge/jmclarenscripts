'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onValue, ref } from 'firebase/database';
import {
  BLOG_POSTS_RTDB_ROOT,
  parseBlogPostFromRtdb,
  type BlogPostRecord,
} from '@/lib/blog-post';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { blogTextFontFamily } from '@/lib/fonts';

export function BlogIndexClient() {
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

  if (!isFirebaseClientConfigured()) {
    return (
      <p className="text-sm text-white/55 leading-relaxed">
        Firebase is not configured — add keys in <code className="text-xs text-white/70">.env.local</code> to load
        posts here.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-white/60">Loading posts…</p>;
  }

  if (err) {
    return (
      <p className="text-sm text-red-300/90 leading-relaxed" role="alert">
        {err}
      </p>
    );
  }

  if (posts.length === 0) {
    return <p className="text-sm text-white/50 italic">No posts yet — check back soon.</p>;
  }

  return (
    <ul className="space-y-6" style={{ fontFamily: blogTextFontFamily }}>
      {posts.map((p) => (
        <li key={p.slug} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
          <Link href={`/blog/${p.slug}`} className="group block">
            <h2 className="text-xl font-semibold text-white group-hover:text-amber-100/95 transition-colors">
              {p.title}
            </h2>
            {p.excerpt ? <p className="text-sm text-white/65 mt-2 leading-relaxed">{p.excerpt}</p> : null}
            <p className="text-xs text-white/40 mt-2 tabular-nums">
              {(p.publishedAt ?? p.updatedAt).slice(0, 10)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
