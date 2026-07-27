import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { STATSTRIKE_PASS_HOURS } from '@/lib/statstrike/pass-constants';

export {
  STATSTRIKE_PASS_COOKIE,
  STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
  STATSTRIKE_PASS_AMOUNTS_GBP,
  STATSTRIKE_PASS_AMOUNTS_BY_DURATION,
  STATSTRIKE_PASS_HOURS,
  STATSTRIKE_PASS_HOURS_BY_DURATION,
  STATSTRIKE_PASS_DURATIONS,
  isStatStrikePassAmountGbp,
  isStatStrikePassDuration,
  isValidPassPurchase,
  passHoursFor,
  passAmountsFor,
  purchaseTypeForDuration,
  durationFromPurchaseType,
  passDurationLabel,
  parseConsentFlag,
  passCreatePath,
  type StatStrikePassAmountGbp,
  type StatStrikePassDuration,
  type StatStrikePassPurchaseType,
} from '@/lib/statstrike/pass-constants';

export type StatStrikePassRecord = {
  passId: string;
  provider: 'stripe';
  /** Stripe Checkout Session id — unique fulfilment key. */
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  /** Stripe event id that fulfilled this pass (idempotency aid). */
  stripeEventId?: string | null;
  amountGbp: number;
  amountMinor: number;
  currency: 'gbp';
  purchaseType: 'supporter_pass_24h' | 'supporter_pass_7d';
  /** Hours of entitlement granted by this purchase (24 or 168). */
  durationHours?: number;
  createdAt: string;
  expiresAt: string;
  email?: string | null;
  marketingConsent: boolean;
  surveyConsent: boolean;
  consentAt: string;
  consentTextVersion: string;
  /** SHA-256 hex of the opaque access token. */
  tokenHash: string;
  welcomeEmailSentAt?: string | null;
  surveyEmailSentAt?: string | null;
  claimedAt?: string | null;
  marketingConsentWithdrawnAt?: string | null;
  /** PII was removed while entitlement/idempotency fields were retained. */
  piiRedactedAt?: string | null;
};

export function mintPassAccessToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashPassAccessToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function passTokenMatches(token: string, tokenHash: string): boolean {
  const a = Buffer.from(hashPassAccessToken(token), 'utf8');
  const b = Buffer.from(tokenHash, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function passExpiresAtFrom(createdAtIso: string, hours: number = STATSTRIKE_PASS_HOURS): string {
  const ms = Date.parse(createdAtIso);
  const base = Number.isFinite(ms) ? ms : Date.now();
  const safeHours = Number.isFinite(hours) && hours > 0 ? hours : STATSTRIKE_PASS_HOURS;
  return new Date(base + safeHours * 60 * 60 * 1000).toISOString();
}

/**
 * Repeat purchase stacking:
 * new_start = max(now, latest active expiry); new_expiry = new_start + purchased hours
 */
export function stackedPassExpiresAt(
  existingExpiresAt: string | null | undefined,
  nowMs = Date.now(),
  hours: number = STATSTRIKE_PASS_HOURS,
): string {
  const existingMs = existingExpiresAt ? Date.parse(existingExpiresAt) : NaN;
  const start = Number.isFinite(existingMs) && existingMs > nowMs ? existingMs : nowMs;
  const safeHours = Number.isFinite(hours) && hours > 0 ? hours : STATSTRIKE_PASS_HOURS;
  return new Date(start + safeHours * 60 * 60 * 1000).toISOString();
}

export function isPassActive(pass: Pick<StatStrikePassRecord, 'expiresAt'>, now = Date.now()): boolean {
  const exp = Date.parse(pass.expiresAt);
  return Number.isFinite(exp) && exp > now;
}

export function amountGbpToMinor(amountGbp: number): number {
  return Math.round(amountGbp * 100);
}

/** Public site origin for redirects / emails (no trailing slash). */
export function statStrikePublicOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(/\/$/, '');
  if (vercel) return vercel.startsWith('http') ? vercel : `https://${vercel}`;
  const url = process.env.VERCEL_URL?.trim().replace(/\/$/, '');
  if (url) return url.startsWith('http') ? url : `https://${url}`;
  return 'https://thegoallab.net';
}
