import { describe, expect, it } from 'vitest';
import {
  hashPassAccessToken,
  isPassActive,
  mintPassAccessToken,
  passExpiresAtFrom,
  passTokenMatches,
  stackedPassExpiresAt,
} from '@/lib/statstrike/pass';
import { isStatStrikePassAmountGbp, parseConsentFlag } from '@/lib/statstrike/pass-constants';

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

  it('stacks repeat purchases from remaining time', () => {
    const now = Date.parse('2026-07-19T12:00:00.000Z');
    // 5 hours remaining → +24h = 29h from now
    const existing = '2026-07-19T17:00:00.000Z';
    expect(stackedPassExpiresAt(existing, now)).toBe('2026-07-20T17:00:00.000Z');
    // expired → from now
    expect(stackedPassExpiresAt('2026-07-19T10:00:00.000Z', now)).toBe('2026-07-20T12:00:00.000Z');
  });
});

describe('pass consents / amounts', () => {
  it('parses consent flags', () => {
    expect(parseConsentFlag('1')).toBe(true);
    expect(parseConsentFlag('0')).toBe(false);
    expect(parseConsentFlag(false)).toBe(false);
  });

  it('accepts only £1/3/5/10', () => {
    expect(isStatStrikePassAmountGbp(3)).toBe(true);
    expect(isStatStrikePassAmountGbp(2)).toBe(false);
  });
});
