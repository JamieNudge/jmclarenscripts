import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import {
  BLOG_CATEGORIES_RTDB_ROOT,
  normalizeBlogCategoryCreateInput,
  normalizeBlogCategoryPatchInput,
  parseBlogCategoryFromRtdb,
  sortBlogCategories,
  type BlogCategoryRecord,
} from '@/lib/blog-category';
import { BLOG_POSTS_RTDB_ROOT, normalizeBlogSlug, parseBlogPostFromRtdb } from '@/lib/blog-post';
import { revalidatePublishedBlogPaths } from '@/lib/blog-revalidate';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function misconfigured() {
  return NextResponse.json(
    { error: 'Admin API not configured (set ADMIN_MANUAL_PICKS_KEY and FIREBASE_SERVICE_ACCOUNT_JSON)' },
    { status: 503 },
  );
}

function categoriesRef() {
  const app = getFirebaseAdminApp();
  const db = getDatabase(app);
  return db.ref(BLOG_CATEGORIES_RTDB_ROOT);
}

function postsRef() {
  const app = getFirebaseAdminApp();
  const db = getDatabase(app);
  return db.ref(BLOG_POSTS_RTDB_ROOT);
}

async function countPostsUsingCategory(categorySlug: string): Promise<number> {
  const snap = await postsRef().once('value');
  const raw = snap.val() as Record<string, unknown> | null;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return 0;
  let n = 0;
  for (const key of Object.keys(raw)) {
    const p = parseBlogPostFromRtdb(raw[key]);
    if (p?.categorySlug === categorySlug) n += 1;
  }
  return n;
}

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slugQ = req.nextUrl.searchParams.get('slug')?.trim() ?? '';
  const slug = slugQ ? normalizeBlogSlug(slugQ) : null;
  if (slugQ && !slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  try {
    if (slug) {
      const snap = await categoriesRef().child(slug).once('value');
      const val = snap.val();
      if (val == null) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const cat = parseBlogCategoryFromRtdb(slug, val);
      if (!cat) {
        return NextResponse.json({ error: 'Invalid stored category' }, { status: 500 });
      }
      return NextResponse.json({ category: cat });
    }

    const snap = await categoriesRef().once('value');
    const raw = snap.val() as Record<string, unknown> | null;
    const list: BlogCategoryRecord[] = [];
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      for (const key of Object.keys(raw)) {
        const c = parseBlogCategoryFromRtdb(key, raw[key]);
        if (c) list.push(c);
      }
    }
    return NextResponse.json({ categories: sortBlogCategories(list) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const nowIso = new Date().toISOString();
  const normalized = normalizeBlogCategoryCreateInput(body, nowIso);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const { slug, label, sortOrder, updatedAt } = normalized.category;

  try {
    const existing = await categoriesRef().child(slug).once('value');
    if (existing.val() != null) {
      return NextResponse.json({ error: `Category slug already exists: ${slug}` }, { status: 409 });
    }
    await categoriesRef().child(slug).set({ label, sortOrder, updatedAt });
    revalidatePublishedBlogPaths();
    const record: BlogCategoryRecord = { slug, label, sortOrder, updatedAt };
    return NextResponse.json({
      ok: true,
      path: `${BLOG_CATEGORIES_RTDB_ROOT}/${slug}`,
      category: record,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slugRaw = req.nextUrl.searchParams.get('slug')?.trim();
  const slug = slugRaw ? normalizeBlogSlug(slugRaw) : null;
  if (!slug) {
    return NextResponse.json({ error: 'Query ?slug= is required (category slug)' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const nowIso = new Date().toISOString();

  try {
    const snap = await categoriesRef().child(slug).once('value');
    const val = snap.val();
    const existing = val != null ? parseBlogCategoryFromRtdb(slug, val) : null;
    if (!existing) {
      return NextResponse.json({ error: 'Not found — use POST to create' }, { status: 404 });
    }

    const normalized = normalizeBlogCategoryPatchInput(body, existing, nowIso);
    if (!normalized.ok) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const c = normalized.category;
    await categoriesRef().child(slug).set({
      label: c.label,
      sortOrder: c.sortOrder,
      updatedAt: c.updatedAt,
    });
    revalidatePublishedBlogPaths();
    return NextResponse.json({
      ok: true,
      path: `${BLOG_CATEGORIES_RTDB_ROOT}/${slug}`,
      category: c,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slugRaw = req.nextUrl.searchParams.get('slug')?.trim();
  const slug = slugRaw ? normalizeBlogSlug(slugRaw) : null;
  if (!slug) {
    return NextResponse.json({ error: 'Query ?slug= is required' }, { status: 400 });
  }

  try {
    const snap = await categoriesRef().child(slug).once('value');
    if (snap.val() == null) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const n = await countPostsUsingCategory(slug);
    if (n > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${n} post(s) use this category. Reassign or clear them first.` },
        { status: 409 },
      );
    }

    await categoriesRef().child(slug).remove();
    revalidatePublishedBlogPaths();
    return NextResponse.json({ ok: true, removed: slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
