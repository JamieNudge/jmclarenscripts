/**
 * Blog categories live in Realtime Database at {@link BLOG_CATEGORIES_RTDB_ROOT}/{slug}.
 *
 * ## Firebase console — suggested security rules
 *
 * Append under your root rules:
 * ```json
 * "blogCategories": {
 *   ".read": true,
 *   ".write": false
 * }
 * ```
 * Writes use the Admin SDK (`/api/admin/blog-categories`).
 */

import { normalizeBlogSlug } from '@/lib/blog-post';

export const BLOG_CATEGORIES_RTDB_ROOT = 'blogCategories';

const MAX_LABEL = 120;

export type BlogCategoryRecord = {
  slug: string;
  label: string;
  sortOrder: number;
  updatedAt: string;
};

function trimStr(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

/** Display label → URL slug (lowercase, hyphens). */
export function slugifyCategoryLabel(raw: string): string | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s ? normalizeBlogSlug(s) : null;
}

export function parseBlogCategoryFromRtdb(slugKey: string, val: unknown): BlogCategoryRecord | null {
  const slug = normalizeBlogSlug(slugKey);
  if (!slug) return null;
  if (val == null || typeof val !== 'object' || Array.isArray(val)) return null;
  const o = val as Record<string, unknown>;
  const label = trimStr(o.label, MAX_LABEL);
  if (!label) return null;
  const sortOrder = typeof o.sortOrder === 'number' && Number.isFinite(o.sortOrder) ? o.sortOrder : 0;
  const updatedAt =
    typeof o.updatedAt === 'string' && o.updatedAt.trim() ? o.updatedAt.trim() : new Date().toISOString();
  return { slug, label, sortOrder, updatedAt };
}

export function normalizeBlogCategoryCreateInput(
  body: Record<string, unknown>,
  nowIso: string,
): { ok: true; category: Omit<BlogCategoryRecord, 'slug'> & { slug: string } } | { ok: false; error: string } {
  const labelIn = trimStr(body.label, MAX_LABEL);
  if (!labelIn) return { ok: false, error: 'Label is required.' };

  let slug: string | null = null;
  if (typeof body.slug === 'string' && body.slug.trim()) {
    slug = normalizeBlogSlug(body.slug.trim());
  } else {
    slug = slugifyCategoryLabel(labelIn);
  }
  if (!slug) return { ok: false, error: 'Invalid slug — use lowercase letters, numbers, hyphens, or rely on label.' };

  const sortOrderRaw = body.sortOrder;
  const sortOrder =
    typeof sortOrderRaw === 'number' && Number.isFinite(sortOrderRaw)
      ? sortOrderRaw
      : typeof sortOrderRaw === 'string' && sortOrderRaw.trim()
        ? Number.parseInt(sortOrderRaw, 10)
        : 0;
  const sortOrderSafe = Number.isFinite(sortOrder) ? sortOrder : 0;

  return {
    ok: true,
    category: {
      slug,
      label: labelIn,
      sortOrder: sortOrderSafe,
      updatedAt: nowIso,
    },
  };
}

export function normalizeBlogCategoryPatchInput(
  body: Record<string, unknown>,
  existing: BlogCategoryRecord,
  nowIso: string,
): { ok: true; category: BlogCategoryRecord } | { ok: false; error: string } {
  const label =
    typeof body.label === 'string' ? trimStr(body.label, MAX_LABEL) : existing.label;
  if (!label) return { ok: false, error: 'Label cannot be empty.' };

  let sortOrder = existing.sortOrder;
  if (typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)) {
    sortOrder = body.sortOrder;
  } else if (typeof body.sortOrder === 'string' && body.sortOrder.trim()) {
    const n = Number.parseInt(body.sortOrder, 10);
    if (Number.isFinite(n)) sortOrder = n;
  }

  return {
    ok: true,
    category: {
      slug: existing.slug,
      label,
      sortOrder,
      updatedAt: nowIso,
    },
  };
}

export function sortBlogCategories(list: BlogCategoryRecord[]): BlogCategoryRecord[] {
  return [...list].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.label.localeCompare(b.label);
  });
}
