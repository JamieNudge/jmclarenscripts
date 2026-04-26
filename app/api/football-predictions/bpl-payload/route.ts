import { NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import {
  applyReconciliationForDate,
  bplHubRtdbPath,
  buildBplHubPublicPayload,
  ensureAllTimeTrackingStart,
  getBplDisplayRows,
  newEmptyHub,
  parseHub,
  previousDateKeyFrom,
  type BplHubState,
} from '@/lib/bpl-hub';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { picksDateStringInTimeZone, picksTimeZoneFromEnv, statStrikeRtdbPathsFromEnv } from '@/lib/best-picks-firebase';

export const runtime = 'nodejs';

const CACHE_HEADER = 'public, s-maxage=300, stale-while-revalidate=900';

const MAX_RECONCILE_PAST_DAYS = 3;

function adminOrNull() {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
      return null;
    }
    const app = getFirebaseAdminApp();
    return { db: getDatabase(app) };
  } catch {
    return null;
  }
}

function misconfiguredResponse() {
  const now = Date.now();
  const tz = picksTimeZoneFromEnv();
  const currentKey = picksDateStringInTimeZone(tz, new Date());
  const prev = previousDateKeyFrom(currentKey);
  return NextResponse.json(
    buildBplHubPublicPayload(
      newEmptyHub(),
      now,
      currentKey,
      prev,
      [],
      [],
      'BPL metrics require server Firebase (FIREBASE_SERVICE_ACCOUNT_JSON).',
    ),
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function GET() {
  const a = adminOrNull();
  if (!a) {
    return misconfiguredResponse();
  }
  const { db } = a;
  const tz = picksTimeZoneFromEnv();
  const now = Date.now();
  const currentKey = picksDateStringInTimeZone(tz, new Date());
  const previousKey = previousDateKeyFrom(currentKey);
  const hubPath = bplHubRtdbPath();

  let hub: BplHubState;
  try {
    const snap = await db.ref(hubPath).once('value');
    hub = parseHub(snap.val());
  } catch {
    hub = newEmptyHub();
  }

  {
    let dk = previousDateKeyFrom(currentKey);
    for (let i = 0; i < MAX_RECONCILE_PAST_DAYS; i += 1) {
      const { selectionPath, unanimousPath } = statStrikeRtdbPathsFromEnv(dk);
      try {
        const [sSel, sEx] = await Promise.all([db.ref(selectionPath).once('value'), db.ref(unanimousPath).once('value')]);
        const { hub: h } = applyReconciliationForDate(hub, dk, sSel.val(), sEx.val(), now);
        hub = h;
      } catch {
        // skip date on read errors
      }
      dk = previousDateKeyFrom(dk);
    }
  }

  hub = ensureAllTimeTrackingStart(hub, currentKey);

  const { selectionPath: sCur, unanimousPath: uCur } = statStrikeRtdbPathsFromEnv(currentKey);
  const { selectionPath: sPr, unanimousPath: uPr } = statStrikeRtdbPathsFromEnv(previousKey);
  let curSel: unknown;
  let curEx: unknown;
  let prSel: unknown;
  let prEx: unknown;
  try {
    [curSel, curEx, prSel, prEx] = await Promise.all([
      db.ref(sCur).once('value'),
      db.ref(uCur).once('value'),
      db.ref(sPr).once('value'),
      db.ref(uPr).once('value'),
    ]).then(([a, b, c, d]) => [a.val(), b.val(), c.val(), d.val()]);
  } catch {
    curSel = null;
    curEx = null;
    prSel = null;
    prEx = null;
  }

  const currentFixtures = getBplDisplayRows(currentKey, curSel, curEx, now);
  const previousFixtures = getBplDisplayRows(previousKey, prSel, prEx, now);
  const updated: BplHubState = {
    ...hub,
    current: { dateKey: currentKey, generatedAtMs: now, fixtures: currentFixtures },
    previous: { dateKey: previousKey, generatedAtMs: now, fixtures: previousFixtures },
  };

  try {
    await db.ref(hubPath).set(updated);
  } catch {
    // read-only deploy or rules: still return JSON for UI
  }

  const payload = buildBplHubPublicPayload(updated, now, currentKey, previousKey, currentFixtures, previousFixtures);
  return NextResponse.json(payload, { headers: { 'Cache-Control': CACHE_HEADER } });
}
