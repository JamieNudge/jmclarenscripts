'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { BlogPostRecord } from '@/lib/blog-post';

type Props = {
  adminKey: string;
};

function authHeader(key: string): HeadersInit {
  return { Authorization: `Bearer ${key.trim()}` };
}

const inputCls =
  'w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60';

export function AdminBlogSection({ adminKey }: Props) {
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [blogStatus, setBlogStatus] = useState<string | null>(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [published, setPublished] = useState(false);
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [bodyMarkdown, setBodyMarkdown] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const canUse = adminKey.trim().length > 0;

  const loadList = useCallback(async () => {
    if (!canUse) {
      setBlogStatus('Paste your admin key first.');
      return;
    }
    setBlogLoading(true);
    setBlogStatus(null);
    try {
      const res = await fetch('/api/admin/blog-posts', { headers: authHeader(adminKey) });
      const json = (await res.json()) as { posts?: BlogPostRecord[]; error?: string };
      if (!res.ok) {
        setBlogStatus(json.error || res.statusText);
        return;
      }
      setPosts(json.posts ?? []);
      setBlogStatus(`Loaded ${json.posts?.length ?? 0} post(s).`);
    } catch (e) {
      setBlogStatus(e instanceof Error ? e.message : 'Blog list failed');
    } finally {
      setBlogLoading(false);
    }
  }, [adminKey, canUse]);

  useEffect(() => {
    if (canUse) void loadList();
  }, [canUse, loadList]);

  const resetForm = () => {
    setEditingSlug(null);
    setSlug('');
    setTitle('');
    setExcerpt('');
    setPublished(false);
    setHeaderImageUrl('');
    setBodyMarkdown('');
  };

  const loadOne = async (s: string) => {
    if (!canUse) return;
    setBlogLoading(true);
    setBlogStatus(null);
    try {
      const res = await fetch(`/api/admin/blog-posts?slug=${encodeURIComponent(s)}`, {
        headers: authHeader(adminKey),
      });
      const json = (await res.json()) as { post?: BlogPostRecord; error?: string };
      if (!res.ok) {
        setBlogStatus(json.error || res.statusText);
        return;
      }
      const p = json.post;
      if (!p) {
        setBlogStatus('Empty response');
        return;
      }
      setEditingSlug(p.slug);
      setSlug(p.slug);
      setTitle(p.title);
      setExcerpt(p.excerpt);
      setPublished(p.published);
      setHeaderImageUrl(p.headerImageUrl ?? '');
      setBodyMarkdown(p.bodyMarkdown);
      setBlogStatus(`Editing “${p.title}”.`);
    } catch (e) {
      setBlogStatus(e instanceof Error ? e.message : 'Load post failed');
    } finally {
      setBlogLoading(false);
    }
  };

  const savePost = async () => {
    if (!canUse) {
      setBlogStatus('Paste your admin key first.');
      return;
    }
    const slugTrim = slug.trim().toLowerCase();
    if (!slugTrim) {
      setBlogStatus('Slug is required (lowercase, hyphens).');
      return;
    }
    if (!title.trim()) {
      setBlogStatus('Title is required.');
      return;
    }

    setBlogLoading(true);
    setBlogStatus(null);
    try {
      const payload = {
        slug: slugTrim,
        title: title.trim(),
        excerpt: excerpt.trim(),
        published,
        headerImageUrl: headerImageUrl.trim() || null,
        bodyMarkdown,
      };

      const isUpdate = editingSlug != null;
      const res = await fetch(
        isUpdate ? `/api/admin/blog-posts?slug=${encodeURIComponent(editingSlug)}` : '/api/admin/blog-posts',
        {
          method: isUpdate ? 'PATCH' : 'POST',
          headers: { ...authHeader(adminKey), 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const json = (await res.json()) as { error?: string; post?: BlogPostRecord; path?: string };
      if (!res.ok) {
        setBlogStatus(json.error || res.statusText);
        return;
      }
      setEditingSlug(json.post?.slug ?? slugTrim);
      setSlug(json.post?.slug ?? slugTrim);
      setBlogStatus(`Saved — ${json.path ?? 'blogPosts'}.`);
      await loadList();
    } catch (e) {
      setBlogStatus(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBlogLoading(false);
    }
  };

  const deletePost = async (s: string) => {
    if (!canUse) return;
    if (!confirm(`Delete post “${s}”? This cannot be undone.`)) return;
    setBlogLoading(true);
    setBlogStatus(null);
    try {
      const res = await fetch(`/api/admin/blog-posts?slug=${encodeURIComponent(s)}`, {
        method: 'DELETE',
        headers: authHeader(adminKey),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setBlogStatus(json.error || res.statusText);
        return;
      }
      if (editingSlug === s) resetForm();
      setBlogStatus('Deleted.');
      await loadList();
    } catch (e) {
      setBlogStatus(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBlogLoading(false);
    }
  };

  const uploadImage = async (which: 'header' | 'body') => {
    if (!canUse) {
      setBlogStatus('Paste your admin key first.');
      return;
    }
    const slugForPath = (editingSlug ?? slug).trim().toLowerCase();
    if (!slugForPath) {
      setBlogStatus('Set slug (save draft with POST first, or type slug) before uploading images.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBlogLoading(true);
      setBlogStatus(null);
      try {
        const fd = new FormData();
        fd.set('slug', slugForPath);
        fd.set('file', file);
        fd.set('field', which);
        const res = await fetch('/api/admin/blog-media', {
          method: 'POST',
          headers: authHeader(adminKey),
          body: fd,
        });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) {
          setBlogStatus(json.error || res.statusText);
          return;
        }
        const url = json.url;
        if (!url) {
          setBlogStatus('No URL returned');
          return;
        }
        if (which === 'header') {
          setHeaderImageUrl(url);
          setBlogStatus('Header image uploaded — URL filled in.');
        } else {
          const alt = file.name.replace(/\.[^.]+$/, '') || 'Image';
          const snippet = `![${alt}](${url})\n`;
          const ta = bodyRef.current;
          if (ta) {
            const start = ta.selectionStart ?? ta.value.length;
            const end = ta.selectionEnd ?? ta.value.length;
            const v = ta.value;
            const next = v.slice(0, start) + snippet + v.slice(end);
            setBodyMarkdown(next);
            requestAnimationFrame(() => {
              ta.focus();
              const pos = start + snippet.length;
              ta.selectionStart = ta.selectionEnd = pos;
            });
          } else {
            setBodyMarkdown((prev) => `${prev}${snippet}`);
          }
          setBlogStatus('Image markdown inserted into body.');
        }
      } catch (e) {
        setBlogStatus(e instanceof Error ? e.message : 'Upload failed');
      } finally {
        setBlogLoading(false);
      }
    };
    input.click();
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
      <h2 className="text-lg font-semibold">5. Blog posts</h2>
      <p className="text-xs text-white/50 leading-relaxed">
        Posts live in Realtime Database at <code className="text-white/70">blogPosts/&#123;slug&#125;</code>. Images go
        to Storage under <code className="text-white/70">blog/&#123;slug&#125;/…</code>. Same Bearer key as manual
        picks. Enable Storage and rules (see <code className="text-white/70">lib/blog-post.ts</code> comments).
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canUse || blogLoading}
          onClick={() => void loadList()}
          className="rounded-lg bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Refresh list
        </button>
        <button
          type="button"
          disabled={!canUse || blogLoading}
          onClick={resetForm}
          className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          New post
        </button>
      </div>

      {posts.length > 0 ? (
        <ul className="space-y-2 text-sm max-h-48 overflow-y-auto border border-white/10 rounded-lg p-2">
          {posts.map((p) => (
            <li
              key={p.slug}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-black/25 px-2 py-1.5"
            >
              <span className="min-w-0 truncate">
                <span className="text-white/80 font-medium">{p.title}</span>{' '}
                <code className="text-xs text-white/45">{p.slug}</code>{' '}
                {p.published ? (
                  <span className="text-emerald-300/90 text-xs">published</span>
                ) : (
                  <span className="text-white/40 text-xs">draft</span>
                )}
              </span>
              <span className="flex gap-2 shrink-0">
                <button type="button" className="text-cyan-300 text-xs hover:underline" onClick={() => void loadOne(p.slug)}>
                  Edit
                </button>
                <Link href={`/blog/${p.slug}`} className="text-amber-200/80 text-xs hover:underline" target="_blank" rel="noopener noreferrer">
                  View
                </Link>
                <button type="button" className="text-red-300 text-xs hover:underline" onClick={() => void deletePost(p.slug)}>
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-white/45">No posts yet — create one below.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/45">Slug (URL)</label>
          <input
            className={`${inputCls} mt-1`}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="my-first-post"
            disabled={editingSlug != null}
            title={editingSlug ? 'Slug cannot change while editing; use New post' : undefined}
          />
          {editingSlug ? <p className="text-[10px] text-white/35 mt-1">Slug is fixed while editing. New post to pick a new slug.</p> : null}
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-white/30"
            />
            Published (visible on /blog)
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs text-white/45">Title</label>
        <input className={`${inputCls} mt-1`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
      </div>
      <div>
        <label className="text-xs text-white/45">Excerpt (list view)</label>
        <textarea className={`${inputCls} mt-1 min-h-[4rem]`} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary" />
      </div>

      <div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-0">
            <label className="text-xs text-white/45">Header image URL (optional)</label>
            <input
              className={`${inputCls} mt-1`}
              value={headerImageUrl}
              onChange={(e) => setHeaderImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <button
            type="button"
            disabled={!canUse || blogLoading}
            onClick={() => void uploadImage('header')}
            className="rounded-lg bg-violet-600/80 hover:bg-violet-600 px-3 py-2 text-xs font-medium disabled:opacity-50 shrink-0"
          >
            Upload header image
          </button>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <label className="text-xs text-white/45">Body (Markdown)</label>
          <button
            type="button"
            disabled={!canUse || blogLoading}
            onClick={() => void uploadImage('body')}
            className="rounded-lg bg-violet-600/80 hover:bg-violet-600 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            Upload image → insert markdown
          </button>
        </div>
        <textarea
          ref={bodyRef}
          className={`${inputCls} min-h-[12rem] font-mono text-xs`}
          value={bodyMarkdown}
          onChange={(e) => setBodyMarkdown(e.target.value)}
          placeholder="Write in Markdown…"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canUse || blogLoading}
          onClick={() => void savePost()}
          className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {editingSlug ? 'Update post' : 'Create post'}
        </button>
      </div>

      {blogStatus ? (
        <p className="text-xs text-amber-100/90 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2" role="status">
          {blogStatus}
        </p>
      ) : null}
    </section>
  );
}
