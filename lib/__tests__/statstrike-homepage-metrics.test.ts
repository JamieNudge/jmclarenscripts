import { describe, expect, it } from 'vitest';
import {
  buildHomepageMetricsSnapshot,
  computeBestCompetition,
  computeHotStreak,
  modelStatusFromFreshness,
  HOMEPAGE_DELAYED_MS,
  HOMEPAGE_FRESH_MS,
} from '@/lib/statstrike/homepage-metrics';
import { parseDailySelection, parseSelectionLastUpdatedMs } from '@/lib/statstrike/parse-selection';
import type { StatStrikeTrackRecord } from '@/lib/statstrike/track-record';

function rec(
  partial: Partial<StatStrikeTrackRecord> & {
    fixtureId: number;
    isCorrect: boolean | null;
    kickoffMs: number;
  },
): StatStrikeTrackRecord {
  return {
    homeTeam: partial.homeTeam ?? 'Home',
    awayTeam: partial.awayTeam ?? 'Away',
    league: partial.league ?? 'Premier League',
    country: partial.country ?? 'England',
    tipBand: partial.tipBand ?? 'Over 2.5 Goals',
    homeScore: partial.homeScore ?? (partial.isCorrect == null ? null : 2),
    awayScore: partial.awayScore ?? (partial.isCorrect == null ? null : 1),
    bestPerformingLeague: partial.bestPerformingLeague ?? false,
    hasGoalBandCascade: partial.hasGoalBandCascade ?? false,
    decimalOdds: partial.decimalOdds ?? null,
    selectionDateKey: partial.selectionDateKey ?? '2026-07-16',
    ...partial,
  };
}

describe('parseSelectionLastUpdatedMs', () => {
  it('parses ISO, ms, and seconds', () => {
    expect(parseSelectionLastUpdatedMs('2026-07-16T12:00:00Z')).toBe(
      Date.parse('2026-07-16T12:00:00Z'),
    );
    expect(parseSelectionLastUpdatedMs(1_700_000_000_000)).toBe(1_700_000_000_000);
    expect(parseSelectionLastUpdatedMs(1_700_000_000)).toBe(1_700_000_000_000);
  });
});

describe('parseDailySelection lastUpdated/version', () => {
  it('keeps lastUpdated and version from the payload', () => {
    const sel = parseDailySelection({
      date: '2026-07-16',
      lastUpdated: '2026-07-16T12:00:00Z',
      version: '3',
      fixtures: [
        {
          id: 1,
          date: '2026-07-16T15:00:00.000Z',
          homeTeam: { id: 1, name: 'A' },
          awayTeam: { id: 2, name: 'B' },
          league: { id: 3, name: 'Liga', country: 'Test' },
          status: 'NS',
        },
      ],
      predictions: [
        {
          fixtureId: 1,
          prediction: {
            level: 'Over 2.5 Goals',
            matchedCriteria: 5,
            totalCriteria: 11,
            significantStats: [],
          },
        },
      ],
    });
    expect(sel?.lastUpdatedMs).toBe(Date.parse('2026-07-16T12:00:00Z'));
    expect(sel?.version).toBe('3');
  });
});

