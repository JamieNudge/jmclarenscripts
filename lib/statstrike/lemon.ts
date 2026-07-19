import { createHmac, timingSafeEqual } from 'node:crypto';
import type { StatStrikePassAmountGbp } from '@/lib/statstrike/pass';
import { isStatStrikePassAmountGbp, statStrikePublicOrigin } from '@/lib/statstrike/pass';

const LS_API = 'https://api.lemonsqueezy.com/v1';

export type LemonPassCheckoutInput = {
  amountGbp: StatStrikePassAmountGbp;
  email?: string;
  marketingConsent: boolean;
  surveyConsent: boolean;
  consentTextVersion: string;
  /** Opaque key returned on redirect so the browser can claim the httpOnly cookie. */
  claimKey: string;
};

function lemonApiKey(): string | null {
  return process.env.LEMONSQUEEZY_API_KEY?.trim() || null;
}

function lemonStoreId(): string | null {
  return process.env.LEMONSQUEEZY_STORE_ID?.trim() || null;
}

function lemonWebhookSecret(): string | null {
  return process.env.LEMONSQUEEZY_WEBHOOK_SECRET?.trim() || null;
}

/** Map £ amount → Lemon variant id from env. */
export function lemonVariantIdForAmount(amountGbp: StatStrikePassAmountGbp): string | null {
  const map: Record<StatStrikePassAmountGbp, string | undefined> = {
    1: process.env.LEMONSQUEEZY_VARIANT_ID_1?.trim(),
    3: process.env.LEMONSQUEEZY_VARIANT_ID_3?.trim(),
    5: process.env.LEMONSQUEEZY_VARIANT_ID_5?.trim(),
    10: process.env.LEMONSQUEEZY_VARIANT_ID_10?.trim(),
  };
  return map[amountGbp] || null;
}

export function isLemonPassConfigured(): boolean {
  if (!lemonApiKey() || !lemonStoreId() || !lemonWebhookSecret()) return false;
  return ([1, 3, 5, 10] as const).every((a) => Boolean(lemonVariantIdForAmount(a)));
}

export function verifyLemonWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = lemonWebhookSecret();
  if (!secret || !signatureHeader) return false;
  const digest = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const a = Buffer.from(digest, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createLemonPassCheckout(
  input: LemonPassCheckoutInput,
): Promise<{ url: string; checkoutId: string }> {
  const apiKey = lemonApiKey();
  const storeId = lemonStoreId();
  if (!apiKey || !storeId) {
    throw new Error('Lemon Squeezy is not configured (API key / store id).');
  }
  if (!isStatStrikePassAmountGbp(input.amountGbp)) {
    throw new Error('Invalid pass amount.');
  }
  const variantId = lemonVariantIdForAmount(input.amountGbp);
  if (!variantId) {
    throw new Error(`Missing Lemon variant for £${input.amountGbp}.`);
  }

  const origin = statStrikePublicOrigin();
  const redirectUrl = `${origin}/support/statstrike?pass=claimed&claim=${encodeURIComponent(input.claimKey)}`;

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          ...(input.email ? { email: input.email } : {}),
          custom: {
            claimKey: input.claimKey,
            marketingConsent: input.marketingConsent ? '1' : '0',
            surveyConsent: input.surveyConsent ? '1' : '0',
            consentTextVersion: input.consentTextVersion,
            amountGbp: String(input.amountGbp),
            product: 'statstrike_24h_pass',
          },
        },
        product_options: {
          redirect_url: redirectUrl,
        },
        checkout_options: {
          embed: false,
          media: false,
          logo: true,
        },
      },
      relationships: {
        store: { data: { type: 'stores', id: String(storeId) } },
        variant: { data: { type: 'variants', id: String(variantId) } },
      },
    },
  };

  const res = await fetch(`${LS_API}/checkouts`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as {
    data?: { id?: string; attributes?: { url?: string } };
    errors?: unknown;
  };
  if (!res.ok) {
    const msg = JSON.stringify(json.errors ?? json).slice(0, 400);
    throw new Error(`Lemon checkout failed (${res.status}): ${msg}`);
  }
  const url = json.data?.attributes?.url;
  const checkoutId = json.data?.id;
  if (!url || !checkoutId) {
    throw new Error('Lemon checkout response missing url/id.');
  }
  return { url, checkoutId };
}

/** Best-effort parse of order_created webhook payload. */
export function parseLemonOrderCreated(payload: unknown): {
  eventName: string;
  orderId: string;
  checkoutId: string | null;
  email: string | null;
  totalGbp: number | null;
  custom: Record<string, string>;
  testMode: boolean;
} | null {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;
  const meta = (root.meta ?? {}) as Record<string, unknown>;
  const eventName = typeof meta.event_name === 'string' ? meta.event_name : '';
  if (eventName !== 'order_created') {
    return {
      eventName,
      orderId: '',
      checkoutId: null,
      email: null,
      totalGbp: null,
      custom: {},
      testMode: false,
    };
  }

  const data = (root.data ?? {}) as Record<string, unknown>;
  const attrs = (data.attributes ?? {}) as Record<string, unknown>;
  const orderId = typeof data.id === 'string' ? data.id : '';
  if (!orderId) return null;

  const customRaw = (meta.custom_data ?? {}) as Record<string, unknown>;
  const custom: Record<string, string> = {};
  for (const [k, v] of Object.entries(customRaw)) {
    if (v == null) continue;
    custom[k] = String(v);
  }

  const email =
    typeof attrs.user_email === 'string'
      ? attrs.user_email
      : typeof attrs.customer_email === 'string'
        ? attrs.customer_email
        : null;

  let totalGbp: number | null = null;
  if (typeof attrs.total === 'number') {
    totalGbp = Math.round(attrs.total) / 100;
  }

  const checkoutId = typeof attrs.checkout_id === 'string' ? attrs.checkout_id : null;

  return {
    eventName,
    orderId,
    checkoutId,
    email,
    totalGbp,
    custom,
    testMode: Boolean(attrs.test_mode),
  };
}
