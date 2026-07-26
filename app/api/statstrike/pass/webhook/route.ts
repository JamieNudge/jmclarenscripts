import { NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';
import type Stripe from 'stripe';
import {
  STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
  amountGbpToMinor,
  hashPassAccessToken,
  isStatStrikePassAmountGbp,
  mintPassAccessToken,
  passExpiresAtFrom,
  type StatStrikePassRecord,
} from '@/lib/statstrike/pass';
import {
  constructStripeWebhookEvent,
  parseCheckoutSessionMetadata,
} from '@/lib/statstrike/stripe';
import {
  createPassRecord,
  markStripeEventProcessed,
  markWelcomeEmailSent,
  wasStripeEventProcessed,
} from '@/lib/statstrike/pass-store';
import { sendStatStrikePassWelcomeEmail } from '@/lib/send-statstrike-pass-email';
import { jsonNoStore } from '@/lib/statstrike/pass-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function fulfilCheckoutSession(
  session: Stripe.Checkout.Session,
  stripeEventId: string,
): Promise<{ created: boolean; passId: string | null; ignored?: string }> {
  const meta = parseCheckoutSessionMetadata(session);

  if (meta.purchaseType && meta.purchaseType !== 'supporter_pass_24h') {
    return { created: false, passId: null, ignored: 'other_purchase_type' };
  }
  if (session.currency && session.currency.toLowerCase() !== 'gbp') {
    return { created: false, passId: null, ignored: 'non_gbp' };
  }
  if (session.payment_status !== 'paid') {
    return { created: false, passId: null, ignored: 'not_paid' };
  }

  const amountGbp = isStatStrikePassAmountGbp(meta.amountGbp ?? -1)
    ? (meta.amountGbp as number)
    : session.amount_total != null
      ? session.amount_total / 100
      : 1;
  if (!isStatStrikePassAmountGbp(amountGbp)) {
    return { created: false, passId: null, ignored: 'invalid_amount' };
  }

  const createdAt = new Date().toISOString();
  const rawToken = mintPassAccessToken();
  const passId = `pass_${randomBytes(12).toString('hex')}`;
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent && typeof session.payment_intent === 'object'
        ? session.payment_intent.id
        : null;

  const pass: StatStrikePassRecord = {
    passId,
    provider: 'stripe',
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    stripeEventId,
    amountGbp,
    amountMinor: amountGbpToMinor(amountGbp),
    currency: 'gbp',
    purchaseType: 'supporter_pass_24h',
    createdAt,
    expiresAt: passExpiresAtFrom(createdAt),
    email: session.customer_details?.email || session.customer_email || null,
    marketingConsent: meta.marketingConsent,
    surveyConsent: meta.surveyConsent,
    consentAt: createdAt,
    consentTextVersion: meta.consentTextVersion || STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
    tokenHash: hashPassAccessToken(rawToken),
    welcomeEmailSentAt: null,
    surveyEmailSentAt: null,
    claimedAt: null,
  };

  const result = await createPassRecord(pass, {
    claimKey: meta.claimKey || undefined,
    rawTokenForClaimIndex: rawToken,
  });

  if (result.created && pass.email) {
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

  return { created: result.created, passId: result.pass.passId };
}

/** Stripe signed webhook — checkout.session.completed mints a 24h pass. */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = constructStripeWebhookEvent(rawBody, signature);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid signature';
    return jsonNoStore({ error: msg }, { status: 400 });
  }

  if (await wasStripeEventProcessed(event.id)) {
    return jsonNoStore({ ok: true, duplicate: true });
  }

  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    await markStripeEventProcessed(event.id, {
      type: event.type,
      at: new Date().toISOString(),
    });
    return jsonNoStore({ ok: true, ignored: event.type });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  let result: { created: boolean; passId: string | null; ignored?: string };
  try {
    result = await fulfilCheckoutSession(session, event.id);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Fulfilment failed';
    return jsonNoStore({ error: msg }, { status: 500 });
  }

  await markStripeEventProcessed(event.id, {
    type: event.type,
    passId: result.passId || undefined,
    at: new Date().toISOString(),
  });

  return jsonNoStore({
    ok: true,
    created: result.created,
    passId: result.passId,
    ignored: result.ignored,
  });
}
