'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { BlogCategoryRecord } from '@/lib/blog-category';
import type { BlogPostRecord } from '@/lib/blog-post';
import { blogMarkdownComposerFontFamily } from '@/lib/fonts';
import { suggestBlogExcerptFromMarkdown } from '@/lib/suggest-blog-excerpt';
import { BlogMarkdownToolbar } from '@/components/admin/BlogMarkdownToolbar';

type Props = {
  adminKey: string;
};

function authHeader(key: string): HeadersInit {
  return { Authorization: `Bearer ${key.trim()}` };
}

const inputCls =
  'w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60';

/** Matches {@link app/api/admin/blog-media/route.ts} client-side checks. */
const BLOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const BLOG_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function isBlogImageFile(file: File): boolean {
  if (file.type && BLOG_IMAGE_MIMES.has(file.type)) return true;
  return /\.(jpe?g|png|gif|webp)$/i.test(file.name);
}

/** Words for composer stats (whitespace-separated tokens; empty input → 0). */
function countWords(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function AdminBlogSection({ adminKey }: Props) {
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [categories, setCategories] = useState<BlogCategoryRecord[]>([]);
  const [editBySlug, setEditBySlug] = useState<Record<string, { label: string; sortOrder: string }>>({});
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatSort, setNewCatSort] = useState('');
  const [blogStatus, setBlogStatus] = useState<string | null>(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [published, setPublished] = useState(false);
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [bodyMarkdown, setBodyMarkdown] = useState('');
  /** '' = none; '__new__' = show create panel; else category slug */
  const [postCategorySelect, setPostCategorySelect] = useState('');
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  /** Latest body for async handlers (e.g. image upload) and undo/redo. */
  const bodyMarkdownRef = useRef(bodyMarkdown);
  bodyMarkdownRef.current = bodyMarkdown;

  const [bodyPast, setBodyPast] = useState<string[]>([]);
  const [bodyFuture, setBodyFuture] = useState<string[]>([]);
  const [headerImageDropOver, setHeaderImageDropOver] = useState(false);
  const [bodyImageDropOver, setBodyImageDropOver] = useState(false);

  const clearBodyHistory = useCallback(() => {
    setBodyPast([]);
    setBodyFuture([]);
  }, []);

  const pushBodySnapshot = useCallback(() => {
    setBodyPast((p) => [...p.slice(-49), bodyMarkdownRef.current]);
    setBodyFuture([]);
  }, []);

  const undoBody = useCallback(() => {
    setBodyPast((past) => {
      if (past.length === 0) return past;
      const restore = past[past.length - 1]!;
      const current = bodyMarkdownRef.current;
      setBodyFuture((f) => [current, ...f]);
      setBodyMarkdown(restore);
      return past.slice(0, -1);
    });
  }, []);

  const redoBody = useCallback(() => {
    setBodyFuture((future) => {
      if (future.length === 0) return future;
      const next = future[0]!;
      const current = bodyMarkdownRef.current;
      setBodyPast((p) => [...p, current]);
      setBodyMarkdown(next);
      return future.slice(1);
    });
  }, []);

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

  const loadCategories = useCallback(async () => {
    if (!canUse) return;
    try {
      const res = await fetch('/api/admin/blog-categories', { headers: authHeader(adminKey) });
      const json = (await res.json()) as { categories?: BlogCategoryRecord[]; error?: string };
      if (!res.ok) {
        setBlogStatus(json.error || res.statusText);
        return;
      }
      const list = json.categories ?? [];
      setCategories(list);
      const m: Record<string, { label: string; sortOrder: string }> = {};
      for (const c of list) {
        m[c.slug] = { label: c.label, sortOrder: String(c.sortOrder) };
      }
      setEditBySlug(m);
    } catch (e) {
      setBlogStatus(e instanceof Error ? e.message : 'Categories load failed');
    }
  }, [adminKey, canUse]);

  useEffect(() => {
    if (canUse) void loadList();
  }, [canUse, loadList]);

  useEffect(() => {
    if (canUse) void loadCategories();
  }, [canUse, loadCategories]);

  const resetForm = () => {
    setEditingSlug(null);
    setSlug('');
    setTitle('');
    setExcerpt('');
    setPublished(false);
    setHeaderImageUrl('');
    setBodyMarkdown('');
    setPostCategorySelect('');
    clearBodyHistory();
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
      setPostCategorySelect(p.categorySlug ?? '');
      clearBodyHistory();
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
    if (postCategorySelect === '__new__') {
      setBlogStatus('Finish creating the new category below, or pick an existing category.');
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
        categorySlug: postCategorySelect.trim() ? postCategorySelect.trim() : null,
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
      clearBodyHistory();
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

  const createCategoryFromPanel = async () => {
    if (!canUse) return;
    const label = newCatLabel.trim();
    if (!label) {
      setBlogStatus('Category label is required.');
      return;
    }
    setBlogLoading(true);
    setBlogStatus(null);
    try {
      const body: Record<string, unknown> = { label };
      if (newCatSort.trim() !== '' && !Number.isNaN(Number.parseInt(newCatSort, 10))) {
        body.sortOrder = Number.parseInt(newCatSort, 10);
      }
      if (newCatSlug.trim()) {
        body.slug = newCatSlug.trim().toLowerCase();
      }
      const res = await fetch('/api/admin/blog-categories', {
        method: 'POST',
        headers: { ...authHeader(adminKey), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { category?: BlogCategoryRecord; error?: string };
      if (!res.ok) {
        setBlogStatus(json.error || res.statusText);
        return;
      }
      const slugNew = json.category?.slug;
      setNewCatLabel('');
      setNewCatSlug('');
      setNewCatSort('');
      await loadCategories();
      if (slugNew) {
        setPostCategorySelect(slugNew);
      }
      setBlogStatus(`Category created${slugNew ? ` — ${slugNew}` : ''}.`);
    } catch (e) {
      setBlogStatus(e instanceof Error ? e.message : 'Create category failed');
    } finally {
      setBlogLoading(false);
    }
  };

  const updateCategoryRow = async (slug: string) => {
    if (!canUse) return;
    const ed = editBySlug[slug];
    if (!ed) return;
    setBlogLoading(true);
    setBlogStatus(null);
    try {
      const sortOrder = Number.parseInt(ed.sortOrder, 10);
      const res = await fetch(`/api/admin/blog-categories?slug=${encodeURIComponent(slug)}`, {
        method: 'PATCH',
        headers: { ...authHeader(adminKey), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: ed.label.trim(),
          sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setBlogStatus(json.error || res.statusText);
        return;
      }
      await loadCategories();
      setBlogStatus(`Updated category “${slug}”.`);
    } catch (e) {
      setBlogStatus(e instanceof Error ? e.message : 'Update category failed');
    } finally {
      setBlogLoading(false);
    }
  };

  const deleteCategoryRow = async (slug: string) => {
    if (!canUse) return;
    if (!confirm(`Delete category “${slug}”? Posts must not use it.`)) return;
    setBlogLoading(true);
    setBlogStatus(null);
    try {
      const res = await fetch(`/api/admin/blog-categories?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: authHeader(adminKey),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setBlogStatus(json.error || res.statusText);
        return;
      }
      if (postCategorySelect === slug) setPostCategorySelect('');
      await loadCategories();
      setBlogStatus('Category deleted.');
    } catch (e) {
      setBlogStatus(e instanceof Error ? e.message : 'Delete category failed');
    } finally {
      setBlogLoading(false);
    }
  };

  const processImageFile = useCallback(
    async (file: File, which: 'header' | 'body') => {
      if (!canUse) {
        setBlogStatus('Paste your admin key first.');
        return;
      }
      const slugForPath = (editingSlug ?? slug).trim().toLowerCase();
      if (!slugForPath) {
        setBlogStatus('Set slug (save draft with POST first, or type slug) before uploading images.');
        return;
      }
      if (!isBlogImageFile(file)) {
        setBlogStatus('Use a JPEG, PNG, WebP, or GIF image.');
        return;
      }
      if (file.size > BLOG_IMAGE_MAX_BYTES) {
        setBlogStatus('Image is too large (max 5 MB).');
        return;
      }
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
          pushBodySnapshot();
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
    },
    [adminKey, canUse, editingSlug, slug, pushBodySnapshot],
  );

  const uploadImage = (which: 'header' | 'body') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void processImageFile(file, which);
    };
    input.click();
  };

  const orphanCategorySlug =
    postCategorySelect &&
    postCategorySelect !== '__new__' &&
    !categories.some((c) => c.slug === postCategorySelect)
      ? postCategorySelect
      : null;

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
      <h2 className="text-lg font-semibold">5. Blog posts</h2>
      <p className="text-xs text-white/50 leading-relaxed">
        Posts live in Realtime Database at <code className="text-white/70">blogPosts/&#123;slug&#125;</code>. Images go
        to Storage under <code className="text-white/70">blog/&#123;slug&#125;/…</code>. Same Bearer key as manual
        picks. Enable Storage and rules (see <code className="text-white/70">lib/blog-post.ts</code> comments). The
        &quot;Upload image&quot; button opens your OS file dialog — it may <strong className="text-white/60">not</strong>{' '}
        list files in the same order as Finder; drag-and-drop from Finder (below) avoids that.
      </p>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white/90">Blog categories</h3>
        <p className="text-[11px] text-white/45 leading-relaxed">
          Stored in Realtime Database at <code className="text-white/60">blogCategories</code>. Lower{' '}
          <code className="text-white/60">sort order</code> values appear first when grouping the site. See{' '}
          <code className="text-white/60">lib/blog-category.ts</code> for suggested Firebase rules.
        </p>
        <button
          type="button"
          disabled={!canUse || blogLoading}
          onClick={() => void loadCategories()}
          className="rounded-lg bg-white/12 hover:bg-white/20 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          Refresh categories
        </button>
        {categories.length > 0 ? (
          <ul className="space-y-2 text-sm max-h-56 overflow-y-auto">
            {categories.map((c) => (
              <li
                key={c.slug}
                className="flex flex-col gap-2 rounded-lg border border-white/10 bg-black/30 p-2 sm:flex-row sm:flex-wrap sm:items-end"
              >
                <code className="text-xs text-white/45 shrink-0 self-start pt-2 sm:pt-0">{c.slug}</code>
                <input
                  className={`${inputCls} flex-1 min-w-[8rem]`}
                  aria-label={`Label for ${c.slug}`}
                  value={editBySlug[c.slug]?.label ?? c.label}
                  onChange={(e) =>
                    setEditBySlug((m) => ({
                      ...m,
                      [c.slug]: {
                        label: e.target.value,
                        sortOrder: m[c.slug]?.sortOrder ?? String(c.sortOrder),
                      },
                    }))
                  }
                />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    className={`${inputCls} w-20 sm:w-24`}
                    aria-label={`Sort order for ${c.slug}`}
                    value={editBySlug[c.slug]?.sortOrder ?? String(c.sortOrder)}
                    onChange={(e) =>
                      setEditBySlug((m) => ({
                        ...m,
                        [c.slug]: {
                          label: m[c.slug]?.label ?? c.label,
                          sortOrder: e.target.value,
                        },
                      }))
                    }
                  />
                  <button
                    type="button"
                    disabled={!canUse || blogLoading}
                    onClick={() => void updateCategoryRow(c.slug)}
                    className="rounded-lg bg-sky-600/85 hover:bg-sky-600 px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    disabled={!canUse || blogLoading}
                    onClick={() => void deleteCategoryRow(c.slug)}
                    className="rounded-lg bg-red-900/50 hover:bg-red-800/60 px-2.5 py-1.5 text-xs font-medium text-red-100 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-white/40">No categories yet — add one below or choose “Create new” on a post.</p>
        )}
        <div className="border-t border-white/10 pt-3 space-y-2">
          <p className="text-xs font-medium text-white/55">New category</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              className={inputCls}
              value={newCatLabel}
              onChange={(e) => setNewCatLabel(e.target.value)}
              placeholder="Label (required)"
            />
            <input
              className={inputCls}
              value={newCatSlug}
              onChange={(e) => setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="Slug (optional)"
            />
            <input
              type="number"
              className={inputCls}
              value={newCatSort}
              onChange={(e) => setNewCatSort(e.target.value)}
              placeholder="Sort order"
            />
          </div>
          <button
            type="button"
            disabled={!canUse || blogLoading}
            onClick={() => void createCategoryFromPanel()}
            className="rounded-lg bg-emerald-700/85 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
          >
            Create category
          </button>
        </div>
      </div>

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
              <span className="flex flex-wrap gap-2 shrink-0">
                <button type="button" className="text-cyan-300 text-xs hover:underline" onClick={() => void loadOne(p.slug)}>
                  Edit
                </button>
                <Link
                  href={`/admin/blog-preview/${encodeURIComponent(p.slug)}`}
                  className="text-violet-200/90 text-xs hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preview
                </Link>
                {p.published ? (
                  <Link
                    href={`/blog/${encodeURIComponent(p.slug)}`}
                    className="text-amber-200/80 text-xs hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live
                  </Link>
                ) : null}
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
        <div className="flex flex-col items-stretch sm:items-end gap-1.5">
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer sm:justify-end">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-white/30"
            />
            Published (visible on /blog)
          </label>
          <p className="text-[10px] text-white/40 leading-snug text-left sm:text-right max-w-md sm:ml-auto">
            Drafts: leave this off and choose <span className="text-white/55">Create post</span> or{' '}
            <span className="text-white/55">Update post</span> — work is saved under your slug. Use{' '}
            <span className="text-white/55">Preview</span> in the list (after save) to open{' '}
            <code className="text-white/50">/admin/blog-preview/…</code> with your admin key. Public{' '}
            <code className="text-white/50">/blog</code> only lists published posts.
          </p>
        </div>
      </div>

      <div>
        <label className="text-xs text-white/45">Title</label>
        <input className={`${inputCls} mt-1`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
      </div>

      <div>
        <label className="text-xs text-white/45">Category</label>
        <select
          className={`${inputCls} mt-1`}
          value={postCategorySelect}
          onChange={(e) => setPostCategorySelect(e.target.value)}
        >
          <option value="">(None)</option>
          {orphanCategorySlug ? (
            <option value={orphanCategorySlug}>
              {orphanCategorySlug} (missing from list — pick another or clear)
            </option>
          ) : null}
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
          <option value="__new__">+ Create new category…</option>
        </select>
        {postCategorySelect === '__new__' ? (
          <div className="mt-2 rounded-lg border border-amber-400/25 bg-amber-500/10 p-3 space-y-2">
            <p className="text-[11px] text-amber-100/85 leading-relaxed">
              Same fields as <strong className="text-amber-50/90">Blog categories → New category</strong> above — fill
              label (and optional slug / sort), then create. This post will switch to the new category so you can save the
              post next.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                className={inputCls}
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="Label (required)"
              />
              <input
                className={inputCls}
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="Slug (optional)"
              />
              <input
                type="number"
                className={inputCls}
                value={newCatSort}
                onChange={(e) => setNewCatSort(e.target.value)}
                placeholder="Sort order"
              />
            </div>
            <button
              type="button"
              disabled={!canUse || blogLoading}
              onClick={() => void createCategoryFromPanel()}
              className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              Create category &amp; use for this post
            </button>
          </div>
        ) : null}
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
            onClick={() => uploadImage('header')}
            className="rounded-lg bg-violet-600/80 hover:bg-violet-600 px-3 py-2 text-xs font-medium disabled:opacity-50 shrink-0"
          >
            Upload header image
          </button>
        </div>
        <div
          role="group"
          aria-label="Drop a header image file"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer?.types?.includes('Files')) {
              e.dataTransfer.dropEffect = 'copy';
            }
            setHeaderImageDropOver(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setHeaderImageDropOver(true);
          }}
          onDragLeave={() => {
            setHeaderImageDropOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setHeaderImageDropOver(false);
            const f = e.dataTransfer?.files?.[0];
            if (f) void processImageFile(f, 'header');
          }}
          className={`mt-2 rounded-lg border border-dashed px-3 py-2.5 text-center text-[11px] text-white/50 leading-snug transition-colors ${
            headerImageDropOver
              ? 'border-violet-400/80 bg-violet-500/15 text-violet-100/80'
              : 'border-white/20 bg-black/20 hover:border-white/28'
          } ${!canUse || blogLoading ? 'pointer-events-none opacity-50' : 'cursor-default'}`}
        >
          Or <strong className="text-white/60">drop</strong> a header image here (e.g. drag from Finder so order matches
          your folder).
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
            <label className="text-xs text-white/45 shrink-0">Body (Markdown)</label>
            <span className="text-[11px] text-white/40 tabular-nums">{countWords(bodyMarkdown)} words</span>
          </div>
          <button
            type="button"
            disabled={!canUse || blogLoading}
            onClick={() => uploadImage('body')}
            className="rounded-lg bg-violet-600/80 hover:bg-violet-600 px-3 py-1.5 text-xs font-medium disabled:opacity-50 shrink-0"
          >
            Upload image → insert markdown
          </button>
        </div>
        <div
          role="group"
          aria-label="Drop an image to insert in body"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer?.types?.includes('Files')) {
              e.dataTransfer.dropEffect = 'copy';
            }
            setBodyImageDropOver(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setBodyImageDropOver(true);
          }}
          onDragLeave={() => {
            setBodyImageDropOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setBodyImageDropOver(false);
            const f = e.dataTransfer?.files?.[0];
            if (f) void processImageFile(f, 'body');
          }}
          className={`mb-2 rounded-lg border border-dashed px-2.5 py-1.5 text-center text-[10px] text-white/45 leading-snug transition-colors ${
            bodyImageDropOver
              ? 'border-violet-400/80 bg-violet-500/15 text-violet-100/80'
              : 'border-white/15 bg-black/15 hover:border-white/25'
          } ${!canUse || blogLoading ? 'pointer-events-none opacity-50' : 'cursor-default'}`}
        >
          Or drop an image here to insert — same as header (Finder order preserved).
        </div>
        <BlogMarkdownToolbar
          textareaRef={bodyRef}
          value={bodyMarkdown}
          onChange={setBodyMarkdown}
          disabled={!canUse || blogLoading}
          onBeforeMutate={pushBodySnapshot}
          canUndo={bodyPast.length > 0}
          canRedo={bodyFuture.length > 0}
          onUndo={undoBody}
          onRedo={redoBody}
        />
        <textarea
          ref={bodyRef}
          className={`${inputCls} min-h-[12rem] font-mono text-xs`}
          style={{ fontFamily: blogMarkdownComposerFontFamily }}
          value={bodyMarkdown}
          onChange={(e) => setBodyMarkdown(e.target.value)}
          onKeyDown={(e) => {
            const mod = e.metaKey || e.ctrlKey;
            if (mod && e.key === 'z' && !e.shiftKey && bodyPast.length > 0) {
              e.preventDefault();
              undoBody();
              return;
            }
            if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && bodyFuture.length > 0) {
              e.preventDefault();
              redoBody();
              return;
            }
          }}
          placeholder="Write in Markdown…"
        />
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <label className="text-xs text-white/45">Excerpt (list view)</label>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-[11px] text-white/40 tabular-nums">{countWords(excerpt)} words</span>
            <button
              type="button"
              disabled={!bodyMarkdown.trim()}
              title={!bodyMarkdown.trim() ? 'Add body text first' : 'Fill excerpt from body (you can edit after)'}
              onClick={() => {
                const s = suggestBlogExcerptFromMarkdown(bodyMarkdown);
                if (!s) {
                  setBlogStatus('Nothing to summarise — add readable text to the body first.');
                  return;
                }
                setExcerpt(s);
                setBlogStatus('Excerpt suggested from body — edit if you like, then save.');
              }}
              className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-amber-100/90 hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none"
            >
              Suggest from body
            </button>
          </div>
        </div>
        <p className="text-[10px] text-white/35 mt-1 leading-snug">
          Heuristic only — strips common Markdown, takes the opening sentence or two (up to the excerpt length limit), then you edit.
        </p>
        <textarea
          className={`${inputCls} mt-1 min-h-[4rem]`}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary for the blog index (plain text; optional but recommended)"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canUse || blogLoading}
          onClick={() => void savePost()}
          className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {editingSlug ? 'Update post' : 'Create post'}
        </button>
        {slug.trim() ? (
          <span className="text-[11px] text-white/45">
            <Link
              href={`/admin/blog-preview/${encodeURIComponent(slug.trim().toLowerCase())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-200/90 hover:underline"
            >
              Preview this slug
            </Link>{' '}
            — loads the <strong className="text-white/55">saved</strong> post; save first if you edited copy.
          </span>
        ) : null}
      </div>

      {blogStatus ? (
        <p className="text-xs text-amber-100/90 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2" role="status">
          {blogStatus}
        </p>
      ) : null}
    </section>
  );
}
