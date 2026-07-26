import { randomBytes } from 'node:crypto';
import { NextRequest } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import {
  STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
  isStatStrikePassAmountGbp,
  parseConsentFlag,
} from '@/lib/statstrike/pass';
import { createStripePassCheckout, isStripePassConfigured } from '@/lib/statstrike/stripe';
import { jsonNoStore } from '@/lib/statstrike/pass-session';
import {
  allowCheckoutPost,
  clientIpFromRequest,
} from '@/lib/statstrike/checkout-rate-limit';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import {
  DEFAULT_STATSTRIKE_WEB_CONFIG,
  parseStatStrikeWebConfig,
  statStrikeWebConfigRtdbPath,
} from '@/lib/statstrike/web-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function readSupporterPassSalesEnabled(): Promise<boolean> {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
      return DEFAULT_STATSTRIKE_WEB_CONFIG.supporterPassSalesEnabled;
    }
    const snap = await getDatabase(getFirebaseAdminApp())
      .ref(statStrikeWebConfigRtdbPath())
      .once('value');
    return parseStatStrikeWebConfig(snap.val()).supporterPassSalesEnabled;
  } catch {
    return DEFAULT_STATSTRIKE_WEB_CONFIG.supporterPassSalesEnabled;
  }
}

/** POST: create Stripe Checkout Session for a 24h StatStrike Supporter Pass. */
export async function POST(req: NextRequest) {
  const salesEnabled = await readSupporterPassSalesEnabled();

  if (!allowCheckoutPost(clientIpFromRequest(req))) {
    return jsonNoStore(
      {
        error: 'Too many checkout attempts. Please wait a few minutes and try again.',
        salesEnabled,
      },
      { status: 429 },
    );
  }

  if (!isStripePassConfigured()) {
    return jsonNoStore(
      {
        error:
          'Stripe checkout is not configured yet. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.',
        configured: false,
        salesEnabled: false,
      },
      { status: 503 },
    );
  }

  if (!salesEnabled) {
    return jsonNoStore(
      {
        error: '24-hour Supporter Pass sales are temporarily unavailable.',
        configured: true,
        salesEnabled: false,
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ error: 'Invalid JSON', salesEnabled: true }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonNoStore({ error: 'Invalid body', salesEnabled: true }, { status: 400 });
  }
  const o = body as Record<string, unknown>;

  const amountRaw = typeof o.amountGbp === 'number' ? o.amountGbp : Number(o.amountGbp);
  if (!isStatStrikePassAmountGbp(amountRaw)) {
    return jsonNoStore({ error: 'Choose £1, £3, £5, or £10.', salesEnabled: true }, { status: 400 });
  }

  const email =
    typeof o.email === 'string' && o.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email.trim())
      ? o.email.trim()
      : undefined;

  const marketingConsent = parseConsentFlag(o.marketingConsent);
  const surveyConsent = parseConsentFlag(o.surveyConsent);
  const consentTextVersion =
    typeof o.consentTextVersion === 'string' && o.consentTextVersion.trim()
      ? o.consentTextVersion.trim()
      : STATSTRIKE_PASS_CONSENT_TEXT_VERSION;

  const claimKey = randomBytes(24).toString('base64url');

  try {
    const { url, checkoutSessionId } = await createStripePassCheckout({
      amountGbp: amountRaw,
      email,
      marketingConsent,
      surveyConsent,
      consentTextVersion,
      claimKey,
    });
    return jsonNoStore({ url, checkoutSessionId, claimKey, configured: true, salesEnabled: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Checkout failed';
    return jsonNoStore({ error: msg, configured: true, salesEnabled: true }, { status: 502 });
  }
}

export async function GET() {
  const salesEnabled = await readSupporterPassSalesEnabled();
  return jsonNoStore({
    configured: isStripePassConfigured(),
    salesEnabled,
    amountsGbp: [1, 3, 5, 10],
    consentTextVersion: STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
    provider: 'stripe',
  });
}
