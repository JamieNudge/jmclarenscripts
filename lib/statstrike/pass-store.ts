import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import type { StatStrikePassRecord } from '@/lib/statstrike/pass';

const DEFAULT_ROOT = 'statstrikePasses';
const DEFAULT_SURVEYS_ROOT = 'statstrikePassSurveys';

export type StatStrikeWouldBuyAgain = 'yes' | 'maybe' | 'no';

export type StatStrikePassSurveyResponse = {
  id: string;
  passId: string;
  createdAt: string;
  /** Overall rating 1–5. Present on structured surveys. */
  rating?: number;
  wouldBuyAgain?: StatStrikeWouldBuyAgain;
  worked?: string;
  improve?: string;
  /** Legacy free-text responses only. */
  message?: string;
};

export function statStrikePassesRoot(): string {
  return process.env.FIREBASE_STATSTRIKE_PASSES_ROOT?.trim() || DEFAULT_ROOT;
}

export function statStrikePassSurveysRoot(): string {
  return process.env.FIREBASE_STATSTRIKE_PASS_SURVEYS_ROOT?.trim() || DEFAULT_SURVEYS_ROOT;
}

export function passByIdPath(passId: string): string {
  return `${statStrikePassesRoot()}/byId/${passId}`;
}

export function passByTokenHashPath(tokenHash: string): string {
  return `${statStrikePassesRoot()}/byTokenHash/${tokenHash}`;
}

export function passByCheckoutSessionPath(stripeCheckoutSessionId: string): string {
  return `${statStrikePassesRoot()}/byCheckoutSession/${stripeCheckoutSessionId}`;
}

export function stripeEventProcessedPath(stripeEventId: string): string {
  return `${statStrikePassesRoot()}/stripeEvents/${stripeEventId}`;
}

function db() {
  return getDatabase(getFirebaseAdminApp());
}

export async function getPassById(passId: string): Promise<StatStrikePassRecord | null> {
  const snap = await db().ref(passByIdPath(passId)).once('value');
  const v = snap.val();
  return v && typeof v === 'object' ? (v as StatStrikePassRecord) : null;
}

export async function getPassByTokenHash(tokenHash: string): Promise<StatStrikePassRecord | null> {
  const snap = await db().ref(passByTokenHashPath(tokenHash)).once('value');
  const passId = typeof snap.val() === 'string' ? snap.val() : null;
  if (!passId) return null;
  return getPassById(passId);
}

export async function getPassIdByCheckoutSession(
  stripeCheckoutSessionId: string,
): Promise<string | null> {
  const snap = await db().ref(passByCheckoutSessionPath(stripeCheckoutSessionId)).once('value');
  return typeof snap.val() === 'string' ? snap.val() : null;
}

export async function wasStripeEventProcessed(stripeEventId: string): Promise<boolean> {
  const snap = await db().ref(stripeEventProcessedPath(stripeEventId)).once('value');
  return Boolean(snap.val());
}

export async function markStripeEventProcessed(
  stripeEventId: string,
  meta: { type: string; passId?: string; at: string },
): Promise<void> {
  await db().ref(stripeEventProcessedPath(stripeEventId)).set(meta);
}

/**
 * Create a pass and index lookups. Idempotent on stripeCheckoutSessionId.
 */
export async function createPassRecord(
  pass: StatStrikePassRecord,
  opts?: { claimKey?: string; rawTokenForClaimIndex?: string },
): Promise<{ created: boolean; pass: StatStrikePassRecord }> {
  const existingId = await getPassIdByCheckoutSession(pass.stripeCheckoutSessionId);
  if (existingId) {
    const existing = await getPassById(existingId);
    if (existing) return { created: false, pass: existing };
  }

  const updates: Record<string, unknown> = {
    [passByIdPath(pass.passId)]: pass,
    [passByTokenHashPath(pass.tokenHash)]: pass.passId,
    [passByCheckoutSessionPath(pass.stripeCheckoutSessionId)]: pass.passId,
  };
  if (opts?.claimKey && opts?.rawTokenForClaimIndex) {
    updates[`${statStrikePassesRoot()}/claimTokens/${opts.claimKey}`] = {
      passId: pass.passId,
      token: opts.rawTokenForClaimIndex,
      expiresAt: pass.expiresAt,
    };
  }

  await db().ref().update(updates);
  return { created: true, pass };
}

