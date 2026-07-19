import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { STATSTRIKE_PASS_COOKIE, isPassActive } from '@/lib/statstrike/pass';
import {
  clearClaimToken,
  getClaimToken,
  markPassClaimed,
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
 * POST: claim access after Lemon redirect (`claim` key from checkout custom data).
 * Sets httpOnly cookie; clears one-time claim token.
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
    // Webhook may lag behind redirect — tell client to retry briefly.
    return jsonNoStore({ error: 'Pass not ready yet', retry: true }, { status: 409 });
  }

  if (claim.expiresAt && !isPassActive({ expiresAt: claim.expiresAt })) {
    await clearClaimToken(claimKey);
    return jsonNoStore({ error: 'Pass already expired' }, { status: 410 });
  }

  const expires = claim.expiresAt ? new Date(claim.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const jar = cookies();
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
  });
}

/** DELETE: clear pass cookie (does not refund). */
export async function DELETE() {
  const jar = cookies();
  jar.set(STATSTRIKE_PASS_COOKIE, '', { ...passCookieOptions(new Date(0)), maxAge: 0 });
  return jsonNoStore({ unlocked: false });
}
