import { describe, expect, it } from 'vitest';
import { decisionForMissingClaimToken } from '@/lib/statstrike/pass-claim';
import {
  hubAdminReturnToUrl,
  safeAdminReturnTo,
  successPathWithoutClaimParams,
} from '@/lib/statstrike/pass-return-to';

describe('decisionForMissingClaimToken', () => {
  it('returns 200 when this browser is already unlocked', () => {
    const d = decisionForMissingClaimToken({
      unlocked: true,
      expiresAt: '2026-09-28T12:00:00.000Z',
      passId: 'pass_staff_abc',
    });
    expect(d.kind).toBe('already_unlocked');
    expect(d.status).toBe(200);
    if (d.kind === 'already_unlocked') {
      expect(d.body.alreadyClaimed).toBe(true);
      expect(d.body.unlocked).toBe(true);
      expect(d.body.passId).toBe('pass_staff_abc');
      expect(d.body.expiresAt).toBe('2026-09-28T12:00:00.000Z');
    }
  });

  it('returns 410 gone (not 409 retry) when the token is missing and there is no pass cookie', () => {
    const d = decisionForMissingClaimToken({
      unlocked: false,
      expiresAt: null,
      passId: null,
    });
    expect(d.kind).toBe('gone');
    expect(d.status).toBe(410);
    if (d.kind === 'gone') {
      expect(d.body.retry).toBe(false);
      expect(d.body.error).toMatch(/no longer available/i);
    }
  });
});

describe('safeAdminReturnTo', () => {
  it('allows hub and production admin URLs', () => {
    expect(safeAdminReturnTo('https://thegoallab.net/admin/picks')).toBe(
      'https://thegoallab.net/admin/picks',
    );
    expect(safeAdminReturnTo('https://jmclarenscripts.vercel.app/admin/picks')).toBe(
      'https://jmclarenscripts.vercel.app/admin/picks',
    );
  });

  it('rejects non-admin paths and unknown hosts', () => {
    expect(safeAdminReturnTo('https://thegoallab.net/statstrike')).toBeNull();
    expect(safeAdminReturnTo('https://evil.example/admin/picks')).toBeNull();
    expect(safeAdminReturnTo('javascript:alert(1)')).toBeNull();
    expect(safeAdminReturnTo(null)).toBeNull();
  });
});

describe('hubAdminReturnToUrl', () => {
  it('always returns the hub admin path, not the vercel.app href', () => {
    expect(hubAdminReturnToUrl('/admin/picks')).toBe('https://thegoallab.net/admin/picks');
    expect(hubAdminReturnToUrl('/admin', '?tab=1')).toBe('https://thegoallab.net/admin?tab=1');
    expect(hubAdminReturnToUrl('/football-predictions')).toBe(
      'https://thegoallab.net/admin/picks',
    );
  });
});

describe('successPathWithoutClaimParams', () => {
  it('strips claim and returnTo so Back cannot replay auto-claim', () => {
    const href =
      'https://thegoallab.net/support/statstrike/success?claim=abc&returnTo=https%3A%2F%2Fthegoallab.net%2Fadmin%2Fpicks';
    expect(successPathWithoutClaimParams(href)).toBe('/support/statstrike/success');
  });
});
