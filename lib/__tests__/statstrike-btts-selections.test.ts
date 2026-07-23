import { describe, expect, it } from 'vitest';
import {
  parseBTTSSelectionsPayload,
  predictionFromBTTSPick,
} from '@/lib/statstrike/btts-selections';
import { bttsSelectionsPathForDateKey } from '@/lib/statstrike/uk-date';
import { parseDailySelection } from '@/lib/statstrike/parse-selection';
import { recordsFromBTTSSelections } from '@/lib/statstrike/track-record';
import { mergeBoardRows } from '@/lib/statstrike/board-merge';
import type { StatStrikeDailySelection, StatStrikeFixture } from '@/lib/statstrike/models';

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

describe('bttsSelectionsPathForDateKey', () => {
  it('defaults to bttsSelections/{date}', () => {
    expect(bttsSelectionsPathForDateKey('2026-07-23')).toBe('bttsSelections/2026-07-23');
  });
});

describe('parseBTTSSelectionsPayload', () => {
  it('parses valid picks and ignores non-BTTS bands', () => {
    const parsed = parseBTTSSelectionsPayload({
      schemaVersion: '1',
      date: '2026-07-23',
      source: 'firebase-native+v2',
      picks: [
        { fixtureId: 10, level: 'BTTS Yes', confidence: 0.72 },
        { fixtureId: 11, level: 'BTTS No', confidence: 0.55 },
        { fixtureId: 12, level: 'Over 2.5 Goals', confidence: 0.99 },
        { fixtureId: '13', level: 'BTTS Yes', confidence: 1.5 },
      ],
    });
    expect(parsed).not.toBeNull();
    expect(parsed!.picksByFixtureId.size).toBe(3);
    expect(parsed!.picksByFixtureId.get(10)?.level).toBe('BTTS Yes');
    expect(parsed!.picksByFixtureId.get(10)?.confidence).toBe(0.72);
    expect(parsed!.picksByFixtureId.get(13)?.confidence).toBe(1);
    expect(parsed!.picksByFixtureId.has(12)).toBe(false);
  });

  it('returns empty map for missing picks array', () => {
    const parsed = parseBTTSSelectionsPayload({ schemaVersion: '1', date: '2026-07-23' });
    expect(parsed?.picksByFixtureId.size).toBe(0);
  });

  it('maps confidence to matchedCriteria like iOS', () => {
    const pred = predictionFromBTTSPick({
      fixtureId: 1,
      level: 'BTTS Yes',
      confidence: 0.55,
    });
    expect(pred.level).toBe('BTTS Yes');
    expect(pred.matchedCriteria).toBe(6);
    expect(pred.totalCriteria).toBe(11);
  });
});

describe('mergeBoardRows BTTS attach', () => {
  it('attaches BTTS tip onto existing O/U board rows only', () => {
    const now = Date.parse('2026-07-23T12:00:00.000Z');
    const today: StatStrikeDailySelection = {
      date: '2026-07-23',
      fixtures: [
        fixture({ id: 10, kickoffMs: now + 3_600_000, status: 'NS' }),
        fixture({ id: 99, kickoffMs: now + 7_200_000, status: 'NS' }),
      ],
      predictionsByFixtureId: new Map([
        [
          10,
          {
            level: 'Over 2.5 Goals',
            matchedCriteria: 7,
            totalCriteria: 11,
            significantStats: [],
          },
        ],
        [
          99,
          {
            level: 'Under 2.5 Goals',
            matchedCriteria: 6,
            totalCriteria: 11,
            significantStats: [],
          },
        ],
      ]),
      leaguePerformance: {},
      leagueTrackRecord: {},
      leagueBandTrackRecord: {},
      statsByFixtureId: new Map(),
      lastUpdatedMs: null,
      version: null,
    };

    const todayBTTSPicks = new Map([
      [10, { fixtureId: 10, level: 'BTTS Yes' as const, confidence: 0.7 }],
      // BTTS-only fixture not on O/U board predictions with criteria — still only attaches to board rows
      [50, { fixtureId: 50, level: 'BTTS No' as const, confidence: 0.6 }],
    ]);

    const rows = mergeBoardRows({
      todayKey: '2026-07-23',
      yesterdayKey: '2026-07-22',
      today,
      yesterday: null,
      nowMs: now,
      includeYesterdayCarryOver: false,
      todayBTTSPicks,
    });

    expect(rows).toHaveLength(2);
    const withBtts = rows.find((r) => r.fixture.id === 10);
    const without = rows.find((r) => r.fixture.id === 99);
    expect(withBtts?.bttsPrediction?.level).toBe('BTTS Yes');
    expect(without?.bttsPrediction).toBeNull();
    expect(rows.some((r) => r.fixture.id === 50)).toBe(false);
  });
});

describe('recordsFromBTTSSelections', () => {
  it('joins BTTS picks to selection fixtures and settles FT', () => {
    const sel = parseDailySelection({
      date: '2026-07-23',
      fixtures: [
        {
          id: 10,
          date: '2026-07-23T15:00:00.000Z',
          homeTeam: { id: 1, name: 'A' },
          awayTeam: { id: 2, name: 'B' },
          league: { id: 3, name: 'Premier League', country: 'England' },
          status: 'FT',
          homeScore: 2,
          awayScore: 1,
        },
        {
          id: 11,
          date: '2026-07-23T17:00:00.000Z',
          homeTeam: { id: 4, name: 'C' },
          awayTeam: { id: 5, name: 'D' },
          league: { id: 3, name: 'Premier League', country: 'England' },
          status: 'FT',
          homeScore: 1,
          awayScore: 0,
        },
      ],
      predictions: [
        {
          fixtureId: 10,
          prediction: {
            level: 'Over 2.5 Goals',
            matchedCriteria: 7,
            totalCriteria: 11,
            significantStats: [],
          },
        },
      ],
      leaguePerformance: { 'England - Premier League': 75 },
    });

    const records = recordsFromBTTSSelections(
      [
        { fixtureId: 10, level: 'BTTS Yes', confidence: 0.7 },
        { fixtureId: 11, level: 'BTTS No', confidence: 0.6 },
        { fixtureId: 999, level: 'BTTS Yes', confidence: 0.9 },
      ],
      sel,
      '2026-07-23',
    );

    expect(records).toHaveLength(2);
    expect(records.find((r) => r.fixtureId === 10)?.isCorrect).toBe(true);
    expect(records.find((r) => r.fixtureId === 11)?.isCorrect).toBe(true);
    expect(records.find((r) => r.fixtureId === 10)?.tipBand).toBe('BTTS Yes');
    expect(records.some((r) => r.fixtureId === 999)).toBe(false);
  });
});
