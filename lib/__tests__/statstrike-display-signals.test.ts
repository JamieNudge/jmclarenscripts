import { describe, expect, it } from 'vitest';
import {
  isSourceMarkerStatLine,
  resolvedDisplayKeySignals,
  userFacingSignificantStat,
} from '@/lib/statstrike/display-signals';
import type { StatStrikePrediction } from '@/lib/statstrike/models';

describe('display-signals', () => {
  it('filters Desktop source markers from key signals', () => {
    expect(isSourceMarkerStatLine('Merged from Desktop Curated O2.5')).toBe(true);
    expect(isSourceMarkerStatLine('Away Team Over 2.5%')).toBe(false);
  });

  it('formats consumer labels with stats values', () => {
    const stats = {
      h2hLast6Over25Percent: 50,
      h2hHomeVenueLast6Over25Percent: 50,
      bttsHomeVenueLast6Percent: 50,
      homeTeamLast6HomeOver25Percent: 50,
      awayTeamLast6AwayOver25Percent: 67,
      homeConcessionLast6HomePercent: 50,
      awayConcessionLast6AwayPercent: 83,
      homeAvgGoalsLast6Home: 2,
      awayAvgGoalsLast6Away: 3.3,
      h2hHomeVenueAvgGoals: 2,
      h2hAllVenuesAvgGoals: 2,
    };
    expect(userFacingSignificantStat('Away Team Over 2.5%', stats)).toBe('Away @ away O2.5: 67%');
    expect(userFacingSignificantStat('Away Concession%', stats)).toBe('Away @ away conceded: 83%');
    expect(userFacingSignificantStat('Away Avg Goals', stats)).toBe('Away @ away avg goals: 3.3');
  });

  it('hides Merged markers and derives O2.5 lines from stats when needed', () => {
    const prediction: StatStrikePrediction = {
      level: 'Over 2.5 Goals',
      matchedCriteria: 6,
      totalCriteria: 11,
      significantStats: ['Merged from Desktop Curated O2.5'],
    };
    const stats = {
      h2hLast6Over25Percent: 70,
      h2hHomeVenueLast6Over25Percent: 70,
      bttsHomeVenueLast6Percent: 70,
      homeTeamLast6HomeOver25Percent: 70,
      awayTeamLast6AwayOver25Percent: 67,
      homeConcessionLast6HomePercent: 80,
      awayConcessionLast6AwayPercent: 83,
      homeAvgGoalsLast6Home: 3.5,
      awayAvgGoalsLast6Away: 3.3,
      h2hHomeVenueAvgGoals: 3.5,
      h2hAllVenuesAvgGoals: 3.5,
    };
    const lines = resolvedDisplayKeySignals(prediction, stats);
    expect(lines.some((l) => l.includes('Merged'))).toBe(false);
    expect(lines.some((l) => l.includes('Away @ away O2.5'))).toBe(true);
  });
});
