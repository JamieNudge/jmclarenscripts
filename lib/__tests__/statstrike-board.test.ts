import { describe, expect, it } from 'vitest';
import { mergeBoardRows } from '@/lib/statstrike/board-merge';
import { isWinningForecast, predictionResultForFixture } from '@/lib/statstrike/correctness';
import type { StatStrikeDailySelection, StatStrikeFixture } from '@/lib/statstrike/models';
import { parseDailySelection } from '@/lib/statstrike/parse-selection';
import { ukSelectionDateKeyOffset } from '@/lib/statstrike/uk-date';

function fixture(partial: Partial<StatStrikeFixture> & { id: number }): StatStrikeFixture {
  return {
    id: partial.id,
    date: partial.date ?? new Date().toISOString(),
    kickoffMs: partial.kickoffMs ?? Date.now() + 3_600_000,
    homeTeam: partial.homeTeam ?? { id: 1, name: 'Home' },
    awayTeam: partial.awayTeam ?? { id: 2, name: 'Away' },
    league: partial.league ?? { id: 10, name: 'Premier League', country: 'England' },
    status: partial.status ?? 'NS',
    homeScore: partial.homeScore,
    awayScore: partial.awayScore,
    elapsed: partial.elapsed,
  };
}

describe('parseDailySelection', () => {
  it('parses fixtures and predictions', () => {
    const sel = parseDailySelection({
      date: '2026-07-16',
      fixtures: [
        {
          id: 99,
          date: '2026-07-16T15:00:00.000Z',
          homeTeam: { id: 1, name: 'Alpha' },
          awayTeam: { id: 2, name: 'Beta' },
          league: { id: 3, name: 'Liga', country: 'Test' },
          status: 'NS',
        },
      ],
      predictions: [
        {
          fixtureId: 99,
          prediction: {
            level: 'Over 2.5 Goals',
            matchedCriteria: 7,
            totalCriteria: 11,
            significantStats: ['a'],
          },
        },
      ],
      leaguePerformance: { 'Test - Liga': 72 },
    });
    expect(sel).not.toBeNull();
    expect(sel!.fixtures).toHaveLength(1);
    expect(sel!.predictionsByFixtureId.get(99)?.level).toBe('Over 2.5 Goals');
    expect(sel!.leaguePerformance['Test - Liga']).toBe(72);
  });
});

describe('mergeBoardRows', () => {
  it('carries live yesterday fixtures and prefers today on id clash', () => {
    const now = Date.parse('2026-07-16T12:00:00.000Z');
    const yesterday: StatStrikeDailySelection = {
      date: '2026-07-15',
      fixtures: [
        fixture({ id: 1, status: '2H', kickoffMs: now - 3600_000, homeTeam: { id: 1, name: 'Yest Live' } }),
        fixture({ id: 2, status: 'CANC', kickoffMs: now - 7200_000, homeTeam: { id: 1, name: 'Yest Canc' } }),
      ],
      predictionsByFixtureId: new Map([
        [1, { level: 'Over 2.5 Goals', matchedCriteria: 6, totalCriteria: 11, significantStats: [] }],
        [2, { level: 'Under 2.5 Goals', matchedCriteria: 5, totalCriteria: 11, significantStats: [] }],
      ]),
      leaguePerformance: {},
    };
    const today: StatStrikeDailySelection = {
      date: '2026-07-16',
      fixtures: [
        fixture({
          id: 1,
          status: 'NS',
          kickoffMs: now + 7200_000,
          homeTeam: { id: 1, name: 'Today Wins' },
        }),
        fixture({ id: 3, status: 'NS', kickoffMs: now + 3600_000 }),
        fixture({
          id: 4,
          status: 'FT',
          kickoffMs: now - 1800_000,
          homeScore: 2,
          awayScore: 1,
          homeTeam: { id: 1, name: 'Finished Win' },
        }),
      ],
      predictionsByFixtureId: new Map([
        [1, { level: 'Over 3.5 Goals', matchedCriteria: 8, totalCriteria: 11, significantStats: [] }],
        [3, { level: 'Over 2.5 Goals', matchedCriteria: 7, totalCriteria: 11, significantStats: [] }],
        [4, { level: 'Over 2.5 Goals', matchedCriteria: 6, totalCriteria: 11, significantStats: [] }],
      ]),
      leaguePerformance: {},
    };

    const rows = mergeBoardRows({
      todayKey: '2026-07-16',
      yesterdayKey: '2026-07-15',
      today,
      yesterday,
      nowMs: now,
    });

    expect(rows.map((r) => r.fixture.id).sort()).toEqual([1, 3, 4]);
    const clash = rows.find((r) => r.fixture.id === 1)!;
    expect(clash.fixture.homeTeam.name).toBe('Today Wins');
    expect(clash.fromYesterday).toBe(false);
    expect(clash.prediction?.level).toBe('Over 3.5 Goals');
  });
});

describe('winning forecast', () => {
  it('matches iOS band rules', () => {
    expect(isWinningForecast('Over 2.5 Goals', 3)).toBe(true);
    expect(isWinningForecast('Over 2.5 Goals', 2)).toBe(false);
    expect(isWinningForecast('Under 2.5 Goals', 2)).toBe(true);
    expect(isWinningForecast('Under 2.5 Goals', 3)).toBe(false);
  });

  it('returns win for finished fixture with matching band', () => {
    const f = fixture({
      id: 10,
      status: 'FT',
      homeScore: 2,
      awayScore: 1,
    });
    expect(
      predictionResultForFixture(f, {
        level: 'Over 2.5 Goals',
        matchedCriteria: 6,
        totalCriteria: 11,
        significantStats: [],
      }),
    ).toBe(true);
  });
});

describe('ukSelectionDateKeyOffset', () => {
  it('returns a yyyy-MM-dd string for yesterday', () => {
    const key = ukSelectionDateKeyOffset(-1, new Date('2026-07-16T15:00:00+01:00'));
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
