import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  hashPassAccessToken,
  isPassActive,
  mintPassAccessToken,
  passExpiresAtFrom,
  passTokenMatches,
} from '@/lib/statstrike/pass';
import { isStatStrikePassAmountGbp, parseConsentFlag } from '@/lib/statstrike/pass-constants';
import { verifyLemonWebhookSignature } from '@/lib/statstrike/lemon';

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

describe('lemon webhook signature', () => {
  it('verifies hmac hex digest', () => {
    const secret = 'test-secret';
    const body = '{"meta":{"event_name":"order_created"}}';
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = secret;
    const sig = createHmac('sha256', secret).update(body, 'utf8').digest('hex');
    expect(verifyLemonWebhookSignature(body, sig)).toBe(true);
    expect(verifyLemonWebhookSignature(body, 'deadbeef')).toBe(false);
  });
});
