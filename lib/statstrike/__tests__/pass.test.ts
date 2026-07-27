import { describe, expect, it } from 'vitest';
import {
  hashPassAccessToken,
  isPassActive,
  mintPassAccessToken,
  passExpiresAtFrom,
  passTokenMatches,
  stackedPassExpiresAt,
} from '@/lib/statstrike/pass';
import {
  isStatStrikePassAmountGbp,
  isValidPassPurchase,
  parseConsentFlag,
  passHoursFor,
  purchaseTypeForDuration,
} from '@/lib/statstrike/pass-constants';

describe('statstrike pass tokens', () => {
  it('hashes and matches opaque tokens', () => {
    const token = mintPassAccessToken();
    const hash = hashPassAccessToken(token);
    expect(hash).toHaveLength(64);
    expect(passTokenMatches(token, hash)).toBe(true);
    expect(passTokenMatches(token + 'x', hash)).toBe(false);
  });

  it('expires after 24h from createdAt', () => {
    const created = '2026-07-19T12:00:00.000Z';
    const exp = passExpiresAtFrom(created);
    expect(exp).toBe('2026-07-20T12:00:00.000Z');
    expect(isPassActive({ expiresAt: exp }, Date.parse('2026-07-20T11:59:00.000Z'))).toBe(true);
    expect(isPassActive({ expiresAt: exp }, Date.parse('2026-07-20T12:00:01.000Z'))).toBe(false);
  });

  it('expires after 7d when duration hours are 168', () => {
    const created = '2026-07-19T12:00:00.000Z';
    expect(passExpiresAtFrom(created, 168)).toBe('2026-07-26T12:00:00.000Z');
  });

  it('stacks repeat purchases from remaining time', () => {
    const now = Date.parse('2026-07-19T12:00:00.000Z');
    // 5 hours remaining → +24h = 29h from now
    const existing = '2026-07-19T17:00:00.000Z';
    expect(stackedPassExpiresAt(existing, now)).toBe('2026-07-20T17:00:00.000Z');
    // expired → from now
    expect(stackedPassExpiresAt('2026-07-19T10:00:00.000Z', now)).toBe('2026-07-20T12:00:00.000Z');
  });

  it('stacks a 7-day purchase onto remaining time', () => {
    const now = Date.parse('2026-07-19T12:00:00.000Z');
    const existing = '2026-07-19T17:00:00.000Z'; // 5h left
    expect(stackedPassExpiresAt(existing, now, 168)).toBe('2026-07-26T17:00:00.000Z');
  });
});

describe('pass consents / amounts', () => {
  it('parses consent flags', () => {
    expect(parseConsentFlag('1')).toBe(true);
    expect(parseConsentFlag('0')).toBe(false);
    expect(parseConsentFlag(false)).toBe(false);
  });

  it('accepts only £1/3/5/10 for legacy 24h helper', () => {
    expect(isStatStrikePassAmountGbp(3)).toBe(true);
    expect(isStatStrikePassAmountGbp(2)).toBe(false);
    expect(isStatStrikePassAmountGbp(15)).toBe(false);
  });

  it('validates amount against duration', () => {
    expect(isValidPassPurchase('24h', 1)).toBe(true);
    expect(isValidPassPurchase('24h', 15)).toBe(false);
    expect(isValidPassPurchase('7d', 5)).toBe(true);
    expect(isValidPassPurchase('7d', 25)).toBe(true);
    expect(isValidPassPurchase('7d', 1)).toBe(false);
    expect(isValidPassPurchase('3d', 5)).toBe(false);
  });

  it('maps duration helpers', () => {
    expect(passHoursFor('24h')).toBe(24);
    expect(passHoursFor('7d')).toBe(168);
    expect(purchaseTypeForDuration('7d')).toBe('supporter_pass_7d');
    expect(purchaseTypeForDuration('24h')).toBe('supporter_pass_24h');
  });
});
