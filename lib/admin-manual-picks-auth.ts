import type { NextRequest } from 'next/server';

/** Same Bearer as POST /api/admin/manual-picks. */
export function isManualPicksAdminAuthorized(req: NextRequest): boolean {
  const key = process.env.ADMIN_MANUAL_PICKS_KEY?.trim();
  if (!key) return false;
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ')) return false;
  return h.slice(7).trim() === key;
}
