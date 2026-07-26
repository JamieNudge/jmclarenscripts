import Stripe from 'stripe';
import type { StatStrikePassAmountGbp } from '@/lib/statstrike/pass-constants';
import {
  amountGbpToMinor,
  isStatStrikePassAmountGbp,
  statStrikePublicOrigin,
} from '@/lib/statstrike/pass';

export type StripePassCheckoutInput = {
  amountGbp: StatStrikePassAmountGbp;
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

/** Optional pre-created Price IDs; otherwise Checkout uses price_data. */
export function stripePriceIdForAmount(amountGbp: StatStrikePassAmountGbp): string | null {
  const map: Record<StatStrikePassAmountGbp, string | undefined> = {
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
  if (!isStatStrikePassAmountGbp(input.amountGbp)) {
    throw new Error('Invalid pass amount.');
  }

  const stripe = getStripeClient();
  const origin = statStrikePublicOrigin();
  const successUrl = `${origin}/support/statstrike/success?claim=${encodeURIComponent(input.claimKey)}`;
  const cancelUrl = `${origin}/support/statstrike/cancelled`;

  const metadata: Record<string, string> = {
    claimKey: input.claimKey,
    amountGbp: String(input.amountGbp),
    amountMinor: String(amountGbpToMinor(input.amountGbp)),
    marketingConsent: input.marketingConsent ? '1' : '0',
    surveyConsent: input.surveyConsent ? '1' : '0',
    consentTextVersion: input.consentTextVersion,
    purchase_type: 'supporter_pass_24h',
    entitlement_type: 'statstrike_full_access',
    product: 'statstrike_24h_pass',
  };

  const priceId = stripePriceIdForAmount(input.amountGbp);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            unit_amount: amountGbpToMinor(input.amountGbp),
            product_data: {
              name: 'StatStrike Supporter Pass (24 hours)',
              description:
                'Full StatStrike web access for 24 hours. Every contribution amount unlocks the same access.',
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
    // Hosted Checkout; no browser Stripe.js required for redirect.
  });

  if (!session.url) {
    throw new Error('Stripe Checkout Session missing url.');
  }

  return { url: session.url, checkoutSessionId: session.id };
}

export function parseCheckoutSessionMetadata(session: Stripe.Checkout.Session): {
  claimKey: string | null;
  amountGbp: number | null;
  marketingConsent: boolean;
  surveyConsent: boolean;
  consentTextVersion: string | null;
  purchaseType: string | null;
} {
  const m = session.metadata ?? {};
  const amountRaw = m.amountGbp != null ? Number(m.amountGbp) : null;
  return {
    claimKey: typeof m.claimKey === 'string' && m.claimKey ? m.claimKey : null,
    amountGbp: amountRaw != null && Number.isFinite(amountRaw) ? amountRaw : null,
    marketingConsent: m.marketingConsent === '1' || m.marketingConsent === 'true',
    surveyConsent: m.surveyConsent === '1' || m.surveyConsent === 'true',
    consentTextVersion: typeof m.consentTextVersion === 'string' ? m.consentTextVersion : null,
    purchaseType: typeof m.purchase_type === 'string' ? m.purchase_type : null,
  };
}