export async function getClaimToken(
  claimKey: string,
): Promise<{ passId: string; token: string; expiresAt: string } | null> {
  const snap = await db().ref(`${statStrikePassesRoot()}/claimTokens/${claimKey}`).once('value');
  const v = snap.val();
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.passId !== 'string' || typeof o.token !== 'string') return null;
  return {
    passId: o.passId,
    token: o.token,
    expiresAt: typeof o.expiresAt === 'string' ? o.expiresAt : '',
  };
}

export async function clearClaimToken(claimKey: string): Promise<void> {
  await db().ref(`${statStrikePassesRoot()}/claimTokens/${claimKey}`).remove();
}

export async function markPassClaimed(passId: string, claimedAt: string): Promise<void> {
  await db().ref(passByIdPath(passId)).update({ claimedAt });
}

export async function updatePassExpiresAt(passId: string, expiresAt: string): Promise<void> {
  await db().ref(passByIdPath(passId)).update({ expiresAt });
}

export async function markWelcomeEmailSent(passId: string, at: string): Promise<void> {
  await db().ref(passByIdPath(passId)).update({ welcomeEmailSentAt: at });
}

export async function markSurveyEmailSent(passId: string, at: string): Promise<void> {
  await db().ref(passByIdPath(passId)).update({ surveyEmailSentAt: at });
}

/** Scan recent passes for survey due (Admin SDK; keep list modest). */
export async function listPassesForSurveySweep(limit = 200): Promise<StatStrikePassRecord[]> {
  const snap = await db().ref(`${statStrikePassesRoot()}/byId`).limitToLast(limit).once('value');
  const val = snap.val();
  if (!val || typeof val !== 'object') return [];
  return Object.values(val as Record<string, StatStrikePassRecord>);
}

/** Recent pass records for owner tooling. */
export async function listPassesForAdmin(limit = 300): Promise<StatStrikePassRecord[]> {
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(limit)));
  const snap = await db()
    .ref(`${statStrikePassesRoot()}/byId`)
    .limitToLast(safeLimit)
    .once('value');
  const val = snap.val();
  if (!val || typeof val !== 'object') return [];
  return Object.values(val as Record<string, StatStrikePassRecord>).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export async function withdrawPassMarketingConsent(passId: string): Promise<boolean> {
  const ref = db().ref(passByIdPath(passId));
  const snap = await ref.once('value');
  if (!snap.exists()) return false;
  await ref.update({
    marketingConsent: false,
    marketingConsentWithdrawnAt: new Date().toISOString(),
  });
  return true;
}

/**
 * Remove direct contact data while retaining entitlement and Stripe idempotency records.
 * This deliberately does not delete tokenHash or checkout indexes.
 */
export async function redactPassPii(passId: string): Promise<boolean> {
  const ref = db().ref(passByIdPath(passId));
  const snap = await ref.once('value');
  if (!snap.exists()) return false;
  await ref.update({
    email: null,
    marketingConsent: false,
    surveyConsent: false,
    piiRedactedAt: new Date().toISOString(),
  });
  return true;
}

export async function createSurveyResponse(input: {
  passId: string;
  rating: number;
  wouldBuyAgain: StatStrikeWouldBuyAgain;
  worked?: string;
  improve?: string;
}): Promise<StatStrikePassSurveyResponse> {
  const ref = db().ref(statStrikePassSurveysRoot()).push();
  if (!ref.key) throw new Error('Could not allocate survey response id');
  const response: StatStrikePassSurveyResponse = {
    id: ref.key,
    passId: input.passId,
    createdAt: new Date().toISOString(),
    rating: input.rating,
    wouldBuyAgain: input.wouldBuyAgain,
  };
  if (input.worked) response.worked = input.worked;
  if (input.improve) response.improve = input.improve;
  // RTDB rejects undefined — only write defined keys.
  await ref.set(response);
  return response;
}

export async function listSurveyResponses(
  limit = 300,
): Promise<StatStrikePassSurveyResponse[]> {
  const safeLimit = Math.max(1, Math.min(500, Math.trunc(limit)));
  const snap = await db()
    .ref(statStrikePassSurveysRoot())
    .limitToLast(safeLimit)
    .once('value');
  const val = snap.val();
  if (!val || typeof val !== 'object') return [];
  return Object.entries(val as Record<string, Omit<StatStrikePassSurveyResponse, 'id'>>)
    .map(([id, row]) => ({ ...row, id }))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
