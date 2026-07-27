import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import {
  STATSTRIKE_PASS_COOKIE,
  STATSTRIKE_PASS_HOURS,
  durationFromPurchaseType,
  hashPassAccessToken,
  isPassActive,
  passHoursFor,
  stackedPassExpiresAt,
} from '@/lib/statstrike/pass';
import {
  clearClaimToken,
  getClaimToken,
  getPassById,
  getPassByTokenHash,
  markPassClaimed,
  updatePassExpiresAt,
} from '@/lib/statstrike/pass-store';
import { jsonNoStore, passCookieOptions, readPassSessionFromCookies } from '@/lib/statstrike/pass-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET: current pass session for this browser. */
export async function GET() {
  const session = await readPassSessionFromCookies();
  return jsonNoStore(session);
}

/**
 * POST: claim access after Stripe success redirect (`claim` key from Checkout metadata).
 * If this browser already has an active pass, stack the new purchase duration onto remaining time.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ error: 'Invalid JSON' }, { status: 400 });
  }
  const claimKey =
    body && typeof body === 'object' && !Array.isArray(body)
      ? String((body as Record<string, unknown>).claimKey ?? '').trim()
      : '';
  if (!claimKey) {
    return jsonNoStore({ error: 'Missing claimKey' }, { status: 400 });
  }

  let claim;
  try {
    claim = await getClaimToken(claimKey);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Lookup failed';
    return jsonNoStore({ error: msg }, { status: 503 });
  }

  if (!claim) {
    return jsonNoStore({ error: 'Pass not ready yet', retry: true }, { status: 409 });
  }

  let claimedPass = null as Awaited<ReturnType<typeof getPassById>>;
  try {
    claimedPass = await getPassById(claim.passId);
  } catch {
    claimedPass = null;
  }
  const stackHours =
    claimedPass?.durationHours && Number.isFinite(claimedPass.durationHours)
      ? claimedPass.durationHours
      : passHoursFor(durationFromPurchaseType(claimedPass?.purchaseType));

  const jar = cookies();
  const existingToken = jar.get(STATSTRIKE_PASS_COOKIE)?.value;
  let existingPass = null as Awaited<ReturnType<typeof getPassByTokenHash>>;
  if (existingToken) {
    try {
      existingPass = await getPassByTokenHash(hashPassAccessToken(existingToken));
    } catch {
      existingPass = null;
    }
  }

  // Stack onto an already-active browser pass.
  if (existingPass && existingToken && isPassActive(existingPass)) {
    const extendedExpiresAt = stackedPassExpiresAt(existingPass.expiresAt, Date.now(), stackHours);
    try {
      await updatePassExpiresAt(existingPass.passId, extendedExpiresAt);
      await markPassClaimed(claim.passId, new Date().toISOString());
      await clearClaimToken(claimKey);
    } catch {
      // best-effort
    }
    jar.set(STATSTRIKE_PASS_COOKIE, existingToken, passCookieOptions(new Date(extendedExpiresAt)));
    return jsonNoStore({
      unlocked: true,
      expiresAt: extendedExpiresAt,
      passId: existingPass.passId,
      extended: true,
    });
  }

  if (claim.expiresAt && !isPassActive({ expiresAt: claim.expiresAt })) {
    await clearClaimToken(claimKey);
    return jsonNoStore({ error: 'Pass already expired' }, { status: 410 });
  }

  const expires = claim.expiresAt
    ? new Date(claim.expiresAt)
    : new Date(Date.now() + (stackHours || STATSTRIKE_PASS_HOURS) * 60 * 60 * 1000);
  jar.set(STATSTRIKE_PASS_COOKIE, claim.token, passCookieOptions(expires));

  try {
    await markPassClaimed(claim.passId, new Date().toISOString());
    await clearClaimToken(claimKey);
  } catch {
    // Cookie already set; indexes are best-effort.
  }

  return jsonNoStore({
    unlocked: true,
    expiresAt: claim.expiresAt || expires.toISOString(),
    passId: claim.passId,
    extended: false,
  });
}

/** DELETE: clear pass cookie (does not refund). */
export async function DELETE() {
  const jar = cookies();
  jar.set(STATSTRIKE_PASS_COOKIE, '', { ...passCookieOptions(new Date(0)), maxAge: 0 });
  return jsonNoStore({ unlocked: false });
}
