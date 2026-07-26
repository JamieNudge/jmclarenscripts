/** Best-effort per-instance survey submission limiter for Vercel functions. */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_POSTS = 5;
const buckets = new Map<string, number[]>();

export function allowSurveyPost(ip: string, now = Date.now()): boolean {
  const key = ip || 'unknown';
  const active = (buckets.get(key) || []).filter((at) => now - at < WINDOW_MS);
  if (active.length >= MAX_POSTS) {
    buckets.set(key, active);
    return false;
  }
  active.push(now);
  buckets.set(key, active);
  if (buckets.size > 5_000) {
    for (const [bucketKey, timestamps] of Array.from(buckets.entries())) {
      const current = timestamps.filter((at) => now - at < WINDOW_MS);
      if (current.length === 0) buckets.delete(bucketKey);
      else buckets.set(bucketKey, current);
    }
  }
  return true;
}

export function resetSurveyRateLimitForTests(): void {
  buckets.clear();
}
