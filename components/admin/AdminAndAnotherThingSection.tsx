'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AnotherThingPost } from '@/lib/and-another-thing';

const inputCls =
  'w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/60';

type Props = { adminKey: string };

export function AdminAndAnotherThingSection({ adminKey }: Props) {
  const [posts, setPosts] = useState<AnotherThingPost[]>([]);
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const authHeaders = (): HeadersInit => ({
    Authorization: `Bearer ${adminKey.trim()}`,
    'Content-Type': 'application/json',
  });

  const load = useCallback(async () => {
    if (!adminKey.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/and-another-thing', { headers: { Authorization: `Bearer ${adminKey.trim()}` } });
      const j = (await res.json()) as { posts?: AnotherThingPost[]; error?: string };
      if (!res.ok) {
        setStatus(j.error || 'Load failed');
        return;
      }
      setPosts(j.posts ?? []);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const submit = async () => {
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
        Short notes for the public feed (same style as a micro-blog). Optional image: upload or paste a URL. Max ~2000
        characters.
      </p>

      <textarea
        className={`${inputCls} min-h-[8rem] resize-y`}
        placeholder="Thought for the day…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2000}
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
          placeholder="https://…"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || uploading}
          onClick={() => void submit()}
          className="rounded-lg bg-cyan-600/90 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Post to feed'}
        </button>
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
        <p className="text-xs font-semibold text-white/45 mb-2">Recent posts ({posts.length})</p>
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
              <button
                type="button"
                onClick={() => void remove(p.id)}
                className="shrink-0 text-red-300 text-xs hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
