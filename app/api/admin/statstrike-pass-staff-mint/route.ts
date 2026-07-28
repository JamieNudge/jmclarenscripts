import { randomBytes } from 'node:crypto';
import { NextRequest } from 'next/server';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import {
  STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
  amountGbpToMinor,
  hashPassAccessToken,
  mintPassAccessToken,
  passExpiresAtFrom,
  passHoursFor,
  purchaseTypeForDuration,
  type StatStrikePassRecord,
} from '@/lib/statstrike/pass';
import { createPassRecord } from '@/lib/statstrike/pass-store';
import { jsonNoStore } from '@/lib/statstrike/pass-session';
import { statStrikePublicOrigin } from '@/lib/statstrike/pass';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Owner QA: mint a 7-day pass + claim key without Stripe.
 * Auth: ADMIN_MANUAL_PICKS_KEY Bearer (same as other /api/admin routes).
 */
export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) {
    return jsonNoStore({ error: 'Admin API not configured' }, { status: 503 });
  }
  if (!isManualPicksAdminAuthorized(req)) {
    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 });
  }

  const duration = '7d' as const;
  const durationHours = passHoursFor(duration);
  const amountGbp = 0;
  const createdAt = new Date().toISOString();
  const rawToken = mintPassAccessToken();
  const passId = `pass_staff_${randomBytes(8).toString('hex')}`;
  const claimKey = randomBytes(24).toString('base64url');
  const sessionId = `staff_${Date.now()}_${randomBytes(4).toString('hex')}`;

  const pass: StatStrikePassRecord = {
    passId,
    provider: 'stripe',
    stripeCheckoutSessionId: sessionId,
    stripePaymentIntentId: null,
    stripeEventId: null,
    amountGbp,
    amountMinor: amountGbpToMinor(amountGbp),
    currency: 'gbp',
    purchaseType: purchaseTypeForDuration(duration),
    durationHours,
    createdAt,
    expiresAt: passExpiresAtFrom(createdAt, durationHours),
    email: null,
    marketingConsent: false,
    surveyConsent: false,
    consentAt: createdAt,
    consentTextVersion: STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
    tokenHash: hashPassAccessToken(rawToken),
    welcomeEmailSentAt: null,
    surveyEmailSentAt: null,
    claimedAt: null,
  };

  try {
    await createPassRecord(pass, { claimKey, rawTokenForClaimIndex: rawToken });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Mint failed';
    return jsonNoStore({ error: msg }, { status: 500 });
  }

  return jsonNoStore({
    ok: true,
    passId,
    claimKey,
    expiresAt: pass.expiresAt,
    duration,
    durationHours,
    /** Always claim on the public hub so the cookie matches thegoallab.net browsing. */
    claimUrl: `${statStrikePublicOrigin()}/support/statstrike/success?claim=${encodeURIComponent(claimKey)}`,
  });
}
