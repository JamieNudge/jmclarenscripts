'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HubVideoRecord } from '@/lib/hub-video';
import { parseYoutubeIdFromInput } from '@/lib/youtube-embed';

const inputCls =
  'w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60';

type Props = { adminKey: string };

export function AdminHubVideoSection({ adminKey }: Props) {
  const [youtubeRaw, setYoutubeRaw] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canUse = adminKey.trim().length > 0;

  const authHeaders = (): HeadersInit => ({
    Authorization: `Bearer ${adminKey.trim()}`,
    'Content-Type': 'application/json',
  });

  const applyVideo = useCallback((video: HubVideoRecord) => {
    setYoutubeRaw(video.youtubeId ?? '');
    setVideoTitle(video.videoTitle ?? '');
  }, []);

  const load = useCallback(async () => {
    if (!canUse) {
      setStatus('Paste your admin key first.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/hub-video', {
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
        cache: 'no-store',
      });
      const json = (await res.json()) as { video?: HubVideoRecord; error?: string };
      if (!res.ok) {
        setStatus(json.error || res.statusText);
        return;
      }
      applyVideo(json.video ?? { youtubeId: null, videoTitle: null, updatedAt: null });
      setStatus(
        json.video?.youtubeId
          ? 'Loaded current hub video.'
          : 'No hub video set yet — paste a YouTube link and save.',
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [adminKey, applyVideo, canUse]);

  useEffect(() => {
    if (canUse) void load();
  }, [canUse, load]);

  const save = async (clear = false) => {
    if (!canUse) {
      setStatus('Admin key required.');
      return;
    }

    let youtubeId: string | null = null;
    if (!clear) {
      const trimmedYt = youtubeRaw.trim();
      if (trimmedYt) {
        const parsed = parseYoutubeIdFromInput(trimmedYt);
        if (!parsed) {
          setStatus(
            'YouTube field: paste a watch URL, youtu.be link, or an 11-character video ID (or use Clear video).',
          );
          return;
        }
        youtubeId = parsed;
      }
    }

    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/hub-video', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          youtubeId,
          videoTitle: clear ? null : videoTitle.trim() || null,
        }),
      });
      const json = (await res.json()) as { error?: string; video?: HubVideoRecord; path?: string };
      if (!res.ok) {
        setStatus(json.error || res.statusText);
        return;
      }
      applyVideo(json.video ?? { youtubeId: null, videoTitle: null, updatedAt: null });
      setStatus(
        clear || !youtubeId
          ? `Hub video removed${json.path ? ` (${json.path})` : ''}.`
          : `Hub video saved${json.path ? ` to ${json.path}` : ''}. It stays live until you change or clear it.`,
      );
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
      <h2 className="text-lg font-semibold">4. Hub video (YouTube)</h2>
      <p className="text-xs text-white/50 leading-relaxed">
        Featured video on the Football Predictions hub. Unlike daily picks, this{' '}
        <strong className="text-white/65">persists until you update or clear it</strong> — same idea as
        blog posts. Stored at <code className="text-white/70">hubVideo</code> in Realtime Database.
      </p>
      <input
        className={inputCls}
        placeholder="https://www.youtube.com/watch?v=…"
        value={youtubeRaw}
        onChange={(e) => setYoutubeRaw(e.target.value)}
      />
      <div>
        <label className="text-xs text-white/45">Title (optional, shown above the player)</label>
        <input
          className={`${inputCls} mt-1`}
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void load()}
          className="rounded-lg bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Reload
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void save(false)}
          className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Save hub video
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void save(true)}
          className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Clear video
        </button>
      </div>
      {status ? (
        <p
          className={`text-sm rounded-lg px-4 py-3 border ${
            status.includes('saved') ||
            status.includes('removed') ||
            status.includes('Loaded') ||
            status.includes('No hub video')
              ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-100'
              : 'bg-amber-500/10 border-amber-400/30 text-amber-100'
          }`}
          role="status"
        >
          {status}
        </p>
      ) : null}
    </section>
  );
}
