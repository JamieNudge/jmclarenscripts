import { NextRequest, NextResponse } from 'next/server';
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
  type BplDisplayDay,
  type BplHubState,
} from '@/lib/bpl-hub';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { picksDateStringInTimeZone, picksTimeZoneFromEnv, statStrikeRtdbPathsFromEnv } from '@/lib/best-picks-firebase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** When `?day` matches server London date key, CDN caches per day (no cross-midnight mix-up). */
const CACHE_HEADER_DAY_KEYED = 'public, s-maxage=86400, stale-while-revalidate=3600';

const MAX_RECONCILE_PAST_DAYS = 3;

function cacheControlForDayQuery(dayParam: string | null, currentKey: string): string {
  const d = dayParam?.trim();
  if (d && d === currentKey) {
    return CACHE_HEADER_DAY_KEYED;
  }
  return 'no-store';
}

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
  const emptyDay: BplDisplayDay = { fixtures: [], bestPerformingFixtureCount: 0, withBookmakerOddsFixtureCount: 0 };
  return NextResponse.json(
    buildBplHubPublicPayload(
      newEmptyHub(),
      now,
      currentKey,
      prev,
      emptyDay,
      emptyDay,
      'BPL metrics require server Firebase (FIREBASE_SERVICE_ACCOUNT_JSON).',
    ),
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function GET(req: NextRequest) {
  const a = adminOrNull();
  if (!a) {
    return misconfiguredResponse();
  }
  const { db } = a;
  const tz = picksTimeZoneFromEnv();
  const now = Date.now();
  const currentKey = picksDateStringInTimeZone(tz, new Date());
  const dayParam = req.nextUrl.searchParams.get('day');
  const cacheControl = cacheControlForDayQuery(dayParam, currentKey);
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

  const currentDay = getBplDisplayRows(currentKey, curSel, curEx, now);
  const previousDay = getBplDisplayRows(previousKey, prSel, prEx, now);
  const updated: BplHubState = {
    ...hub,
    current: { dateKey: currentKey, generatedAtMs: now, fixtures: currentDay.fixtures },
    previous: { dateKey: previousKey, generatedAtMs: now, fixtures: previousDay.fixtures },
  };

  try {
    await db.ref(hubPath).set(updated);
  } catch {
    // read-only deploy or rules: still return JSON for UI
  }

  const payload = buildBplHubPublicPayload(updated, now, currentKey, previousKey, currentDay, previousDay);
  return NextResponse.json(payload, { headers: { 'Cache-Control': cacheControl } });
}
