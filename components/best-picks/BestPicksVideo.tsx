'use client';

import { useCallback, useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { hubVideoRtdbPath, parseHubVideoFromRtdb } from '@/lib/hub-video';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import { youtubeEmbedSrc, youtubeThumbnailSrc, youtubeWatchUrl } from '@/lib/youtube-embed';

export function BestPicksVideo() {
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [pageOrigin, setPageOrigin] = useState('');

  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    const db = getFirebaseRealtimeDb();
    if (!db) return;
    const r = ref(db, hubVideoRtdbPath());
    return onValue(r, (snap) => {
      const video = parseHubVideoFromRtdb(snap.val());
      setYoutubeId(video.youtubeId);
      setVideoTitle(video.videoTitle);
    });
  }, []);

  useEffect(() => {
    setPageOrigin(window.location.origin);
  }, []);

  const closeExpanded = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeExpanded();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [closeExpanded, expanded]);

  const configured = isFirebaseClientConfigured();
  const openExpanded = () => setExpanded(true);

  return (
    <>
      <div className={bestPicksGridTileClassName}>
        <div className="flex items-start justify-between gap-3 mb-2 shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-[var(--hub-text)]">Video</h2>
          {configured && youtubeId ? (
            <button
              type="button"
              onClick={openExpanded}
              className="shrink-0 rounded-lg border border-[var(--hub-border)] bg-[var(--hub-chip)] px-3 py-1.5 text-xs font-semibold text-[var(--hub-text)] hover:bg-[var(--hub-hover)]"
            >
              Expand
            </button>
          ) : null}
        </div>
        {videoTitle ? (
          <p className="text-sm text-[var(--hub-text-soft)] leading-relaxed mb-3 shrink-0">{videoTitle}</p>
        ) : null}
        <div className="flex-1 min-h-0 flex flex-col justify-center">
          {!configured && (
            <div className="aspect-video w-full max-h-full rounded-xl bg-[var(--hub-elevated)] border border-[var(--hub-border-soft)] flex items-center justify-center text-[var(--hub-text-soft)] text-sm">
              Firebase not configured
            </div>
          )}
          {configured && !youtubeId && (
            <div className="aspect-video w-full max-h-full rounded-xl bg-[var(--hub-elevated)] border border-[var(--hub-border-soft)] flex items-center justify-center text-[var(--hub-text-soft)] text-sm">
              No video yet
            </div>
          )}
          {configured && youtubeId && (
            <button
              type="button"
              onClick={openExpanded}
              className="group relative aspect-video w-full max-h-full rounded-xl overflow-hidden border border-[var(--hub-border-soft)] bg-[var(--hub-panel)] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
              aria-label={videoTitle ? `Play video: ${videoTitle}` : 'Play hub video'}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeThumbnailSrc(youtubeId)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-black/35 transition group-hover:bg-[var(--hub-inset)]" aria-hidden />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-lg transition group-hover:scale-105">
                  <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-white drop-shadow">Tap to watch</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {expanded && youtubeId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={videoTitle || 'Hub video'}
          onClick={closeExpanded}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeExpanded}
              className="absolute -top-2 right-0 z-10 translate-y-[-100%] rounded-lg border border-[var(--hub-border)] bg-[var(--hub-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--hub-text)] hover:bg-[var(--hub-hover)]"
            >
              Close
            </button>
            {videoTitle ? (
              <p className="mb-3 text-base font-semibold text-[var(--hub-text)] md:text-lg">{videoTitle}</p>
            ) : null}
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-[var(--hub-border)] bg-[var(--hub-footer)] shadow-2xl">
              <iframe
                title={videoTitle || 'YouTube video'}
                src={youtubeEmbedSrc(youtubeId, { autoplay: true, origin: pageOrigin || undefined })}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="mt-3 text-center text-xs text-[var(--hub-text-faint)]">
              <a
                href={youtubeWatchUrl(youtubeId)}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-[var(--hub-text-soft)]"
              >
                Open on YouTube
              </a>
              {' '}
              if the player is hard to use on your device.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
