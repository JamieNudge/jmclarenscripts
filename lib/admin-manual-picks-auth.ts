import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

function sha256Buffer(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

/** Same Bearer as POST /api/admin/manual-picks. */
export function isManualPicksAdminAuthorized(req: NextRequest): boolean {
  const key = process.env.ADMIN_MANUAL_PICKS_KEY?.trim();
  if (!key) return false;
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ')) return false;
  const presented = h.slice(7).trim();
  if (!presented) return false;
  // Hash both sides so timingSafeEqual always compares equal-length digests.
  try {
    return timingSafeEqual(sha256Buffer(presented), sha256Buffer(key));
  } catch {
    return false;
  }
}
