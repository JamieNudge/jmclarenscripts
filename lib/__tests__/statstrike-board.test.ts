import { describe, expect, it } from 'vitest';
import { mergeBoardRows } from '@/lib/statstrike/board-merge';
import { isWinningForecast, predictionResultForFixture } from '@/lib/statstrike/correctness';
import {
  displayBandRows,
  displayLabelForBand,
  parseGoalBandCascade,
} from '@/lib/statstrike/goal-band-cascade';
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

  it('parses optional goalBandCascade on predictions', () => {
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
            significantStats: [],
            goalBandCascade: {
              source: 'signal-review',
              recommendedBands: ['O2.5', 'O3.5', 'O4.5'],
              forecasterConfidence: 100,
              bandOdds: [
                { band: 'O2.5', decimalOdds: 1.17, impliedProbability: 85.47 },
                { band: 'O3.5', decimalOdds: 1.47, impliedProbability: 68.03 },
                { band: 'O4.5', decimalOdds: 2.06, impliedProbability: 48.54 },
              ],
              qualifiers: ['criteriaExact'],
            },
          },
        },
      ],
      leaguePerformance: {},
      leagueTrackRecord: {},
      leagueBandTrackRecord: {},
      statsByFixtureId: new Map(),
    });
    const gbc = sel!.predictionsByFixtureId.get(99)?.goalBandCascade;
    expect(gbc).not.toBeNull();
    expect(gbc!.recommendedBands).toEqual(['O2.5', 'O3.5', 'O4.5']);
    expect(gbc!.bandOdds?.[1]?.decimalOdds).toBe(1.47);
    expect(displayBandRows(gbc!)).toEqual([
      { bandKey: 'O2.5', label: 'Over 2.5', decimalOdds: 1.17 },
      { bandKey: 'O3.5', label: 'Over 3.5', decimalOdds: 1.47 },
      { bandKey: 'O4.5', label: 'Over 4.5', decimalOdds: 2.06 },
    ]);
  });

  it('omits empty goalBandCascade', () => {
    const sel = parseDailySelection({
      date: '2026-07-16',
      fixtures: [],
      predictions: [
        {
          fixtureId: 1,
          prediction: {
            level: 'Over 2.5 Goals',
            matchedCriteria: 5,
            totalCriteria: 11,
            significantStats: [],
            goalBandCascade: { source: 'x', recommendedBands: [], forecasterConfidence: 0 },
          },
        },
      ],
      leaguePerformance: {},
      leagueTrackRecord: {},
      leagueBandTrackRecord: {},
      statsByFixtureId: new Map(),
    });
    expect(sel!.predictionsByFixtureId.get(1)?.goalBandCascade).toBeNull();
  });
});

