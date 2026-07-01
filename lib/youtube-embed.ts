/** Extract 11-char YouTube video id from id string or common URL shapes. */
export function parseYoutubeIdFromInput(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id && id.length === 11 ? id : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const embed = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1];
      const shorts = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shorts) return shorts[1];
    }
  } catch {
    return null;
  }
  return null;
}

export type YoutubeEmbedOptions = {
  autoplay?: boolean;
  /** Page origin for embed security; omit on server. */
  origin?: string;
};

export function youtubeThumbnailSrc(videoId: string, quality: 'hq' | 'max' = 'hq'): string {
  const file = quality === 'max' ? 'maxresdefault.jpg' : 'hqdefault.jpg';
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/${file}`;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

/** Privacy-enhanced embed host; rel=0 limits related videos to the same channel when possible. */
export function youtubeEmbedSrc(videoId: string, options: YoutubeEmbedOptions = {}): string {
  const params = new URLSearchParams();
  params.set('rel', '0');
  params.set('fs', '1');
  params.set('playsinline', '1');
  params.set('iv_load_policy', '3');
  if (options.autoplay) params.set('autoplay', '1');
  if (options.origin) params.set('origin', options.origin);
  const qs = params.toString();
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}${qs ? `?${qs}` : ''}`;
}
