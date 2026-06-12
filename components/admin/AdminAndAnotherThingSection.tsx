'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EmojiInsertBar } from '@/components/admin/EmojiInsertBar';
import type { AnotherThingPost } from '@/lib/and-another-thing';

const inputCls =
  'w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/60';

type Props = { adminKey: string };

export function AdminAndAnotherThingSection({ adminKey }: Props) {
  const [posts, setPosts] = useState<AnotherThingPost[]>([]);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const canUse = adminKey.trim().length > 0;

  const authHeaders = (): HeadersInit => ({
    Authorization: `Bearer ${adminKey.trim()}`,
    'Content-Type': 'application/json',
  });

  const load = useCallback(async () => {
    if (!canUse) {
      setStatus('Paste your admin key above to load the feed history.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/and-another-thing', {
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
        cache: 'no-store',
      });
      const j = (await res.json()) as { posts?: AnotherThingPost[]; error?: string };
      if (!res.ok) {
        setStatus(j.error || 'Load failed');
        return;
      }
      const next = j.posts ?? [];
      setPosts(next);
      if (next.length === 0) {
        setStatus('No posts in the feed yet.');
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [adminKey, canUse]);

  useEffect(() => {
    if (canUse) void load();
  }, [canUse, load]);

  const cancelEdit = () => {
    setEditingId(null);
    setText('');
    setImageUrl('');
    setFile(null);
    setStatus(null);
  };

  const startEdit = (p: AnotherThingPost) => {
    setEditingId(p.id);
    setText(p.text);
    setImageUrl(p.imageUrl ?? '');
    setFile(null);
    setStatus('Editing — change the text or image, then save.');
  };

  const uploadFileAndGetUrl = async (): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    try {
      const form = new FormData();
      form.set('file', file);
      const res = await fetch('/api/admin/and-another-thing-media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
        body: form,
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setStatus(j.error || 'Image upload failed');
        return null;
      }
      if (j.url) {
        setImageUrl(j.url);
        setFile(null);
        return j.url;
      }
      return null;
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setStatus(null);
    if (!adminKey.trim()) {
      setStatus('Paste your admin key first.');
      return;
    }
    const t = text.trim();
    if (!t) {
      setStatus('Write something first.');
      return;
    }
    setLoading(true);
    try {
      let img: string | null;
      if (file) {
        const up = await uploadFileAndGetUrl();
        if (!up) {
          setLoading(false);
          return;
        }
        img = up;
      } else {
        img = imageUrl.trim() || null;
      }
      const res = await fetch('/api/admin/and-another-thing', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ id: editingId, text: t, imageUrl: img }),
      });
      const j = (await res.json()) as { error?: string; post?: AnotherThingPost };
      if (!res.ok) {
        setStatus(j.error || 'Update failed');
        return;
      }
      cancelEdit();
      await load();
      setStatus('Updated.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (editingId) {
      void saveEdit();
      return;
    }
    setStatus(null);
    if (!adminKey.trim()) {
      setStatus('Paste your admin key first.');
      return;
    }
    const t = text.trim();
    if (!t) {
      setStatus('Write something first.');
      return;
    }
    setLoading(true);
    try {
      let img: string | null = imageUrl.trim() || null;
      if (file) {
        const up = await uploadFileAndGetUrl();
        if (!up) {
          setLoading(false);
          return;
        }
        img = up;
      }
      const res = await fetch('/api/admin/and-another-thing', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ text: t, imageUrl: img }),
      });
      const j = (await res.json()) as { error?: string; post?: AnotherThingPost };
      if (!res.ok) {
        setStatus(j.error || 'Post failed');
        return;
      }
      setText('');
      setImageUrl('');
      setFile(null);
      setStatus('Posted.');
      if (j.post) {
        setPosts((prev) => [j.post!, ...prev].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
      } else {
        void load();
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Post failed');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!adminKey.trim() || !window.confirm('Delete this post?')) return;
    if (editingId === id) {
      cancelEdit();
    }
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/and-another-thing?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus(j.error || 'Delete failed');
        return;
      }
      setPosts((p) => p.filter((x) => x.id !== id));
      setStatus('Deleted.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <section className="rounded-2xl border border-cyan-500/25 bg-cyan-950/20 p-5 space-y-4">
      <h2 className="text-lg font-semibold text-white">And Another Thing…</h2>
      <p className="text-xs text-white/50 leading-relaxed">
        Short notes for the public feed. You can <strong className="text-cyan-200/90">edit</strong> any post
        (text + image) — no “post first, live forever” rule here. Optional image: upload or paste a URL. Clear the URL
        and save to remove the image. Max ~2000 characters.
      </p>

      {editingId ? (
        <p className="text-xs text-cyan-200/80 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-1.5">
          Editing post <code className="text-cyan-100/90 text-[10px]">{editingId.slice(0, 8)}…</code> — created{' '}
          {posts.find((p) => p.id === editingId)?.createdAt?.slice(0, 10) ?? '—'}
        </p>
      ) : null}

      <textarea
        ref={textRef}
        className={`${inputCls} min-h-[8rem] resize-y`}
        placeholder="Thought for the day…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2000}
      />
      <EmojiInsertBar
        inputRef={textRef}
        value={text}
        onChange={setText}
        disabled={loading || uploading}
      />
      <div>
        <label className="text-xs text-white/45">Image (optional) — file</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-1 w-full text-sm text-white/80 file:mr-2 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div>
        <label className="text-xs text-white/45">Or image URL (optional)</label>
        <input
          className={`${inputCls} mt-1`}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://… (clear to remove image when saving an edit)"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || uploading}
          onClick={() => void submit()}
          className="rounded-lg bg-cyan-600/90 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : editingId ? 'Save changes' : 'Post to feed'}
        </button>
        {editingId ? (
          <button
            type="button"
            onClick={cancelEdit}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
          >
            Cancel edit
          </button>
        ) : null}
        <button
          type="button"
          disabled={loading}
          onClick={() => void load()}
          className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
        >
          Refresh list
        </button>
      </div>

      {status ? (
        <p className="text-xs text-amber-200/90" role="status">
          {status}
        </p>
      ) : null}

      <div>
        <p className="text-xs font-semibold text-white/45 mb-2">
          Recent posts ({posts.length}){loading ? ' — loading…' : ''}
        </p>
        {!loading && posts.length === 0 ? (
          <p className="text-xs text-white/40 mb-2">
            {canUse
              ? 'Nothing loaded yet — click Refresh list, or post a new note above.'
              : 'Paste your admin key above to see published micro-posts here.'}
          </p>
        ) : null}
        <ul className="max-h-60 overflow-y-auto space-y-2 pr-1 text-sm">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-white/90 line-clamp-3 whitespace-pre-wrap break-words">{p.text}</p>
                <p className="text-[10px] text-white/40 mt-1 tabular-nums">
                  {p.createdAt}
                  {p.imageUrl ? ' · image' : ''}
                </p>
              </div>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="text-cyan-300 text-xs hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(p.id)}
                  className="text-red-300 text-xs hover:underline"
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
