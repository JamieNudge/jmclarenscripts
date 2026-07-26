import { describe, expect, it } from 'vitest';
import type { FixtureListItem } from '@/lib/fixtures-browser';
import {
  FORECASTS_FREE_PREVIEW_LIMIT,
  freeForecastFixtureIds,
} from '@/lib/statstrike/forecasts-teaser';

function fx(
  id: number,
  opts: { kickoffMs?: number | null; status?: string } = {},
): FixtureListItem {
  const kickoffMs = 'kickoffMs' in opts ? (opts.kickoffMs ?? null) : id * 1_000;
  return {
    fixtureId: id,
    home: `Home ${id}`,
    away: `Away ${id}`,
    leagueKey: 'England · Premier League',
    country: 'England',
    league: 'Premier League',
    kickoffMs,
    scoreDisplay: '–',
    pick: {
      id,
      fixtureId: id,
      homeTeam: `Home ${id}`,
      awayTeam: `Away ${id}`,
      status: opts.status ?? 'NS',
    },
  };
}

describe('freeForecastFixtureIds', () => {
  it('returns empty set for empty input', () => {
    expect(freeForecastFixtureIds([]).size).toBe(0);
  });

  it('returns empty set when limit is zero', () => {
    expect(freeForecastFixtureIds([fx(1)], 0).size).toBe(0);
  });

  it('respects the limit', () => {
    const fixtures = Array.from({ length: 10 }, (_, i) => fx(i + 1));
    expect(freeForecastFixtureIds(fixtures, 3).size).toBe(3);
  });

  it('prioritises live fixtures over earlier kickoffs', () => {
    const fixtures = [
      fx(1, { kickoffMs: 1_000, status: 'NS' }),
      fx(2, { kickoffMs: 2_000, status: 'NS' }),
      fx(3, { kickoffMs: 9_000, status: '2H' }),
    ];
    const free = freeForecastFixtureIds(fixtures, 1);
    expect(free.has('3')).toBe(true);
    expect(free.size).toBe(1);
  });

  it('orders non-live fixtures by earliest kickoff', () => {
    const fixtures = [
      fx(1, { kickoffMs: 5_000, status: 'NS' }),
      fx(2, { kickoffMs: 1_000, status: 'NS' }),
      fx(3, { kickoffMs: 3_000, status: 'NS' }),
    ];
    const free = freeForecastFixtureIds(fixtures, 2);
    expect(free.has('2')).toBe(true);
    expect(free.has('3')).toBe(true);
    expect(free.has('1')).toBe(false);
  });

  it('defaults to FORECASTS_FREE_PREVIEW_LIMIT', () => {
    const fixtures = Array.from({ length: 20 }, (_, i) => fx(i + 1));
    expect(freeForecastFixtureIds(fixtures).size).toBe(FORECASTS_FREE_PREVIEW_LIMIT);
  });

  it('handles null kickoff without throwing', () => {
    const fixtures = [fx(1, { kickoffMs: null }), fx(2, { kickoffMs: 2_000 })];
    const free = freeForecastFixtureIds(fixtures, 1);
    expect(free.has('2')).toBe(true);
  });
});
