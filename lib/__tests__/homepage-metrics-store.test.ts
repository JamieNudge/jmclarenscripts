import { describe, expect, it } from 'vitest';
import {
  HOMEPAGE_METRICS_TODAY_TTL_MS,
  HOMEPAGE_METRICS_WINDOW_TTL_MS,
  isTodayMetricsFresh,
  isWindowMetricsFresh,
  parseHomepageMetricsStored,
} from '@/lib/statstrike/homepage-metrics-store';
import { HOMEPAGE_SUCCESS_DEFINITION } from '@/lib/statstrike/homepage-metrics';

const snapshot = {
  generatedAt: '2026-09-21T10:00:00.000Z',
  successDefinition: HOMEPAGE_SUCCESS_DEFINITION,
  hotStreak: {
    hottest30d: { count: 1, startedAt: null, lastUpdatedAt: null, latest: null, fixtures: [] },
    today: {
      count: 0,
      startedAt: null,
      lastUpdatedAt: null,
      latest: null,
      fixtures: [],
      settledCount: 0,
      successfulCount: 0,
    },
    averageRunLength7d: null,
    runCount7d: 0,
    hottestWindowDays: 30,
    averageWindowDays: 7,
  },
  bestCompetition: null,
  modelStatus: {
    status: 'unknown' as const,
    lastForecastUpdate: null,
    forecastsGeneratedToday: 0,
    activeCompetitions: 0,
    resultsProcessedToday: 0,
    modelVersion: null,
  },
};

describe('homepage metrics store', () => {
  it('parses a persisted payload and rejects junk', () => {
    const stored = parseHomepageMetricsStored({
      todayDateKey: '2026-09-21',
      todayComputedAt: '2026-09-21T10:00:00.000Z',
      windowComputedAt: '2026-09-21T09:00:00.000Z',
      snapshot,
    });
    expect(stored?.todayDateKey).toBe('2026-09-21');
    expect(parseHomepageMetricsStored(null)).toBeNull();
    expect(parseHomepageMetricsStored({ todayDateKey: '2026-09-21' })).toBeNull();
  });

  it('treats a UK-day rollover as stale even inside the TTL', () => {
    const stored = parseHomepageMetricsStored({
      todayDateKey: '2026-09-20',
      todayComputedAt: '2026-09-21T10:00:00.000Z',
      windowComputedAt: '2026-09-21T10:00:00.000Z',
      snapshot,
    })!;
    const now = Date.parse('2026-09-21T10:01:00.000Z');
    expect(isTodayMetricsFresh(stored, '2026-09-21', now)).toBe(false);
    expect(isWindowMetricsFresh(stored, '2026-09-21', now)).toBe(false);
  });

  it('uses the 5-minute today TTL and 60-minute window TTL', () => {
    const stored = parseHomepageMetricsStored({
      todayDateKey: '2026-09-21',
      todayComputedAt: '2026-09-21T10:00:00.000Z',
      windowComputedAt: '2026-09-21T10:00:00.000Z',
      snapshot,
    })!;
    const justInsideToday = Date.parse('2026-09-21T10:00:00.000Z') + HOMEPAGE_METRICS_TODAY_TTL_MS - 1;
    const justOutsideToday = Date.parse('2026-09-21T10:00:00.000Z') + HOMEPAGE_METRICS_TODAY_TTL_MS;
    expect(isTodayMetricsFresh(stored, '2026-09-21', justInsideToday)).toBe(true);
    expect(isTodayMetricsFresh(stored, '2026-09-21', justOutsideToday)).toBe(false);

    const justInsideWindow = Date.parse('2026-09-21T10:00:00.000Z') + HOMEPAGE_METRICS_WINDOW_TTL_MS - 1;
    const justOutsideWindow = Date.parse('2026-09-21T10:00:00.000Z') + HOMEPAGE_METRICS_WINDOW_TTL_MS;
    expect(isWindowMetricsFresh(stored, '2026-09-21', justInsideWindow)).toBe(true);
    expect(isWindowMetricsFresh(stored, '2026-09-21', justOutsideWindow)).toBe(false);
  });
});
