import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';

describe('isManualPicksAdminAuthorized', () => {
  const prev = process.env.ADMIN_MANUAL_PICKS_KEY;

  beforeEach(() => {
    process.env.ADMIN_MANUAL_PICKS_KEY = 'test-admin-key-value';
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.ADMIN_MANUAL_PICKS_KEY;
    else process.env.ADMIN_MANUAL_PICKS_KEY = prev;
  });

  it('accepts matching Bearer token', () => {
    const req = new NextRequest('http://localhost/api/admin/manual-picks', {
      headers: { Authorization: 'Bearer test-admin-key-value' },
    });
    expect(isManualPicksAdminAuthorized(req)).toBe(true);
  });

  it('rejects wrong or missing Bearer', () => {
    expect(
      isManualPicksAdminAuthorized(
        new NextRequest('http://localhost/api/admin/manual-picks', {
          headers: { Authorization: 'Bearer wrong' },
        }),
      ),
    ).toBe(false);
    expect(
      isManualPicksAdminAuthorized(new NextRequest('http://localhost/api/admin/manual-picks')),
    ).toBe(false);
  });
});
