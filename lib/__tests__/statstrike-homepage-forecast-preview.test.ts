import { describe, expect, it } from 'vitest';
import type { StatStrikeBoardRow, StatStrikeFixture, StatStrikePrediction } from '@/lib/statstrike/models';
import {
  boardRowToFixtureListItem,
  pickHomepageForecastPreview,
} from '@/lib/statstrike/homepage-forecast-preview';
import { hasHighFirepower } from '@/lib/statstrike/research-tags';

function fixture(partial: Partial<StatStrikeFixture> & { id: number }): StatStrikeFixture {
  return {
    id: partial.id,
    date: partial.date ?? new Date().toISOString(),
    kickoffMs: partial.kickoffMs ?? Date.now() + 3_600_000,
    homeTeam: partial.homeTeam ?? { id: 1, name: `Home ${partial.id}` },
    awayTeam: partial.awayTeam ?? { id: 2, name: `Away ${partial.id}` },
    league: partial.league ?? { id: 10, name: 'Premier League', country: 'England' },
    status: partial.status ?? 'NS',
    homeScore: partial.homeScore,
    awayScore: partial.awayScore,
    elapsed: partial.elapsed,
  };
}

function row(
  partial: Partial<StatStrikeFixture> & { id: number },
  prediction?: Partial<StatStrikePrediction> | null,
): StatStrikeBoardRow {
  const pred: StatStrikePrediction | null =
    prediction === null
      ? null
      : {
          level: 'Over 2.5 Goals',
          recommendedLevel: 'Over 2.5 Goals',
          matchedCriteria: 7,
          totalCriteria: 11,
          significantStats: [],
          ...prediction,
        };
  return {
    fixture: fixture(partial),
    prediction: pred,
    bestPerformingLeague: false,
    highFirepower: hasHighFirepower(pred?.researchTags),
    fromYesterday: false,
    selectionDateKey: '2026-07-19',
  };
}

describe('pickHomepageForecastPreview', () => {
  const now = Date.parse('2026-07-19T15:00:00Z');

  it('prefers up to 3 live fixtures', () => {
    const rows = [
      row({ id: 1, status: '1H', kickoffMs: now - 3_600_000 }),
      row({ id: 2, status: '2H', kickoffMs: now - 2_000_000 }),
      row({ id: 3, status: 'HT', kickoffMs: now - 1_000_000 }),
      row({ id: 4, status: 'FT', kickoffMs: now - 5_000_000, homeScore: 2, awayScore: 1 }),
      row({ id: 5, status: 'NS', kickoffMs: now + 3_600_000 }),
    ];
    const picked = pickHomepageForecastPreview(rows, { nowMs: now });
    expect(picked.map((r) => r.fixture.id)).toEqual([1, 2, 3]);
  });

  it('uses last 3 FT when nothing is live', () => {
    const rows = [
      row({ id: 1, status: 'FT', kickoffMs: now - 9_000_000, homeScore: 1, awayScore: 0 }),
      row({ id: 2, status: 'FT', kickoffMs: now - 6_000_000, homeScore: 2, awayScore: 2 }),
      row({ id: 3, status: 'AET', kickoffMs: now - 3_000_000, homeScore: 3, awayScore: 2 }),
      row({ id: 4, status: 'FT', kickoffMs: now - 12_000_000, homeScore: 0, awayScore: 1 }),
      row({ id: 5, status: 'NS', kickoffMs: now + 3_600_000 }),
    ];
    const picked = pickHomepageForecastPreview(rows, { nowMs: now });
    expect(picked.map((r) => r.fixture.id)).toEqual([3, 2, 1]);
  });

  it('fills live shortfall with most recent FT', () => {
    const rows = [
      row({ id: 10, status: '1H', kickoffMs: now - 1_000_000 }),
      row({ id: 20, status: 'FT', kickoffMs: now - 2_000_000, homeScore: 1, awayScore: 1 }),
      row({ id: 21, status: 'FT', kickoffMs: now - 4_000_000, homeScore: 2, awayScore: 0 }),
      row({ id: 22, status: 'FT', kickoffMs: now - 8_000_000, homeScore: 0, awayScore: 0 }),
      row({ id: 30, status: 'NS', kickoffMs: now + 3_600_000 }),
    ];
    const picked = pickHomepageForecastPreview(rows, { nowMs: now });
    expect(picked.map((r) => r.fixture.id)).toEqual([10, 20, 21]);
  });

  it('fills with upcoming when live+FT are short', () => {
    const rows = [
      row({ id: 1, status: '2H', kickoffMs: now - 500_000 }),
      row({ id: 2, status: 'NS', kickoffMs: now + 1_800_000 }),
      row({ id: 3, status: 'NS', kickoffMs: now + 3_600_000 }),
    ];
    const picked = pickHomepageForecastPreview(rows, { nowMs: now });
    expect(picked.map((r) => r.fixture.id)).toEqual([1, 2, 3]);
  });

  it('ignores cancelled when filling FT slots', () => {
    const rows = [
      row({ id: 1, status: 'CANC', kickoffMs: now - 1_000_000 }),
      row({ id: 2, status: 'FT', kickoffMs: now - 2_000_000, homeScore: 1, awayScore: 0 }),
      row({ id: 3, status: 'NS', kickoffMs: now + 3_600_000 }),
    ];
    const picked = pickHomepageForecastPreview(rows, { nowMs: now });
    expect(picked.map((r) => r.fixture.id)).toEqual([2, 3]);
  });
});

describe('boardRowToFixtureListItem', () => {
  it('maps tip band and score for GoalLab cards', () => {
    const item = boardRowToFixtureListItem(
      row(
        { id: 42, status: 'FT', homeScore: 2, awayScore: 1, kickoffMs: 1 },
        { matchedCriteria: 8, totalCriteria: 10 },
      ),
    );
    expect(item.fixtureId).toBe(42);
    expect(item.scoreDisplay).toBe('2–1');
    expect(item.pick.confidence).toBeUndefined();
    expect(item.pick.predictedBand).toBe('Over 2.5 Goals');
    expect(item.pick.forecastType).toBe('Over 2.5 Goals');
  });
});
