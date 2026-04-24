'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { BlogPostRecord } from '@/lib/blog-post';
import { BlogPostArticleView } from '@/components/blog/BlogPostArticleView';

/** Same key as `app/admin/picks/page.tsx` so “remember key” pre-fills preview. */
const ADMIN_BEARER_STORAGE_KEY = 'bestpicks_admin_bearer';

function authHeader(key: string): HeadersInit {
  return { Authorization: `Bearer ${key.trim()}` };
}

export default function AdminBlogPreviewSlugPage() {
  const params = useParams();
  const slug = useMemo(() => {
    const raw = params?.slug;
    if (typeof raw === 'string') return raw.trim();
    if (Array.isArray(raw) && raw[0]) return String(raw[0]).trim();
    return '';
  }, [params]);

  const [adminKey, setAdminKey] = useState('');
  const [post, setPost] = useState<BlogPostRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(ADMIN_BEARER_STORAGE_KEY);
      if (s) setAdminKey(s);
    } catch {
      /* ignore */
    }
  }, []);

  const loadPreview = useCallback(async (keyOverride?: string) => {
    if (!slug) {
      setErr('Missing slug');
      return;
    }
    const key = (keyOverride ?? adminKey).trim();
    if (!key) {
      setErr('Paste your admin key (same as predictions admin).');
      return;
    }
    setLoading(true);
    setErr(null);
    setPost(null);
    try {
      const res = await fetch(`/api/admin/blog-posts?slug=${encodeURIComponent(slug)}`, {
        headers: authHeader(key),
      });
      const json = (await res.json()) as { post?: BlogPostRecord; error?: string };
      if (!res.ok) {
        setErr(json.error || res.statusText);
        return;
      }
      const p = json.post;
      if (!p) {
        setErr('Empty response');
        return;
      }
      setPost(p);
      if (typeof document !== 'undefined') {
        document.title = `${p.title} — Preview`;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [adminKey, slug]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <nav aria-label="Site" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/80 mb-8">
          <Link href="/admin/picks" className="hover:text-white underline-offset-4 hover:underline">
            ← Admin picks
          </Link>
          <span className="text-white/30" aria-hidden>
            ·
          </span>
          <Link href="/blog" className="hover:text-white underline-offset-4 hover:underline">
            Public blog
          </Link>
        </nav>

        <div className="rounded-xl border border-white/15 bg-black/30 p-4 mb-8 space-y-3">
          <p className="text-xs text-white/55 leading-relaxed">
            This page is for <strong className="text-white/80">draft and published</strong> previews. It uses your
            admin Bearer token; it is not indexed for search engines.
          </p>
          <label className="block text-xs text-white/45">Admin key (predictions / blog API)</label>
          <input
            type="password"
            autoComplete="off"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Paste ADMIN_MANUAL_PICKS_KEY"
            className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          />
          <button
            type="button"
            disabled={loading || !slug}
            onClick={() => void loadPreview()}
            className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load preview'}
          </button>
        </div>

        {err ? (
          <p className="text-sm text-red-300/90 mb-6" role="alert">
            {err}
          </p>
        ) : null}

        {post ? (
          <div className="space-y-6">
            {!post.published ? (
              <div
                className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-50/95"
                role="status"
              >
                <strong>Draft</strong> — not listed on the public blog until you check &quot;Published&quot; and save.
              </div>
            ) : (
              <div
                className="rounded-lg border border-emerald-400/35 bg-emerald-600/15 px-4 py-3 text-sm text-emerald-50/95"
                role="status"
              >
                <strong>Published</strong> — matches what readers see at{' '}
                <Link href={`/blog/${slug}`} className="underline underline-offset-2 hover:text-white">
                  /blog/{slug}
                </Link>
                .
              </div>
            )}
            <BlogPostArticleView post={post} backHref="/admin/picks" backLabel="← Admin picks" />
          </div>
        ) : null}
      </div>
    </main>
  );
}