describe('goalBandCascade helpers', () => {
  it('normalizes display labels', () => {
    expect(displayLabelForBand('O2.5')).toBe('Over 2.5');
    expect(displayLabelForBand('Over 3.5 Goals')).toBe('Over 3.5');
    expect(displayLabelForBand('O4.5')).toBe('Over 4.5');
  });

  it('returns null for missing cascade payload', () => {
    expect(parseGoalBandCascade(null)).toBeNull();
    expect(parseGoalBandCascade(undefined)).toBeNull();
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
      leagueTrackRecord: {},
      leagueBandTrackRecord: {},
      statsByFixtureId: new Map(),
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
      leagueTrackRecord: {},
      leagueBandTrackRecord: {},
      statsByFixtureId: new Map(),
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

  it('does not merge adjacent-day fixtures when carry-over is disabled (Tomorrow browse)', () => {
    const now = Date.parse('2026-07-16T12:00:00.000Z');
    const calendarToday: StatStrikeDailySelection = {
      date: '2026-07-16',
      fixtures: [
        fixture({
          id: 10,
          status: 'NS',
          kickoffMs: now + 3600_000,
          homeTeam: { id: 1, name: 'Today NS' },
        }),
        fixture({
          id: 11,
          status: '2H',
          kickoffMs: now - 1800_000,
          homeTeam: { id: 1, name: 'Today Live' },
        }),
      ],
      predictionsByFixtureId: new Map([
        [10, { level: 'Over 2.5 Goals', matchedCriteria: 6, totalCriteria: 11, significantStats: [] }],
        [11, { level: 'Over 2.5 Goals', matchedCriteria: 6, totalCriteria: 11, significantStats: [] }],
      ]),
      leaguePerformance: {},
      leagueTrackRecord: {},
      leagueBandTrackRecord: {},
      statsByFixtureId: new Map(),
    };
    const tomorrow: StatStrikeDailySelection = {
      date: '2026-07-17',
      fixtures: [
        fixture({
          id: 20,
          status: 'NS',
          kickoffMs: now + 86_400_000,
          homeTeam: { id: 1, name: 'Tomorrow Only' },
        }),
      ],
      predictionsByFixtureId: new Map([
        [20, { level: 'Over 2.5 Goals', matchedCriteria: 7, totalCriteria: 11, significantStats: [] }],
      ]),
      leaguePerformance: {},
      leagueTrackRecord: {},
      leagueBandTrackRecord: {},
      statsByFixtureId: new Map(),
    };

    const rows = mergeBoardRows({
      todayKey: '2026-07-17',
      yesterdayKey: '2026-07-16',
      today: tomorrow,
      yesterday: calendarToday,
      nowMs: now,
      includeYesterdayCarryOver: false,
    });

    expect(rows.map((r) => r.fixture.id)).toEqual([20]);
    expect(rows[0].fromYesterday).toBe(false);
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

describe('board filters', () => {
  it('filters live and best performing; groups by day/time/league', async () => {
    const { DEFAULT_BOARD_FILTERS, presentBoardRows, rowPassesBoardFilters } = await import(
      '@/lib/statstrike/board-filters'
    );
    const { isUpperDivision } = await import('@/lib/statstrike/upper-divisions');

    expect(isUpperDivision('England', 'Premier League')).toBe(true);
    expect(isUpperDivision('England', 'National League')).toBe(false);

    const now = Date.parse('2026-07-16T15:00:00.000Z');
    const rows = [
      {
        fixture: fixture({
          id: 1,
          status: '2H',
          kickoffMs: now,
          league: { id: 1, name: 'Premier League', country: 'England' },
          homeTeam: { id: 1, name: 'Arsenal' },
        }),
        prediction: {
          level: 'Over 2.5 Goals',
          matchedCriteria: 6,
          totalCriteria: 11,
          significantStats: [],
        },
        bestPerformingLeague: true,
        fromYesterday: false,
        selectionDateKey: '2026-07-16',
      },
      {
        fixture: fixture({
          id: 2,
          status: 'NS',
          kickoffMs: now + 7200_000,
          league: { id: 2, name: 'National League', country: 'England' },
          homeTeam: { id: 3, name: 'Barnet' },
        }),
        prediction: {
          level: 'Under 2.5 Goals',
          matchedCriteria: 5,
          totalCriteria: 11,
          significantStats: [],
        },
        bestPerformingLeague: false,
        fromYesterday: false,
        selectionDateKey: '2026-07-16',
      },
    ];

    expect(
      rowPassesBoardFilters(rows[0], { ...DEFAULT_BOARD_FILTERS, time: 'live' }),
    ).toBe(true);
    expect(
      rowPassesBoardFilters(rows[1], { ...DEFAULT_BOARD_FILTERS, time: 'live' }),
    ).toBe(false);
    expect(
      rowPassesBoardFilters(rows[0], { ...DEFAULT_BOARD_FILTERS, league: 'bestPerforming' }),
    ).toBe(true);
    expect(
      rowPassesBoardFilters(rows[1], { ...DEFAULT_BOARD_FILTERS, league: 'major' }),
    ).toBe(false);
    expect(
      rowPassesBoardFilters(rows[1], { ...DEFAULT_BOARD_FILTERS, search: 'bar' }),
    ).toBe(true);

    const groups = presentBoardRows(rows, DEFAULT_BOARD_FILTERS, { timeZone: 'UTC' });
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0].timeGroups.length).toBeGreaterThan(0);
  });
});
