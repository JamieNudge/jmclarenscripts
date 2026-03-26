import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, ServerValue } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import {
  normalizePredictionIdeaEmail,
  predictionIdeaBlockedEmailsRoot,
  predictionIdeaEmailBlocklistKey,
} from '@/lib/prediction-idea-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function misconfigured() {
  return NextResponse.json(
    { error: 'Admin API not configured (ADMIN_MANUAL_PICKS_KEY and FIREBASE_SERVICE_ACCOUNT_JSON)' },
    { status: 503 },
  );
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export type BlocklistRow = { email: string; blockedAt: number };

/** List blocked emails (newest first). */
export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) return unauthorized();

  try {
    const app = getFirebaseAdminApp();
    const db = getDatabase(app);
    const snap = await db.ref(predictionIdeaBlockedEmailsRoot()).once('value');
    const val = snap.val() as Record<string, { email?: unknown; blockedAt?: unknown }> | null;
    const entries: BlocklistRow[] = [];
    if (val != null && typeof val === 'object' && !Array.isArray(val)) {
      for (const row of Object.values(val)) {
        if (row == null || typeof row !== 'object' || Array.isArray(row)) continue;
        const email = typeof row.email === 'string' ? row.email : '';
        const blockedAt = typeof row.blockedAt === 'number' && Number.isFinite(row.blockedAt) ? row.blockedAt : 0;
        if (email) entries.push({ email, blockedAt });
      }
    }
    entries.sort((a, b) => b.blockedAt - a.blockedAt);
    return NextResponse.json({ entries });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Block one email (normalized). Idempotent. */
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const o = body as Record<string, unknown>;
  const emailRaw = typeof o.email === 'string' ? o.email : '';
  const norm = normalizePredictionIdeaEmail(emailRaw);
  if (!norm || norm.length > 500 || !EMAIL_RE.test(norm)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  try {
    const app = getFirebaseAdminApp();
    const db = getDatabase(app);
    const key = predictionIdeaEmailBlocklistKey(norm);
    await db.ref(`${predictionIdeaBlockedEmailsRoot()}/${key}`).set({
      email: norm,
      blockedAt: ServerValue.TIMESTAMP,
    });
    return NextResponse.json({ ok: true, email: norm });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Unblock one email. */
export async function DELETE(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const o = body as Record<string, unknown>;
  const emailRaw = typeof o.email === 'string' ? o.email : '';
  const norm = normalizePredictionIdeaEmail(emailRaw);
  if (!norm || !EMAIL_RE.test(norm)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  try {
    const app = getFirebaseAdminApp();
    const db = getDatabase(app);
    const key = predictionIdeaEmailBlocklistKey(norm);
    const ref = db.ref(`${predictionIdeaBlockedEmailsRoot()}/${key}`);
    const snap = await ref.once('value');
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Not on blocklist' }, { status: 404 });
    }
    await ref.remove();
    return NextResponse.json({ ok: true, email: norm });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
