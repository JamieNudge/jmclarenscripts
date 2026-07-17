import { describe, expect, it } from 'vitest';
import { parseDailySelection } from '@/lib/statstrike/parse-selection';
import {
  bestPerformingDigestChipTitle,
  bestPerformingSevenDayDigest,
  goalBandCascadeOverGoalsRates,
  goalBandCascadeSuccessRate,
  recordsFromSelection,
} from '@/lib/statstrike/track-record';

describe('track-record', () => {
  it('builds records and settles finished tips', () => {
    const sel = parseDailySelection({
      date: '2026-07-16',
      fixtures: [
        {
          id: 1,
          date: '2026-07-16T15:00:00.000Z',
          homeTeam: { id: 1, name: 'A' },
          awayTeam: { id: 2, name: 'B' },
          league: { id: 3, name: 'Premier League', country: 'England' },
          status: 'FT',
          homeScore: 2,
          awayScore: 1,
        },
      ],
      predictions: [
        {
          fixtureId: 1,
          prediction: {
            level: 'Over 2.5 Goals',
            matchedCriteria: 7,
            totalCriteria: 11,
            significantStats: [],
            bookmakerOdds: 1.9,
            goalBandCascade: {
              source: 'signal-review',
              recommendedBands: ['O2.5', 'O3.5'],
              forecasterConfidence: 90,
            },
          },
        },
      ],
      leaguePerformance: { 'England - Premier League': 75 },
    });
    const records = recordsFromSelection(sel!, '2026-07-16');
    expect(records).toHaveLength(1);
    expect(records[0].isCorrect).toBe(true);
    expect(records[0].bestPerformingLeague).toBe(true);
    expect(records[0].hasGoalBandCascade).toBe(true);
  });

  it('computes 7-day BP digest and GBC rates', () => {
    const now = new Date('2026-07-16T12:00:00');
    const kick = Date.parse('2026-07-15T15:00:00');
    const records = [
      {
        fixtureId: 1,
        homeTeam: 'A',
        awayTeam: 'B',
        league: 'Premier League',
        country: 'England',
        kickoffMs: kick,
        tipBand: 'Over 2.5 Goals',
        homeScore: 3,
        awayScore: 1,
        isCorrect: true,
        bestPerformingLeague: true,
        hasGoalBandCascade: true,
        decimalOdds: 1.8,
        selectionDateKey: '2026-07-15',
      },
      {
        fixtureId: 2,
        homeTeam: 'C',
        awayTeam: 'D',
        league: 'Premier League',
        country: 'England',
        kickoffMs: kick,
        tipBand: 'Over 2.5 Goals',
        homeScore: 1,
        awayScore: 0,
        isCorrect: false,
        bestPerformingLeague: true,
        hasGoalBandCascade: true,
        decimalOdds: 2.0,
        selectionDateKey: '2026-07-15',
      },
      {
        fixtureId: 3,
        homeTeam: 'E',
        awayTeam: 'F',
        league: 'Serie A',
        country: 'Italy',
        kickoffMs: kick,
        tipBand: 'Over 3.5 Goals',
        homeScore: 2,
        awayScore: 2,
        isCorrect: true,
        bestPerformingLeague: true,
        hasGoalBandCascade: false,
        decimalOdds: null,
        selectionDateKey: '2026-07-15',
      },
    ];

    const digest = bestPerformingSevenDayDigest(records, now, 7);
    expect(digest).not.toBeNull();
    expect(digest!.completedCount).toBe(3);
    expect(digest!.correctCount).toBe(2);
    expect(digest!.hitRatePercent).toBeCloseTo(66.666, 1);
    expect(bestPerformingDigestChipTitle(digest!)).toContain('67%');

    const gbc = goalBandCascadeSuccessRate(records);
    expect(gbc.total).toBe(2);
    expect(gbc.correct).toBe(1);

    const over = goalBandCascadeOverGoalsRates(records);
    expect(over[0].level).toBe('Over 2.5');
    expect(over[0].hits).toBe(1); // only fixture 1 has >= 3 goals in GBC cohort
    expect(over[1].hits).toBe(1); // >= 4
    expect(over[2].hits).toBe(0); // >= 5
  });
});
