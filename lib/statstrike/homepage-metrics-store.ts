import type { HomepageMetricsSnapshot } from '@/lib/statstrike/homepage-metrics';

const STORE_DEFAULT = 'footballPredictions/homepageMetrics';

/** Today's model status / today's streak — one fat node. */
export const HOMEPAGE_METRICS_TODAY_TTL_MS = 5 * 60_000;
/** Hottest 30d + best competition + 7d average — 30 fat nodes. */
export const HOMEPAGE_METRICS_WINDOW_TTL_MS = 60 * 60_000;

export function homepageMetricsStorePath(): string {
  return process.env.HOMEPAGE_METRICS_RTDB_PATH?.trim() || STORE_DEFAULT;
}

export type HomepageMetricsStored = {
  todayDateKey: string;
  todayComputedAt: string;
  windowComputedAt: string;
  snapshot: HomepageMetricsSnapshot;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function asIso(v: unknown): string | null {
  if (typeof v !== 'string' || !v.trim()) return null;
  return Number.isFinite(Date.parse(v)) ? v.trim() : null;
}

function looksLikeSnapshot(v: unknown): v is HomepageMetricsSnapshot {
  const o = asRecord(v);
  if (!o) return false;
  const hot = asRecord(o.hotStreak);
  const status = asRecord(o.modelStatus);
  return Boolean(hot && status && typeof o.generatedAt === 'string');
}

export function parseHomepageMetricsStored(raw: unknown): HomepageMetricsStored | null {
  const o = asRecord(raw);
  if (!o) return null;
  const todayDateKey = typeof o.todayDateKey === 'string' ? o.todayDateKey.trim() : '';
  const todayComputedAt = asIso(o.todayComputedAt);
  const windowComputedAt = asIso(o.windowComputedAt);
  if (!todayDateKey || !todayComputedAt || !windowComputedAt) return null;
  if (!looksLikeSnapshot(o.snapshot)) return null;
  return {
    todayDateKey,
    todayComputedAt,
    windowComputedAt,
    snapshot: o.snapshot,
  };
}

export function isTodayMetricsFresh(
  stored: HomepageMetricsStored,
  todayKey: string,
  nowMs: number,
  ttlMs = HOMEPAGE_METRICS_TODAY_TTL_MS,
): boolean {
  if (stored.todayDateKey !== todayKey) return false;
  return nowMs - Date.parse(stored.todayComputedAt) < ttlMs;
}

export function isWindowMetricsFresh(
  stored: HomepageMetricsStored,
  todayKey: string,
  nowMs: number,
  ttlMs = HOMEPAGE_METRICS_WINDOW_TTL_MS,
): boolean {
  if (stored.todayDateKey !== todayKey) return false;
  return nowMs - Date.parse(stored.windowComputedAt) < ttlMs;
}

export function serializeHomepageMetricsStored(
  stored: HomepageMetricsStored,
): Record<string, unknown> {
  return {
    todayDateKey: stored.todayDateKey,
    todayComputedAt: stored.todayComputedAt,
    windowComputedAt: stored.windowComputedAt,
    snapshot: stored.snapshot,
  };
}
