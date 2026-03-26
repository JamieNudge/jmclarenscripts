import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, ServerValue } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import { predictionIdeaSubmissionsRoot } from '@/lib/prediction-idea-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function misconfigured() {
  return NextResponse.json(
    { error: 'Admin API not configured (ADMIN_MANUAL_PICKS_KEY and FIREBASE_SERVICE_ACCOUNT_JSON)' },
    { status: 503 },
  );
}

/** Firebase RTDB keys must not contain . # $ / [ ] */
function isValidSubmissionId(id: string): boolean {
  return id.length > 0 && id.length <= 128 && !/[.#$\[\]/]/.test(id);
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/** Mark submission as read (idempotent). */
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) return unauthorized();

  const id = context.params.id;
  if (!isValidSubmissionId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const app = getFirebaseAdminApp();
    const db = getDatabase(app);
    const ref = db.ref(`${predictionIdeaSubmissionsRoot()}/${id}`);
    const snap = await ref.once('value');
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await ref.update({ read: true, readAt: ServerValue.TIMESTAMP });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Remove submission permanently. */
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) return unauthorized();

  const id = context.params.id;
  if (!isValidSubmissionId(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const app = getFirebaseAdminApp();
    const db = getDatabase(app);
    const ref = db.ref(`${predictionIdeaSubmissionsRoot()}/${id}`);
    const snap = await ref.once('value');
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await ref.remove();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
