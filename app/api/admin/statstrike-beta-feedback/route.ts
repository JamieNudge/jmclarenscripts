import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import { statstrikeBetaFeedbackSubmissionsRoot } from '@/lib/statstrike-beta-feedback-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function misconfigured() {
  return NextResponse.json(
    { error: 'Admin API not configured (ADMIN_MANUAL_PICKS_KEY and FIREBASE_SERVICE_ACCOUNT_JSON)' },
    { status: 503 },
  );
}

/** Owner-only: list all StatStrike Android beta feedback submissions (newest first). */
export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const app = getFirebaseAdminApp();
    const db = getDatabase(app);
    const snap = await db.ref(statstrikeBetaFeedbackSubmissionsRoot()).once('value');
    const val = snap.val() as Record<string, Record<string, unknown>> | null;
    const entries: Record<string, unknown>[] = [];
    if (val != null && typeof val === 'object' && !Array.isArray(val)) {
      for (const [id, row] of Object.entries(val)) {
        if (row == null || typeof row !== 'object' || Array.isArray(row)) continue;
        entries.push({ id, ...row });
      }
    }
    entries.sort((a, b) => (Number(b.submittedAt) || 0) - (Number(a.submittedAt) || 0));
    return NextResponse.json({ entries });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
