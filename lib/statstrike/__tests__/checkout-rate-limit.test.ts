import { describe, expect, it, beforeEach } from 'vitest';
import {
  allowCheckoutPost,
  clientIpFromRequest,
  resetCheckoutRateLimitForTests,
} from '@/lib/statstrike/checkout-rate-limit';

describe('checkout rate limit', () => {
  beforeEach(() => {
    resetCheckoutRateLimitForTests();
  });

  it('allows up to 10 posts then denies', () => {
    const ip = '203.0.113.10';
    for (let i = 0; i < 10; i += 1) {
      expect(allowCheckoutPost(ip)).toBe(true);
    }
    expect(allowCheckoutPost(ip)).toBe(false);
  });

  it('tracks IPs independently', () => {
    for (let i = 0; i < 10; i += 1) {
      expect(allowCheckoutPost('203.0.113.1')).toBe(true);
    }
    expect(allowCheckoutPost('203.0.113.1')).toBe(false);
    expect(allowCheckoutPost('203.0.113.2')).toBe(true);
  });

  it('parses first x-forwarded-for hop', () => {
    expect(
      clientIpFromRequest({
        headers: {
          get(name: string) {
            if (name === 'x-forwarded-for') return '203.0.113.50, 10.0.0.1';
            return null;
          },
        },
      }),
    ).toBe('203.0.113.50');
  });
});
