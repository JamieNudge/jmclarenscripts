import { NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import {
  HOMEPAGE_METRICS_WINDOW_DAYS,
  buildHomepageMetricsSnapshot,
  type HomepageMetricsSnapshot,
} from '@/lib/statstrike/homepage-metrics';
import { parseDailySelection } from '@/lib/statstrike/parse-selection';
import { recordsFromSelection } from '@/lib/statstrike/track-record';
import {
  selectionsPathForDateKey,
  ukSelectionDateKey,
  ukSelectionDateKeyOffset,
} from '@/lib/statstrike/uk-date';

export const runtime = 'nodejs';
export const revalidate = 120;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
};

function emptySnapshot(generatedAt: string, error?: string): HomepageMetricsSnapshot & { error?: string } {
  return {
    generatedAt,
    successDefinition:
      'A successful forecast is one fixture tip on the StatStrike board whose recommended tip band (for example Over 2.5 Goals) matched the confirmed full-time total goals. The hot streak is the longest consecutive run of successes across all competitions in the recent window (ties prefer the most recent run). Postponed, abandoned, and unfinished fixtures are excluded.',
    hotStreak: {
      count: 0,
      startedAt: null,
      lastUpdatedAt: null,
      latest: null,
      fixtures: [],
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

/**
 * Public homepage metrics snapshot from RTDB selections/{date} history.
 * Cached briefly; not computed on every browser client.
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
    const todayKey = ukSelectionDateKey();
    const dateKeys: string[] = [];
    for (let i = -(HOMEPAGE_METRICS_WINDOW_DAYS - 1); i <= 0; i++) {
      dateKeys.push(ukSelectionDateKeyOffset(i));
    }

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
    });

    return NextResponse.json(snapshot, { headers: CACHE_HEADERS });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json(emptySnapshot(generatedAt, msg), {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
