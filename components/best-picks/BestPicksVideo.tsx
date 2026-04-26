'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import {
  picksDateStringInTimeZone,
  picksTimeZoneFromEnv,
  statStrikeRtdbPathsFromEnv,
} from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import { youtubeEmbedSrc } from '@/lib/youtube-embed';

export function BestPicksVideo() {
  const dateKey = useMemo(() => picksDateStringInTimeZone(picksTimeZoneFromEnv()), []);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    const db = getFirebaseRealtimeDb();
    if (!db) return;
    const { manualExportsPath } = statStrikeRtdbPathsFromEnv(dateKey);
    const r = ref(db, manualExportsPath);
    return onValue(r, (snap) => {
      const v = snap.val() as Record<string, unknown> | null;
      if (!v || typeof v !== 'object') {
        setYoutubeId(null);
        setVideoTitle(null);
        return;
      }
      const y = v.youtubeId;
      const t = v.videoTitle;
      setYoutubeId(typeof y === 'string' && y.trim() ? y.trim() : null);
      setVideoTitle(typeof t === 'string' && t.trim() ? t.trim() : null);
    });
  }, [dateKey]);

  const configured = isFirebaseClientConfigured();

  return (
    <div className={bestPicksGridTileClassName}>
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2 shrink-0">Video</h2>
      {videoTitle ? (
        <p className="text-sm text-white/88 leading-relaxed mb-3 shrink-0">{videoTitle}</p>
      ) : null}
      <div className="flex-1 min-h-0 flex flex-col justify-center">
        {!configured && (
          <div className="aspect-video w-full max-h-full rounded-xl bg-zinc-900/90 border border-white/15 flex items-center justify-center text-white/72 text-sm">
            Firebase not configured
          </div>
        )}
        {configured && !youtubeId && (
          <div className="aspect-video w-full max-h-full rounded-xl bg-zinc-900/90 border border-white/15 flex items-center justify-center text-white/72 text-sm">
            No video for today yet
          </div>
        )}
        {configured && youtubeId && (
          <div className="aspect-video w-full max-h-full rounded-xl overflow-hidden border border-white/15 bg-zinc-950">
            <iframe
              title={videoTitle || 'YouTube video'}
              src={youtubeEmbedSrc(youtubeId)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
