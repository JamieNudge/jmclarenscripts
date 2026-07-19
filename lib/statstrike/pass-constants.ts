/** Client-safe pass constants (no Node crypto). */

export const STATSTRIKE_PASS_COOKIE = 'statstrike_pass';

/** Bump when consent checkbox copy changes (stored on pass records). */
export const STATSTRIKE_PASS_CONSENT_TEXT_VERSION = '2026-07-19-v1';

export const STATSTRIKE_PASS_AMOUNTS_GBP = [1, 3, 5, 10] as const;
export type StatStrikePassAmountGbp = (typeof STATSTRIKE_PASS_AMOUNTS_GBP)[number];

export const STATSTRIKE_PASS_HOURS = 24;

export function isStatStrikePassAmountGbp(n: unknown): n is StatStrikePassAmountGbp {
  return typeof n === 'number' && (STATSTRIKE_PASS_AMOUNTS_GBP as readonly number[]).includes(n);
}

export function parseConsentFlag(v: unknown): boolean {
  if (v === true || v === 1 || v === '1' || v === 'true') return true;
  return false;
}

export function passCreatePath(): string {
  return '/support/statstrike';
}