describe('homepage metrics', () => {
  it('uses the longest consecutive run, not only the tail after the last loss', () => {
    const records = [
      rec({ fixtureId: 1, kickoffMs: 1000, isCorrect: true, homeTeam: 'A' }),
      rec({ fixtureId: 2, kickoffMs: 2000, isCorrect: true, homeTeam: 'B' }),
      rec({ fixtureId: 3, kickoffMs: 3000, isCorrect: true, homeTeam: 'C' }),
      rec({ fixtureId: 4, kickoffMs: 4000, isCorrect: false, homeTeam: 'D' }),
      rec({ fixtureId: 5, kickoffMs: 5000, isCorrect: true, homeTeam: 'E' }),
    ];
    const streak = computeHotStreak(records);
    expect(streak.count).toBe(3);
    expect(streak.latest?.homeTeam).toBe('C');
    expect(streak.fixtures.map((f) => f.homeTeam)).toEqual(['C', 'B', 'A']);
  });

  it('prefers the more recent run when two runs share the same length', () => {
    const streak = computeHotStreak([
      rec({ fixtureId: 1, kickoffMs: 1000, isCorrect: true, homeTeam: 'A' }),
      rec({ fixtureId: 2, kickoffMs: 2000, isCorrect: true, homeTeam: 'B' }),
      rec({ fixtureId: 3, kickoffMs: 3000, isCorrect: false, homeTeam: 'C' }),
      rec({ fixtureId: 4, kickoffMs: 4000, isCorrect: true, homeTeam: 'D' }),
      rec({ fixtureId: 5, kickoffMs: 5000, isCorrect: true, homeTeam: 'E' }),
    ]);
    expect(streak.count).toBe(2);
    expect(streak.fixtures.map((f) => f.homeTeam)).toEqual(['E', 'D']);
  });

  it('still finds a run when the latest settled tip failed', () => {
    const streak = computeHotStreak([
      rec({ fixtureId: 1, kickoffMs: 1000, isCorrect: true, homeTeam: 'A' }),
      rec({ fixtureId: 2, kickoffMs: 2000, isCorrect: true, homeTeam: 'B' }),
      rec({ fixtureId: 3, kickoffMs: 3000, isCorrect: false, homeTeam: 'C' }),
    ]);
    expect(streak.count).toBe(2);
    expect(streak.latest?.homeTeam).toBe('B');
  });

  it('returns empty streak when there are no successful settled tips', () => {
    const streak = computeHotStreak([
      rec({ fixtureId: 1, kickoffMs: 1000, isCorrect: false }),
      rec({ fixtureId: 2, kickoffMs: 2000, isCorrect: false }),
    ]);
    expect(streak.count).toBe(0);
    expect(streak.latest).toBeNull();
  });

  it('ranks best competition with min sample and tie-breakers', () => {
    const records: StatStrikeTrackRecord[] = [];
    for (let i = 0; i < 20; i++) {
      records.push(
        rec({
          fixtureId: i,
          kickoffMs: 1000 + i,
          isCorrect: i < 16,
          league: 'Eliteserien',
          country: 'Norway',
        }),
      );
    }
    for (let i = 0; i < 20; i++) {
      records.push(
        rec({
          fixtureId: 100 + i,
          kickoffMs: 2000 + i,
          isCorrect: i < 16,
          league: 'Allsvenskan',
          country: 'Sweden',
        }),
      );
    }
    // Same rate (16/20); Allsvenskan has newer last kickoff → wins tie on recency after sample tie.
    const best = computeBestCompetition(records, { minSample: 20, windowDays: 30 });
    expect(best?.competitionName).toBe('Allsvenskan');
    expect(best?.sampleSize).toBe(20);
    expect(best?.performanceRate).toBeCloseTo(0.8);
    expect(best?.platformAverage).toBeCloseTo(0.8);
  });

  it('excludes competitions below the minimum sample', () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      rec({
        fixtureId: i,
        kickoffMs: i,
        isCorrect: true,
        league: 'Tiny',
        country: 'X',
      }),
    );
    expect(computeBestCompetition(records, { minSample: 20 })).toBeNull();
  });

  it('maps freshness thresholds', () => {
    const now = 1_000_000;
    expect(modelStatusFromFreshness(now - 60_000, now)).toBe('live');
    expect(modelStatusFromFreshness(now - HOMEPAGE_FRESH_MS - 1, now)).toBe('delayed');
    expect(modelStatusFromFreshness(now - HOMEPAGE_DELAYED_MS - 1, now)).toBe('stale');
    expect(modelStatusFromFreshness(null, now)).toBe('unknown');
  });

  it('builds a full snapshot', () => {
    const sel = parseDailySelection({
      date: '2026-07-16',
      lastUpdated: '2026-07-16T12:00:00Z',
      version: '1',
      fixtures: [
        {
          id: 9,
          date: '2026-07-16T15:00:00.000Z',
          homeTeam: { id: 1, name: 'A' },
          awayTeam: { id: 2, name: 'B' },
          league: { id: 3, name: 'Liga', country: 'Test' },
          status: 'FT',
          homeScore: 2,
          awayScore: 1,
        },
      ],
      predictions: [
        {
          fixtureId: 9,
          prediction: {
            level: 'Over 2.5 Goals',
            matchedCriteria: 6,
            totalCriteria: 11,
            significantStats: [],
          },
        },
      ],
    });
    const snap = buildHomepageMetricsSnapshot({
      records: [
        rec({
          fixtureId: 9,
          kickoffMs: Date.parse('2026-07-16T15:00:00.000Z'),
          isCorrect: true,
          selectionDateKey: '2026-07-16',
        }),
      ],
      todaySelection: sel,
      todayDateKey: '2026-07-16',
      now: new Date('2026-07-16T12:05:00Z'),
      minSample: 1,
    });
    expect(snap.hotStreak.count).toBe(1);
    expect(snap.modelStatus.status).toBe('live');
    expect(snap.modelStatus.forecastsGeneratedToday).toBe(1);
    expect(snap.successDefinition).toMatch(/tip band/i);
  });
});
