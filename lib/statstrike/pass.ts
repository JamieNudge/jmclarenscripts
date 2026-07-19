import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { STATSTRIKE_PASS_HOURS } from '@/lib/statstrike/pass-constants';

export {
  STATSTRIKE_PASS_COOKIE,
  STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
  STATSTRIKE_PASS_AMOUNTS_GBP,
  STATSTRIKE_PASS_HOURS,
  isStatStrikePassAmountGbp,
  parseConsentFlag,
  passCreatePath,
  type StatStrikePassAmountGbp,
} from '@/lib/statstrike/pass-constants';

export type StatStrikePassRecord = {
  passId: string;
  lemonOrderId: string;
  lemonCheckoutId?: string | null;
  amountGbp: number;
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
  /** When the access cookie was first claimed in a browser. */
  claimedAt?: string | null;
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

export function passExpiresAtFrom(createdAtIso: string, hours = STATSTRIKE_PASS_HOURS): string {
  const ms = Date.parse(createdAtIso);
  const base = Number.isFinite(ms) ? ms : Date.now();
  return new Date(base + hours * 60 * 60 * 1000).toISOString();
}

export function isPassActive(pass: Pick<StatStrikePassRecord, 'expiresAt'>, now = Date.now()): boolean {
  const exp = Date.parse(pass.expiresAt);
  return Number.isFinite(exp) && exp > now;
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
