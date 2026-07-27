/** Client-safe pass constants (no Node crypto). */

export const STATSTRIKE_PASS_COOKIE = 'statstrike_pass';

/** Bump when consent checkbox copy changes (stored on pass records). */
export const STATSTRIKE_PASS_CONSENT_TEXT_VERSION = '2026-07-19-v1';

export type StatStrikePassDuration = '24h' | '7d';

export const STATSTRIKE_PASS_DURATIONS: readonly StatStrikePassDuration[] = ['24h', '7d'];

export const STATSTRIKE_PASS_HOURS_BY_DURATION = {
  '24h': 24,
  '7d': 168,
} as const;

export const STATSTRIKE_PASS_AMOUNTS_BY_DURATION = {
  '24h': [1, 3, 5, 10],
  '7d': [5, 10, 15, 25],
} as const;

export type StatStrikePassAmountGbp =
  | (typeof STATSTRIKE_PASS_AMOUNTS_BY_DURATION)['24h'][number]
  | (typeof STATSTRIKE_PASS_AMOUNTS_BY_DURATION)['7d'][number];

/** @deprecated Prefer STATSTRIKE_PASS_AMOUNTS_BY_DURATION['24h'] */
export const STATSTRIKE_PASS_AMOUNTS_GBP = STATSTRIKE_PASS_AMOUNTS_BY_DURATION['24h'];

/** @deprecated Prefer STATSTRIKE_PASS_HOURS_BY_DURATION['24h'] */
export const STATSTRIKE_PASS_HOURS = STATSTRIKE_PASS_HOURS_BY_DURATION['24h'];

export type StatStrikePassPurchaseType = 'supporter_pass_24h' | 'supporter_pass_7d';

export function isStatStrikePassDuration(v: unknown): v is StatStrikePassDuration {
  return v === '24h' || v === '7d';
}

export function passHoursFor(duration: StatStrikePassDuration): number {
  return STATSTRIKE_PASS_HOURS_BY_DURATION[duration];
}

export function passAmountsFor(duration: StatStrikePassDuration): readonly number[] {
  return STATSTRIKE_PASS_AMOUNTS_BY_DURATION[duration];
}

export function purchaseTypeForDuration(duration: StatStrikePassDuration): StatStrikePassPurchaseType {
  return duration === '7d' ? 'supporter_pass_7d' : 'supporter_pass_24h';
}

export function durationFromPurchaseType(
  purchaseType: string | null | undefined,
): StatStrikePassDuration {
  return purchaseType === 'supporter_pass_7d' ? '7d' : '24h';
}

/** Legacy helper: true if amount is a valid 24h tier. */
export function isStatStrikePassAmountGbp(n: unknown): n is StatStrikePassAmountGbp {
  return typeof n === 'number' && (STATSTRIKE_PASS_AMOUNTS_GBP as readonly number[]).includes(n);
}

export function isValidPassPurchase(
  duration: unknown,
  amountGbp: unknown,
): duration is StatStrikePassDuration {
  if (!isStatStrikePassDuration(duration)) return false;
  if (typeof amountGbp !== 'number' || !Number.isFinite(amountGbp)) return false;
  return (passAmountsFor(duration) as readonly number[]).includes(amountGbp);
}

export function parseConsentFlag(v: unknown): boolean {
  if (v === true || v === 1 || v === '1' || v === 'true') return true;
  return false;
}

export function passCreatePath(): string {
  return '/support/statstrike';
}

export function passDurationLabel(duration: StatStrikePassDuration): string {
  return duration === '7d' ? '7-day' : '24-hour';
}
