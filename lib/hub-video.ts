/**
 * Featured hub video (YouTube) — site content, not date-keyed like manual picks.
 *
 * ## Firebase console — suggested security rules
 * ```json
 * "hubVideo": {
 *   ".read": true,
 *   ".write": false
 * }
 * ```
 * Writes go through Admin SDK (`/api/admin/hub-video`). Public hub reads with the client SDK.
 */

export const HUB_VIDEO_RTDB_ROOT = 'hubVideo';

export function hubVideoRtdbPath(): string {
  return (
    process.env.NEXT_PUBLIC_HUB_VIDEO_RTDB_ROOT?.trim() ||
    process.env.HUB_VIDEO_RTDB_ROOT?.trim() ||
    HUB_VIDEO_RTDB_ROOT
  );
}

const MAX_TITLE = 200;
const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export type HubVideoRecord = {
  youtubeId: string | null;
  videoTitle: string | null;
  updatedAt: string | null;
};

export const EMPTY_HUB_VIDEO: HubVideoRecord = {
  youtubeId: null,
  videoTitle: null,
  updatedAt: null,
};

export function parseHubVideoFromRtdb(raw: unknown): HubVideoRecord {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...EMPTY_HUB_VIDEO };
  }
  const o = raw as Record<string, unknown>;
  const youtubeId =
    typeof o.youtubeId === 'string' && YOUTUBE_ID_RE.test(o.youtubeId.trim())
      ? o.youtubeId.trim()
      : null;
  const videoTitle =
    typeof o.videoTitle === 'string' && o.videoTitle.trim()
      ? o.videoTitle.trim().slice(0, MAX_TITLE)
      : null;
  const updatedAt =
    typeof o.updatedAt === 'string' && o.updatedAt.trim() ? o.updatedAt.trim() : null;
  return { youtubeId, videoTitle, updatedAt };
}

export function normalizeHubVideoInput(body: Record<string, unknown>):
  | { ok: true; record: HubVideoRecord }
  | { ok: false; error: string } {
  if (!Object.prototype.hasOwnProperty.call(body, 'youtubeId')) {
    return { ok: false, error: 'youtubeId is required (string, empty string, or null).' };
  }

  const y = body.youtubeId;
  let youtubeId: string | null;
  if (y === null || y === '') {
    youtubeId = null;
  } else if (typeof y === 'string' && YOUTUBE_ID_RE.test(y.trim())) {
    youtubeId = y.trim();
  } else {
    return { ok: false, error: 'youtubeId must be an 11-character video id, empty string, or null.' };
  }

  let videoTitle: string | null = null;
  if (Object.prototype.hasOwnProperty.call(body, 'videoTitle')) {
    const vt = body.videoTitle;
    if (vt === null || vt === '') {
      videoTitle = null;
    } else if (typeof vt === 'string') {
      videoTitle = vt.trim().slice(0, MAX_TITLE) || null;
    } else {
      return { ok: false, error: 'videoTitle must be string, empty string, or null.' };
    }
  }

  if (!youtubeId) {
    return {
      ok: true,
      record: { youtubeId: null, videoTitle: null, updatedAt: new Date().toISOString() },
    };
  }

  return {
    ok: true,
    record: {
      youtubeId,
      videoTitle: videoTitle ?? null,
      updatedAt: new Date().toISOString(),
    },
  };
}
