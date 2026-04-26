import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import {
  andAnotherThingPostsPath,
  normalizeNewPost,
  parsePostsMap,
} from '@/lib/and-another-thing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function misconfigured() {
  return NextResponse.json(
    { error: 'Admin API not configured (set ADMIN_MANUAL_PICKS_KEY and FIREBASE_SERVICE_ACCOUNT_JSON)' },
    { status: 503 },
  );
}

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const app = getFirebaseAdminApp();
    const ref = getDatabase(app).ref(andAnotherThingPostsPath());
    const snap = await ref.once('value');
    return NextResponse.json({ posts: parsePostsMap(snap.val()) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Load failed' },
      { status: 500 },
    );
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
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const id = randomUUID();
  const nowIso = new Date().toISOString();
  const n = normalizeNewPost(body, id, nowIso);
  if (!n.ok) {
    return NextResponse.json({ error: n.error }, { status: 400 });
  }
  try {
    const app = getFirebaseAdminApp();
    const ref = getDatabase(app).ref(`${andAnotherThingPostsPath()}/${id}`);
    await ref.set(n.post);
    return NextResponse.json({ ok: true, post: n.post });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Write failed' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get('id')?.trim();
  if (!id) {
    return NextResponse.json({ error: 'Query `id` is required' }, { status: 400 });
  }
  try {
    const app = getFirebaseAdminApp();
    const ref = getDatabase(app).ref(`${andAnotherThingPostsPath()}/${id}`);
    await ref.remove();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Delete failed' },
      { status: 500 },
    );
  }
}
