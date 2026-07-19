import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import type { StatStrikePassRecord } from '@/lib/statstrike/pass';

const DEFAULT_ROOT = 'statstrikePasses';

export function statStrikePassesRoot(): string {
  return process.env.FIREBASE_STATSTRIKE_PASSES_ROOT?.trim() || DEFAULT_ROOT;
}

export function passByIdPath(passId: string): string {
  return `${statStrikePassesRoot()}/byId/${passId}`;
}

export function passByTokenHashPath(tokenHash: string): string {
  return `${statStrikePassesRoot()}/byTokenHash/${tokenHash}`;
}

export function passByOrderIdPath(lemonOrderId: string): string {
  return `${statStrikePassesRoot()}/byOrderId/${lemonOrderId}`;
}

export function passByCheckoutIdPath(lemonCheckoutId: string): string {
  return `${statStrikePassesRoot()}/byCheckoutId/${lemonCheckoutId}`;
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

export async function getPassIdByOrderId(lemonOrderId: string): Promise<string | null> {
  const snap = await db().ref(passByOrderIdPath(lemonOrderId)).once('value');
  return typeof snap.val() === 'string' ? snap.val() : null;
}

export async function getPassIdByCheckoutId(lemonCheckoutId: string): Promise<string | null> {
  const snap = await db().ref(passByCheckoutIdPath(lemonCheckoutId)).once('value');
  return typeof snap.val() === 'string' ? snap.val() : null;
}

/**
 * Create a pass and index lookups. Idempotent on lemonOrderId when already present.
 */
export async function createPassRecord(
  pass: StatStrikePassRecord,
  opts?: { claimKey?: string; rawTokenForClaimIndex?: string },
): Promise<{ created: boolean; pass: StatStrikePassRecord }> {
  const existingId = await getPassIdByOrderId(pass.lemonOrderId);
  if (existingId) {
    const existing = await getPassById(existingId);
    if (existing) return { created: false, pass: existing };
  }

  const updates: Record<string, unknown> = {
    [passByIdPath(pass.passId)]: pass,
    [passByTokenHashPath(pass.tokenHash)]: pass.passId,
    [passByOrderIdPath(pass.lemonOrderId)]: pass.passId,
  };
  if (pass.lemonCheckoutId) {
    updates[passByCheckoutIdPath(pass.lemonCheckoutId)] = pass.passId;
  }
  // One-time claim index (claimKey → token) for post-checkout cookie; cleared after claim.
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
