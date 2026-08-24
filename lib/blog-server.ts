import { cache } from 'react';
import { getDatabase } from 'firebase-admin/database';
import {
  BLOG_CATEGORIES_RTDB_ROOT,
  parseBlogCategoryFromRtdb,
} from '@/lib/blog-category';
import {
  BLOG_POSTS_RTDB_ROOT,
  normalizeBlogSlug,
  parseBlogPostFromRtdb,
  type BlogPostRecord,
} from '@/lib/blog-post';
import { getFirebaseAdminApp, isFirebaseAdminConfigured } from '@/lib/firebase-admin';

function sortPublishedNewest(a: BlogPostRecord, b: BlogPostRecord): number {
  return (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt);
}

/** Published Insights posts, newest first. Cached per request (metadata + page share one RTDB get). */
export const listPublishedPosts = cache(async (): Promise<BlogPostRecord[]> => {
  if (!isFirebaseAdminConfigured()) return [];
  try {
    const snap = await getDatabase(getFirebaseAdminApp()).ref(BLOG_POSTS_RTDB_ROOT).once('value');
    const v = snap.val();
    const list: BlogPostRecord[] = [];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const k of Object.keys(v as Record<string, unknown>)) {
        const p = parseBlogPostFromRtdb((v as Record<string, unknown>)[k]);
        if (p && p.published) list.push(p);
      }
    }
    list.sort(sortPublishedNewest);
    return list;
  } catch {
    return [];
  }
});

/** Single published post. Cached per request so generateMetadata and the page share one get. */
export const getPublishedPost = cache(async (slug: string): Promise<BlogPostRecord | null> => {
  const key = normalizeBlogSlug(slug);
  if (!key || !isFirebaseAdminConfigured()) return null;
  try {
    const snap = await getDatabase(getFirebaseAdminApp()).ref(`${BLOG_POSTS_RTDB_ROOT}/${key}`).once('value');
    const p = parseBlogPostFromRtdb(snap.val());
    if (!p || !p.published) return null;
    return p;
  } catch {
    return null;
  }
});

export const categoryLabelBySlug = cache(async (): Promise<Record<string, string>> => {
  if (!isFirebaseAdminConfigured()) return {};
  try {
    const snap = await getDatabase(getFirebaseAdminApp()).ref(BLOG_CATEGORIES_RTDB_ROOT).once('value');
    const v = snap.val();
    const map: Record<string, string> = {};
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const k of Object.keys(v as Record<string, unknown>)) {
        const c = parseBlogCategoryFromRtdb(k, (v as Record<string, unknown>)[k]);
        if (c) map[c.slug] = c.label;
      }
    }
    return map;
  } catch {
    return {};
  }
});
