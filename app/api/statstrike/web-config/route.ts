import { NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import {
  DEFAULT_STATSTRIKE_WEB_CONFIG,
  parseStatStrikeWebConfig,
  statStrikeWebConfigRtdbPath,
} from '@/lib/statstrike/web-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Public read of StatStrike web blur flag.
 * Uses Admin SDK so it works even before RTDB rules grant client `.read` on this path.
 */
export async function GET() {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
      return NextResponse.json(
        { config: DEFAULT_STATSTRIKE_WEB_CONFIG, path: statStrikeWebConfigRtdbPath(), source: 'default' },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const app = getFirebaseAdminApp();
    const snap = await getDatabase(app).ref(statStrikeWebConfigRtdbPath()).once('value');
    const config = parseStatStrikeWebConfig(snap.val());
    return NextResponse.json(
      { config, path: statStrikeWebConfigRtdbPath(), source: 'rtdb' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json(
      { config: DEFAULT_STATSTRIKE_WEB_CONFIG, error: msg, source: 'error-default' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
