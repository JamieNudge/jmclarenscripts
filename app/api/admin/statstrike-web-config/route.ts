import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import {
  normalizeStatStrikeWebConfigPatch,
  parseStatStrikeWebConfig,
  statStrikeWebConfigRtdbPath,
} from '@/lib/statstrike/web-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function misconfigured() {
  return NextResponse.json(
    { error: 'Admin API not configured (set ADMIN_MANUAL_PICKS_KEY and FIREBASE_SERVICE_ACCOUNT_JSON)' },
    { status: 503 },
  );
}

function configRef() {
  const app = getFirebaseAdminApp();
  const db = getDatabase(app);
  return db.ref(statStrikeWebConfigRtdbPath());
}

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snap = await configRef().once('value');
    const config = parseStatStrikeWebConfig(snap.val());
    return NextResponse.json({ config, path: statStrikeWebConfigRtdbPath() });
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

  const normalized = normalizeStatStrikeWebConfigPatch(body);
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  try {
    const path = statStrikeWebConfigRtdbPath();
    const snap = await configRef().once('value');
    const existing = parseStatStrikeWebConfig(snap.val());
    const record = {
      ...existing,
      ...normalized.patch,
      updatedAt: new Date().toISOString(),
    };
    await configRef().set(record);
    return NextResponse.json({ ok: true, config: record, path });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
