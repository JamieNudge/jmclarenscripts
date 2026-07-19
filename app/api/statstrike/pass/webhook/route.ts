import { NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';
import {
  STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
  hashPassAccessToken,
  isStatStrikePassAmountGbp,
  mintPassAccessToken,
  parseConsentFlag,
  passExpiresAtFrom,
  type StatStrikePassRecord,
} from '@/lib/statstrike/pass';
import { parseLemonOrderCreated, verifyLemonWebhookSignature } from '@/lib/statstrike/lemon';
import { createPassRecord, markWelcomeEmailSent } from '@/lib/statstrike/pass-store';
import { sendStatStrikePassWelcomeEmail } from '@/lib/send-statstrike-pass-email';
import { jsonNoStore } from '@/lib/statstrike/pass-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Lemon Squeezy signed webhook — order_created mints a 24h pass. */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature');
  if (!verifyLemonWebhookSignature(rawBody, signature)) {
    return jsonNoStore({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonNoStore({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseLemonOrderCreated(payload);
  if (!parsed) {
    return jsonNoStore({ error: 'Unrecognized payload' }, { status: 400 });
  }
  if (parsed.eventName !== 'order_created') {
    return jsonNoStore({ ok: true, ignored: parsed.eventName || true });
  }

  const custom = parsed.custom;
  if (custom.product && custom.product !== 'statstrike_24h_pass') {
    return jsonNoStore({ ok: true, ignored: 'other_product' });
  }

  const amountFromCustom = Number(custom.amountGbp);
  const amountGbp = isStatStrikePassAmountGbp(amountFromCustom)
    ? amountFromCustom
    : isStatStrikePassAmountGbp(parsed.totalGbp ?? -1)
      ? (parsed.totalGbp as typeof amountFromCustom)
      : 1;

  const createdAt = new Date().toISOString();
  const rawToken = mintPassAccessToken();
  const passId = `pass_${randomBytes(12).toString('hex')}`;
  const claimKey = typeof custom.claimKey === 'string' ? custom.claimKey : undefined;

  const pass: StatStrikePassRecord = {
    passId,
    lemonOrderId: parsed.orderId,
    lemonCheckoutId: parsed.checkoutId,
    amountGbp,
    createdAt,
    expiresAt: passExpiresAtFrom(createdAt),
    email: parsed.email,
    marketingConsent: parseConsentFlag(custom.marketingConsent),
    surveyConsent: parseConsentFlag(custom.surveyConsent),
    consentAt: createdAt,
    consentTextVersion: custom.consentTextVersion || STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
    tokenHash: hashPassAccessToken(rawToken),
    welcomeEmailSentAt: null,
    surveyEmailSentAt: null,
    claimedAt: null,
  };

  let created = true;
  try {
    const result = await createPassRecord(pass, {
      claimKey,
      rawTokenForClaimIndex: rawToken,
    });
    created = result.created;
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Store failed';
    return jsonNoStore({ error: msg }, { status: 500 });
  }

  if (created && pass.email) {
    try {
      const sent = await sendStatStrikePassWelcomeEmail({
        to: pass.email,
        amountGbp: pass.amountGbp,
        expiresAt: pass.expiresAt,
        marketingConsent: pass.marketingConsent,
      });
      if (sent) await markWelcomeEmailSent(pass.passId, new Date().toISOString());
    } catch (e) {
      console.error('[statstrike-pass] welcome email failed', e);
    }
  }

  return jsonNoStore({ ok: true, created, passId: pass.passId });
}
