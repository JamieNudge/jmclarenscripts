import { describe, expect, it } from 'vitest';
import { fixtureListItemWinResult, type FixtureListItem } from '@/lib/fixtures-browser';

function item(partial: {
  status?: string;
  homeScore?: number;
  awayScore?: number;
  band?: string;
}): FixtureListItem {
  return {
    fixtureId: 1,
    home: 'Home',
    away: 'Away',
    leagueKey: 'Test',
    country: 'Test',
    league: 'Liga',
    kickoffMs: 1,
    scoreDisplay: `${partial.homeScore ?? 0}–${partial.awayScore ?? 0}`,
    pick: {
      status: partial.status,
      homeScore: partial.homeScore,
      awayScore: partial.awayScore,
      predictedBand: partial.band ?? 'Over 2.5 Goals',
    },
  };
}

describe('fixtureListItemWinResult', () => {
  it('does not claim WIN while the match is still in play', () => {
    expect(
      fixtureListItemWinResult(
        item({ status: '2H', homeScore: 0, awayScore: 0, band: 'Under 2.5 Goals' }),
      ),
    ).toBeNull();
    expect(
      fixtureListItemWinResult(
        item({ status: '1H', homeScore: 3, awayScore: 0, band: 'Over 2.5 Goals' }),
      ),
    ).toBeNull();
  });

  it('settles WIN only after FT/AET/PEN', () => {
    expect(
      fixtureListItemWinResult(
        item({ status: 'FT', homeScore: 0, awayScore: 0, band: 'Under 2.5 Goals' }),
      ),
    ).toBe(true);
    expect(
      fixtureListItemWinResult(
        item({ status: 'FT', homeScore: 3, awayScore: 0, band: 'Over 2.5 Goals' }),
      ),
    ).toBe(true);
    expect(
      fixtureListItemWinResult(
        item({ status: 'FT', homeScore: 2, awayScore: 1, band: 'Under 2.5 Goals' }),
      ),
    ).toBe(false);
  });
});
