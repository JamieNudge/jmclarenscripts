import { randomBytes } from 'node:crypto';
import { NextRequest } from 'next/server';
import {
  STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
  amountGbpToMinor,
  hashPassAccessToken,
  isStatStrikePassAmountGbp,
  mintPassAccessToken,
  passExpiresAtFrom,
  type StatStrikePassRecord,
} from '@/lib/statstrike/pass';
import { createPassRecord } from '@/lib/statstrike/pass-store';
import { parseConsentFlag } from '@/lib/statstrike/pass-constants';
import { jsonNoStore } from '@/lib/statstrike/pass-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Preview/QA only: mint a pass + claim key without Stripe.
 * Requires STATSTRIKE_PASS_TEST_SECRET and must not run when unset.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STATSTRIKE_PASS_TEST_SECRET?.trim();
  if (!secret) {
    return jsonNoStore({ error: 'Test mint disabled' }, { status: 404 });
  }

  const auth = req.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (bearer !== secret) {
    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const o = (body && typeof body === 'object' && !Array.isArray(body) ? body : {}) as Record<
    string,
    unknown
  >;

  const amountRaw = typeof o.amountGbp === 'number' ? o.amountGbp : Number(o.amountGbp ?? 1);
  const amountGbp = isStatStrikePassAmountGbp(amountRaw) ? amountRaw : 1;
  const createdAt = new Date().toISOString();
  const rawToken = mintPassAccessToken();
  const passId = `pass_test_${randomBytes(8).toString('hex')}`;
  const claimKey = randomBytes(24).toString('base64url');
  const sessionId = `cs_test_${Date.now()}_${randomBytes(4).toString('hex')}`;

  const pass: StatStrikePassRecord = {
    passId,
    provider: 'stripe',
    stripeCheckoutSessionId: sessionId,
    stripePaymentIntentId: null,
    stripeEventId: null,
    amountGbp,
    amountMinor: amountGbpToMinor(amountGbp),
    currency: 'gbp',
    purchaseType: 'supporter_pass_24h',
    createdAt,
    expiresAt: passExpiresAtFrom(createdAt),
    email: typeof o.email === 'string' ? o.email.trim() : null,
    marketingConsent: parseConsentFlag(o.marketingConsent),
    surveyConsent: parseConsentFlag(o.surveyConsent),
    consentAt: createdAt,
    consentTextVersion: STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
    tokenHash: hashPassAccessToken(rawToken),
    welcomeEmailSentAt: null,
    surveyEmailSentAt: null,
    claimedAt: null,
  };

  await createPassRecord(pass, { claimKey, rawTokenForClaimIndex: rawToken });

  return jsonNoStore({
    ok: true,
    passId,
    claimKey,
    expiresAt: pass.expiresAt,
    claimUrl: `/support/statstrike/success?claim=${encodeURIComponent(claimKey)}`,
  });
}
