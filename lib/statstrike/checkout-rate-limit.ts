/**
 * In-process IP rate limit for StatStrike checkout POSTs.
 * On Vercel this is per-instance (not a global distributed limit) — still stops casual spam.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_POSTS = 10;

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

function prune(bucket: Bucket, now: number): void {
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIpFromRequest(req: {
  headers: { get(name: string): string | null };
}): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

/**
 * Record a checkout POST attempt. Returns whether the request is allowed.
 * When denied, the attempt is still counted (no bonus retries from hammering).
 */
export function allowCheckoutPost(ip: string, now = Date.now()): boolean {
  const key = ip || 'unknown';
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }
  prune(bucket, now);
  if (bucket.timestamps.length >= MAX_POSTS) {
    return false;
  }
  bucket.timestamps.push(now);

  // Occasional global prune to avoid unbounded Map growth.
  if (buckets.size > 5_000) {
    for (const [k, b] of Array.from(buckets.entries())) {
      prune(b, now);
      if (b.timestamps.length === 0) buckets.delete(k);
    }
  }

  return true;
}

/** Test helper — clear in-memory state. */
export function resetCheckoutRateLimitForTests(): void {
  buckets.clear();
}
