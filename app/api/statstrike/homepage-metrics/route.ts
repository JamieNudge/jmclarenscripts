import { NextResponse } from 'next/server';
import { getDatabase, type Database } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import {
  HOMEPAGE_METRICS_WINDOW_DAYS,
  HOMEPAGE_STREAK_WINDOW_DAYS,
  HOMEPAGE_SUCCESS_DEFINITION,
  applyTodayMetricsToSnapshot,
  buildHomepageMetricsSnapshot,
  type HomepageMetricsSnapshot,
} from '@/lib/statstrike/homepage-metrics';
import {
  homepageMetricsStorePath,
  isTodayMetricsFresh,
  isWindowMetricsFresh,
  parseHomepageMetricsStored,
  serializeHomepageMetricsStored,
  type HomepageMetricsStored,
} from '@/lib/statstrike/homepage-metrics-store';
import { parseDailySelection } from '@/lib/statstrike/parse-selection';
import { recordsFromSelection } from '@/lib/statstrike/track-record';
import {
  selectionsPathForDateKey,
  ukSelectionDateKey,
  ukSelectionDateKeyOffset,
} from '@/lib/statstrike/uk-date';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
};

function emptyStreakRun() {
  return {
    count: 0,
    startedAt: null,
    lastUpdatedAt: null,
    latest: null,
    fixtures: [],
  };
}

function emptySnapshot(generatedAt: string, error?: string): HomepageMetricsSnapshot & { error?: string } {
  return {
    generatedAt,
    successDefinition: HOMEPAGE_SUCCESS_DEFINITION,
    hotStreak: {
      hottest30d: emptyStreakRun(),
      today: { ...emptyStreakRun(), settledCount: 0, successfulCount: 0 },
      averageRunLength7d: null,
      runCount7d: 0,
      hottestWindowDays: HOMEPAGE_METRICS_WINDOW_DAYS,
      averageWindowDays: HOMEPAGE_STREAK_WINDOW_DAYS,
    },
    bestCompetition: null,
    modelStatus: {
      status: 'unknown',
      lastForecastUpdate: null,
      forecastsGeneratedToday: 0,
      activeCompetitions: 0,
      resultsProcessedToday: 0,
      modelVersion: null,
    },
    ...(error ? { error } : {}),
  };
}

function windowDateKeys(): { dateKeys: string[]; streakDateKeys: string[] } {
  const dateKeys: string[] = [];
  for (let i = -(HOMEPAGE_METRICS_WINDOW_DAYS - 1); i <= 0; i++) {
    dateKeys.push(ukSelectionDateKeyOffset(i));
  }
  const streakDateKeys: string[] = [];
  for (let i = -(HOMEPAGE_STREAK_WINDOW_DAYS - 1); i <= 0; i++) {
    streakDateKeys.push(ukSelectionDateKeyOffset(i));
  }
  return { dateKeys, streakDateKeys };
}

async function persistStore(db: Database, stored: HomepageMetricsStored): Promise<void> {
  try {
    await db.ref(homepageMetricsStorePath()).set(serializeHomepageMetricsStored(stored));
  } catch (err) {
    console.error('homepage-metrics persist failed', err);
  }
}

async function loadStored(db: Database): Promise<HomepageMetricsStored | null> {
  try {
    const snap = await db.ref(homepageMetricsStorePath()).once('value');
    return parseHomepageMetricsStored(snap.val());
  } catch {
    return null;
  }
}

async function recomputeWindow(
  db: Database,
  todayKey: string,
  now: Date,
): Promise<HomepageMetricsStored> {
  const { dateKeys, streakDateKeys } = windowDateKeys();
  const snaps = await Promise.all(
    dateKeys.map((dateKey) => db.ref(selectionsPathForDateKey(dateKey)).once('value')),
  );
  const records = snaps.flatMap((snap, idx) => {
    const sel = parseDailySelection(snap.val());
    if (!sel) return [];
    return recordsFromSelection(sel, dateKeys[idx]);
  });
  const todaySnap = snaps[snaps.length - 1];
  const todaySelection = parseDailySelection(todaySnap?.val() ?? null);
  const snapshot = buildHomepageMetricsSnapshot({
    records,
    todaySelection,
    todayDateKey: todayKey,
    recentDateKeys: streakDateKeys,
    now,
  });
  const iso = now.toISOString();
  return {
    todayDateKey: todayKey,
    todayComputedAt: iso,
    windowComputedAt: iso,
    snapshot,
  };
}

async function recomputeToday(
  db: Database,
  stored: HomepageMetricsStored,
  todayKey: string,
  now: Date,
): Promise<HomepageMetricsStored> {
  const todaySnap = await db.ref(selectionsPathForDateKey(todayKey)).once('value');
  const todaySelection = parseDailySelection(todaySnap.val());
  const snapshot = applyTodayMetricsToSnapshot({
    snapshot: stored.snapshot,
    todaySelection,
    todayDateKey: todayKey,
    now,
  });
  return {
    ...stored,
    todayDateKey: todayKey,
    todayComputedAt: now.toISOString(),
    snapshot,
  };
}

/**
 * Public homepage metrics. Origin reads a small persisted snapshot; fat
 * `selections/{date}` scans happen at most every 5 min (today) / 60 min (30d).
 */
export async function GET() {
  const generatedAt = new Date().toISOString();
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
      return NextResponse.json(emptySnapshot(generatedAt, 'admin-unconfigured'), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const app = getFirebaseAdminApp();
    const db = getDatabase(app);
    const now = new Date();
    const nowMs = now.getTime();
    const todayKey = ukSelectionDateKey(now);
    const stored = await loadStored(db);

    if (stored && isTodayMetricsFresh(stored, todayKey, nowMs) && isWindowMetricsFresh(stored, todayKey, nowMs)) {
      return NextResponse.json(stored.snapshot, { headers: CACHE_HEADERS });
    }

    let next: HomepageMetricsStored;
    if (!stored || !isWindowMetricsFresh(stored, todayKey, nowMs)) {
      next = await recomputeWindow(db, todayKey, now);
    } else {
      next = await recomputeToday(db, stored, todayKey, now);
    }
    await persistStore(db, next);
    return NextResponse.json(next.snapshot, { headers: CACHE_HEADERS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json(emptySnapshot(generatedAt, msg), {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
