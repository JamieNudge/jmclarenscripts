import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import {
  BLOG_POSTS_RTDB_ROOT,
  normalizeBlogPostInput,
  normalizeBlogSlug,
  parseBlogPostFromRtdb,
  type BlogPostRecord,
} from '@/lib/blog-post';
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

function postsRef() {
  const app = getFirebaseAdminApp();
  const db = getDatabase(app);
  return db.ref(BLOG_POSTS_RTDB_ROOT);
}

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slugRaw = req.nextUrl.searchParams.get('slug')?.trim() ?? '';
  const slug = slugRaw ? normalizeBlogSlug(slugRaw) : null;
  if (slugRaw && !slug) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  try {
    if (slug) {
      const snap = await postsRef().child(slug).once('value');
      const val = snap.val();
      if (val == null) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const post = parseBlogPostFromRtdb(val);
      if (!post) {
        return NextResponse.json({ error: 'Invalid stored post' }, { status: 500 });
      }
      return NextResponse.json({ post });
    }

    const snap = await postsRef().once('value');
    const raw = snap.val() as Record<string, unknown> | null;
    const list: BlogPostRecord[] = [];
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      for (const key of Object.keys(raw)) {
        const p = parseBlogPostFromRtdb(raw[key]);
        if (p) list.push(p);
      }
    }
    list.sort((a, b) => {
      const ta = a.publishedAt ?? a.updatedAt;
      const tb = b.publishedAt ?? b.updatedAt;
      return tb.localeCompare(ta);
    });
    return NextResponse.json({ posts: list });
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
  const normalized = normalizeBlogPostInput(body, null, nowIso);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  try {
    await postsRef().child(normalized.post.slug).set(normalized.post);
    revalidatePublishedBlogPaths();
    return NextResponse.json({
      ok: true,
      path: `${BLOG_POSTS_RTDB_ROOT}/${normalized.post.slug}`,
      post: normalized.post,
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

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const slugQ = req.nextUrl.searchParams.get('slug')?.trim();
  const slugBody = typeof body.slug === 'string' ? body.slug.trim() : '';
  const targetKeyRaw = slugQ || slugBody;
  const targetKey = targetKeyRaw ? normalizeBlogSlug(targetKeyRaw) : null;
  if (!targetKey) {
    return NextResponse.json(
      { error: 'Provide ?slug= in the URL (preferred) or a valid slug in the JSON body' },
      { status: 400 },
    );
  }

  const nowIso = new Date().toISOString();

  try {
    const snap = await postsRef().child(targetKey).once('value');
    const existingVal = snap.val();
    const existing = parseBlogPostFromRtdb(existingVal);
    if (!existing) {
      return NextResponse.json({ error: 'Not found — use POST to create' }, { status: 404 });
    }

    const mergedBody = { ...existing, ...body, slug: existing.slug };
    const normalized = normalizeBlogPostInput(mergedBody, existing, nowIso);
    if (!normalized.ok) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    await postsRef().child(normalized.post.slug).set(normalized.post);
    revalidatePublishedBlogPaths();
    return NextResponse.json({
      ok: true,
      path: `${BLOG_POSTS_RTDB_ROOT}/${normalized.post.slug}`,
      post: normalized.post,
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
    return NextResponse.json({ error: 'Query ?slug= is required (lowercase slug)' }, { status: 400 });
  }

  try {
    const snap = await postsRef().child(slug).once('value');
    if (snap.val() == null) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await postsRef().child(slug).remove();
    revalidatePublishedBlogPaths();
    return NextResponse.json({ ok: true, removed: slug });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
