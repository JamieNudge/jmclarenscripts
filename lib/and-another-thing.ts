/**
 * Short “micro posts” (thought-of-the-day style) in Realtime Database.
 *
 * ## Suggested RTDB rules
 * ```json
 * "andAnotherThing": {
 *   "posts": {
 *     ".read": true,
 *     ".write": false
 *   }
 * }
 * ```
 * Writes go through Admin SDK only (`/api/admin/and-another-thing`).
 *
 * **Storage** (optional): public read, no client write — `andAnotherThing/**` for `/api/admin/and-another-thing-media`
 * (same pattern as `blog/**`).
 */

export const AND_ANOTHER_THING_RTDB_ROOT = 'andAnotherThing';

export function andAnotherThingPostsPath(): string {
  return (
    process.env.AND_ANOTHER_THING_POSTS_PATH?.trim() ||
    process.env.NEXT_PUBLIC_AND_ANOTHER_THING_POSTS_PATH?.trim() ||
    `${AND_ANOTHER_THING_RTDB_ROOT}/posts`
  );
}

export type AnotherThingPost = {
  id: string;
  text: string;
  imageUrl: string | null;
  createdAt: string;
};

const MAX_TEXT = 2000;
const MAX_URL = 2000;

export function parsePostsMap(val: unknown): AnotherThingPost[] {
  if (val == null || typeof val !== 'object' || Array.isArray(val)) return [];
  const out: AnotherThingPost[] = [];
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (v == null || typeof v !== 'object' || Array.isArray(v)) continue;
    const o = v as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id : k;
    const text = typeof o.text === 'string' ? o.text.slice(0, MAX_TEXT) : '';
    const imageUrl =
      o.imageUrl === null
        ? null
        : typeof o.imageUrl === 'string' && o.imageUrl.trim()
          ? o.imageUrl.trim().slice(0, MAX_URL)
          : null;
    const createdAt = typeof o.createdAt === 'string' ? o.createdAt : '';
    if (!id || !text || !createdAt) continue;
    out.push({ id, text, imageUrl, createdAt });
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

export function normalizeNewPost(
  body: Record<string, unknown>,
  id: string,
  nowIso: string,
):
  | { ok: true; post: AnotherThingPost }
  | { ok: false; error: string } {
  const text =
    typeof body.text === 'string' ? body.text.trim().slice(0, MAX_TEXT) : '';
  if (!text) return { ok: false, error: 'Text is required.' };
  let imageUrl: string | null = null;
  if (body.imageUrl != null) {
    if (typeof body.imageUrl !== 'string' || !body.imageUrl.trim()) {
      return { ok: false, error: 'imageUrl must be a non-empty string or omitted.' };
    }
    imageUrl = body.imageUrl.trim().slice(0, MAX_URL);
  }
  return {
    ok: true,
    post: { id, text, imageUrl, createdAt: nowIso },
  };
}

/** PATCH: `imageUrl` omitted keeps existing; `null` or `""` clears. */
export function normalizeUpdatePost(
  body: Record<string, unknown>,
  existing: AnotherThingPost,
): { ok: true; post: AnotherThingPost } | { ok: false; error: string } {
  const text = typeof body.text === 'string' ? body.text.trim().slice(0, MAX_TEXT) : '';
  if (!text) return { ok: false, error: 'Text is required.' };

  let imageUrl: string | null;
  if (Object.prototype.hasOwnProperty.call(body, 'imageUrl')) {
    if (body.imageUrl === null) {
      imageUrl = null;
    } else if (typeof body.imageUrl === 'string') {
      const t = body.imageUrl.trim();
      imageUrl = t ? t.slice(0, MAX_URL) : null;
    } else {
      return { ok: false, error: 'imageUrl must be a string, null, or omitted.' };
    }
  } else {
    imageUrl = existing.imageUrl;
  }

  return {
    ok: true,
    post: {
      id: existing.id,
      text,
      imageUrl,
      createdAt: existing.createdAt,
    },
  };
}
