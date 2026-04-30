/**
 * Blog posts live in Realtime Database at {@link BLOG_POSTS_RTDB_ROOT}/{slug}.
 *
 * ## Firebase console — suggested security rules
 *
 * **Realtime Database** (append under your root rules):
 * ```json
 * "blogPosts": {
 *   ".read": true,
 *   ".write": false
 * },
 * "blogCategories": {
 *   ".read": true,
 *   ".write": false
 * }
 * ```
 * All writes go through Admin SDK (`/api/admin/blog-posts`, `/api/admin/blog-categories`). Public site reads with the client SDK.
 *
 * **Storage** (for `blog/**` uploads from `/api/admin/blog-media`):
 * ```
 * rules_version = '2';
 * service firebase.storage {
 *   match /b/{bucket}/o {
 *     match /blog/{allPaths=**} {
 *       allow read: if true;
 *       allow write: if false;
 *     }
 *   }
 * }
 * ```
 * Uploads use the Admin SDK (server); clients only GET images by URL.
 */

export const BLOG_POSTS_RTDB_ROOT = 'blogPosts';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const MAX_TITLE = 200;
/** Matches API trimming for list-view excerpts. */
export const BLOG_POST_EXCERPT_MAX_CHARS = 800;
const MAX_BODY = 500_000;
const MAX_URL = 2000;

export type BlogPostRecord = {
  slug: string;
  title: string;
  excerpt: string;
  published: boolean;
  /** ISO 8601 — set when first published or on each publish */
  publishedAt: string | null;
  updatedAt: string;
  headerImageUrl: string | null;
  bodyMarkdown: string;
  /** RTDB `blogCategories/{slug}` key; null = uncategorized. */
  categorySlug: string | null;
};

export function isValidBlogSlug(slug: string): boolean {
  return SLUG_RE.test(slug.trim());
}

export function normalizeBlogSlug(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s || !SLUG_RE.test(s)) return null;
  return s;
}

function trimStr(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

export function normalizeBlogPostInput(
  body: Record<string, unknown>,
  existing: Partial<BlogPostRecord> | null,
  nowIso: string,
): { ok: true; post: BlogPostRecord } | { ok: false; error: string } {
  const slugIn = typeof body.slug === 'string' ? body.slug : existing?.slug;
  const slug = slugIn ? normalizeBlogSlug(slugIn) : null;
  if (!slug) return { ok: false, error: 'Invalid or missing slug (lowercase letters, numbers, hyphens only).' };

  const title = trimStr(body.title ?? existing?.title, MAX_TITLE);
  if (!title) return { ok: false, error: 'Title is required.' };

  const excerpt = trimStr(body.excerpt ?? existing?.excerpt ?? '', BLOG_POST_EXCERPT_MAX_CHARS);
  const bodyMarkdown = trimStr(body.bodyMarkdown ?? existing?.bodyMarkdown ?? '', MAX_BODY);

  let headerImageUrl: string | null =
    body.headerImageUrl === null || body.headerImageUrl === ''
      ? null
      : trimStr(body.headerImageUrl ?? existing?.headerImageUrl, MAX_URL) || null;
  if (headerImageUrl === '') headerImageUrl = null;

  const publishedRaw = body.published;
  const published =
    typeof publishedRaw === 'boolean'
      ? publishedRaw
      : typeof publishedRaw === 'string'
        ? publishedRaw === 'true' || publishedRaw === '1'
        : Boolean(existing?.published);

  let publishedAt: string | null =
    typeof body.publishedAt === 'string' && body.publishedAt.trim()
      ? body.publishedAt.trim()
      : existing?.publishedAt ?? null;
  if (published && !publishedAt) {
    publishedAt = nowIso;
  }
  if (!published) {
    publishedAt = publishedAt ?? null;
  }

  let categorySlug: string | null;
  if (Object.prototype.hasOwnProperty.call(body, 'categorySlug')) {
    const raw = body.categorySlug;
    if (raw === null || raw === '') {
      categorySlug = null;
    } else if (typeof raw === 'string') {
      const n = normalizeBlogSlug(raw.trim());
      if (!n) return { ok: false, error: 'Invalid category slug (lowercase letters, numbers, hyphens only).' };
      categorySlug = n;
    } else {
      return { ok: false, error: 'Invalid category slug.' };
    }
  } else {
    categorySlug = existing?.categorySlug ?? null;
  }

  const post: BlogPostRecord = {
    slug,
    title,
    excerpt,
    published,
    publishedAt,
    updatedAt: nowIso,
    headerImageUrl,
    bodyMarkdown,
    categorySlug,
  };
  return { ok: true, post };
}

export function parseBlogPostFromRtdb(val: unknown): BlogPostRecord | null {
  if (val == null || typeof val !== 'object' || Array.isArray(val)) return null;
  const o = val as Record<string, unknown>;
  const slug = typeof o.slug === 'string' ? normalizeBlogSlug(o.slug) : null;
  if (!slug) return null;
  const title = trimStr(o.title, MAX_TITLE);
  if (!title) return null;
  const excerpt = trimStr(o.excerpt, BLOG_POST_EXCERPT_MAX_CHARS);
  const bodyMarkdown = trimStr(o.bodyMarkdown, MAX_BODY);
  const published = Boolean(o.published);
  const publishedAt = typeof o.publishedAt === 'string' && o.publishedAt.trim() ? o.publishedAt.trim() : null;
  const updatedAt = typeof o.updatedAt === 'string' && o.updatedAt.trim() ? o.updatedAt.trim() : new Date().toISOString();
  const headerImageUrl =
    o.headerImageUrl == null || o.headerImageUrl === ''
      ? null
      : trimStr(o.headerImageUrl, MAX_URL) || null;
  let categorySlug: string | null = null;
  if (typeof o.categorySlug === 'string' && o.categorySlug.trim()) {
    const cs = normalizeBlogSlug(o.categorySlug.trim());
    if (cs) categorySlug = cs;
  }
  return {
    slug,
    title,
    excerpt,
    published,
    publishedAt,
    updatedAt,
    headerImageUrl,
    bodyMarkdown,
    categorySlug,
  };
}
