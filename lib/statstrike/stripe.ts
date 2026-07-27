import Stripe from 'stripe';
import type { StatStrikePassDuration } from '@/lib/statstrike/pass-constants';
import {
  amountGbpToMinor,
  isValidPassPurchase,
  passDurationLabel,
  passHoursFor,
  purchaseTypeForDuration,
  statStrikePublicOrigin,
} from '@/lib/statstrike/pass';

export type StripePassCheckoutInput = {
  duration: StatStrikePassDuration;
  amountGbp: number;
  email?: string;
  marketingConsent: boolean;
  surveyConsent: boolean;
  consentTextVersion: string;
  claimKey: string;
};

function stripeSecretKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

function stripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

/** Optional pre-created Price IDs for 24h tiers only; otherwise Checkout uses price_data. */
export function stripePriceIdForAmount(
  amountGbp: number,
  duration: StatStrikePassDuration,
): string | null {
  if (duration !== '24h') return null;
  const map: Record<number, string | undefined> = {
    1: process.env.STRIPE_PRICE_ID_1?.trim(),
    3: process.env.STRIPE_PRICE_ID_3?.trim(),
    5: process.env.STRIPE_PRICE_ID_5?.trim(),
    10: process.env.STRIPE_PRICE_ID_10?.trim(),
  };
  return map[amountGbp] || null;
}

export function isStripePassConfigured(): boolean {
  return Boolean(stripeSecretKey() && stripeWebhookSecret());
}

export function getStripeClient(): Stripe {
  const key = stripeSecretKey();
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  });
}

export function constructStripeWebhookEvent(rawBody: string, signature: string | null): Stripe.Event {
  const secret = stripeWebhookSecret();
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  if (!signature) throw new Error('Missing Stripe-Signature header');
  return getStripeClient().webhooks.constructEvent(rawBody, signature, secret);
}

export async function createStripePassCheckout(
  input: StripePassCheckoutInput,
): Promise<{ url: string; checkoutSessionId: string }> {
  if (!isValidPassPurchase(input.duration, input.amountGbp)) {
    throw new Error('Invalid pass amount or duration.');
  }

  const stripe = getStripeClient();
  const origin = statStrikePublicOrigin();
  const successUrl = `${origin}/support/statstrike/success?claim=${encodeURIComponent(input.claimKey)}`;
  const cancelUrl = `${origin}/support/statstrike/cancelled`;
  const durationHours = passHoursFor(input.duration);
  const purchaseType = purchaseTypeForDuration(input.duration);
  const durationLabel = passDurationLabel(input.duration);
  const productLabel =
    input.duration === '7d'
      ? 'StatStrike Supporter Pass (7 days)'
      : 'StatStrike Supporter Pass (24 hours)';

  const metadata: Record<string, string> = {
    claimKey: input.claimKey,
    amountGbp: String(input.amountGbp),
    amountMinor: String(amountGbpToMinor(input.amountGbp)),
    duration: input.duration,
    durationHours: String(durationHours),
    marketingConsent: input.marketingConsent ? '1' : '0',
    surveyConsent: input.surveyConsent ? '1' : '0',
    consentTextVersion: input.consentTextVersion,
    purchase_type: purchaseType,
    entitlement_type: 'statstrike_full_access',
    product: input.duration === '7d' ? 'statstrike_7d_pass' : 'statstrike_24h_pass',
  };

  const priceId = stripePriceIdForAmount(input.amountGbp, input.duration);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            unit_amount: amountGbpToMinor(input.amountGbp),
            product_data: {
              name: productLabel,
              description: `Full StatStrike web access for ${durationLabel.replace('-', ' ')}. Every contribution amount unlocks the same access.`,
            },
          },
        },
      ];

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: input.email,
    metadata,
    payment_intent_data: {
      metadata,
    },
  });

  if (!session.url) {
    throw new Error('Stripe Checkout Session missing url.');
  }

  return { url: session.url, checkoutSessionId: session.id };
}

export function parseCheckoutSessionMetadata(session: Stripe.Checkout.Session): {
  claimKey: string | null;
  amountGbp: number | null;
  duration: StatStrikePassDuration | null;
  durationHours: number | null;
  marketingConsent: boolean;
  surveyConsent: boolean;
  consentTextVersion: string | null;
  purchaseType: string | null;
} {
  const m = session.metadata ?? {};
  const amountRaw = m.amountGbp != null ? Number(m.amountGbp) : null;
  const hoursRaw = m.durationHours != null ? Number(m.durationHours) : null;
  const duration =
    m.duration === '7d' || m.duration === '24h'
      ? m.duration
      : m.purchase_type === 'supporter_pass_7d'
        ? '7d'
        : m.purchase_type === 'supporter_pass_24h'
          ? '24h'
          : null;
  return {
    claimKey: typeof m.claimKey === 'string' && m.claimKey ? m.claimKey : null,
    amountGbp: amountRaw != null && Number.isFinite(amountRaw) ? amountRaw : null,
    duration,
    durationHours: hoursRaw != null && Number.isFinite(hoursRaw) ? hoursRaw : null,
    marketingConsent: m.marketingConsent === '1' || m.marketingConsent === 'true',
    surveyConsent: m.surveyConsent === '1' || m.surveyConsent === 'true',
    consentTextVersion: typeof m.consentTextVersion === 'string' ? m.consentTextVersion : null,
    purchaseType: typeof m.purchase_type === 'string' ? m.purchase_type : null,
  };
}

const PASS_WEBHOOK_PATH = '/api/statstrike/pass/webhook';
const PASS_WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  'checkout.session.completed',
];

/** Ensure a Stripe webhook endpoint targets this deployment's pass route. */
export async function ensureStatStrikePassWebhookEndpoint(targetUrl: string): Promise<{
  id: string;
  url: string;
  action: 'created' | 'updated' | 'unchanged';
  /** Present only when Stripe creates a new endpoint (rotate STRIPE_WEBHOOK_SECRET). */
  signingSecret: string | null;
}> {
  const stripe = getStripeClient();
  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  const match = existing.data.find((e) => e.url.includes(PASS_WEBHOOK_PATH));
  if (match) {
    if (match.url === targetUrl) {
      return { id: match.id, url: match.url, action: 'unchanged', signingSecret: null };
    }
    const updated = await stripe.webhookEndpoints.update(match.id, { url: targetUrl });
    return { id: updated.id, url: updated.url, action: 'updated', signingSecret: null };
  }
  const created = await stripe.webhookEndpoints.create({
    url: targetUrl,
    enabled_events: PASS_WEBHOOK_EVENTS,
    description: 'StatStrike supporter pass (24h / 7d)',
  });
  return {
    id: created.id,
    url: created.url,
    action: 'created',
    signingSecret: created.secret ?? null,
  };
}
