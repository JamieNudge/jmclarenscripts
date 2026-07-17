import {
  archiveBandLookupKey,
  leaguePerformanceLookupKey,
} from '@/lib/best-picks-firebase';
import type { FixtureStatsSummary } from '@/lib/fixture-key-signals';
import type {
  StatStrikeFixture,
  StatStrikeLeagueTrackRecord,
  StatStrikePrediction,
} from '@/lib/statstrike/models';

export type StatStrikeTrackRecordDisplay = {
  trackRecord: StatStrikeLeagueTrackRecord;
  title: string;
  helperText: string | null;
};

/** iOS `isSourceMarkerStatLine` — Desktop provenance tags are not consumer key signals. */
export function isSourceMarkerStatLine(line: string): boolean {
  return (
    line.includes('Desktop') ||
    line.includes('Merged') ||
    line.includes('Reconciled') ||
    line.includes('Manual')
  );
}

function displayFormattedSignificantStat(raw: string): string {
  return raw.replace(/O2\.5%/g, 'O2.5');
}

/**
 * iOS `Prediction.userFacingSignificantStat` — compact consumer labels with live values from stats.
 */
export function userFacingSignificantStat(raw: string, stats: FixtureStatsSummary | null): string {
  const isLenient = raw.toLowerCase().includes('lenient');
  const decorate = (base: string) => (isLenient ? `${base} (lenient)` : base);
  const percentLine = (label: string, value: number) =>
    decorate(`${label}: ${Math.round(value)}%`);
  const decimalLine = (label: string, value: number) =>
    decorate(`${label}: ${value.toFixed(1)}`);

  if (!stats) return decorate(displayFormattedSignificantStat(raw));

  if (raw.includes('H2H Home Venue Over 2.5%') || raw.includes('H2H Home Venue O2.5%')) {
    return percentLine('H2H @ venue O2.5', stats.h2hHomeVenueLast6Over25Percent);
  }
  if (raw.includes('H2H Over 2.5%') || raw.includes('H2H Last 6 O2.5%')) {
    return percentLine('H2H O2.5', stats.h2hLast6Over25Percent);
  }
  if (raw.includes('BTTS Home Venue')) {
    return percentLine('H2H @ venue BTTS', stats.bttsHomeVenueLast6Percent);
  }
  if (raw.includes('Home Team Over 2.5%') || raw.includes('Home Team O2.5%')) {
    return percentLine('Home @ home O2.5', stats.homeTeamLast6HomeOver25Percent);
  }
  if (raw.includes('Away Team Over 2.5%') || raw.includes('Away Team O2.5%')) {
    return percentLine('Away @ away O2.5', stats.awayTeamLast6AwayOver25Percent);
  }
  if (raw.includes('Home Concession%')) {
    return percentLine('Home @ home conceded', stats.homeConcessionLast6HomePercent);
  }
  if (raw.includes('Away Concession%')) {
    return percentLine('Away @ away conceded', stats.awayConcessionLast6AwayPercent);
  }
  if (raw.includes('Home Avg Goals')) {
    return decimalLine('Home @ home avg goals', stats.homeAvgGoalsLast6Home);
  }
  if (raw.includes('Away Avg Goals')) {
    return decimalLine('Away @ away avg goals', stats.awayAvgGoalsLast6Away);
  }
  if (raw.includes('H2H Home Venue Avg')) {
    return decimalLine('H2H @ venue avg goals', stats.h2hHomeVenueAvgGoals);
  }
  if (raw.includes('H2H All Venues Avg')) {
    return decimalLine('All H2H avg goals', stats.h2hAllVenuesAvgGoals);
  }

  return decorate(displayFormattedSignificantStat(raw));
}

/** Strict O2.5 thresholds (iOS PredictionThresholds.over25Strict). */
const OVER25_STRICT = {
  h2hLast6Over25: 66.79,
  h2hHomeVenueOver25: 67.98,
  bttsHomeVenue: 65.6,
  homeTeamOver25: 63.13,
  awayTeamOver25: 62.81,
  homeConcession: 74.94,
  awayConcession: 79.81,
  homeAvgGoals: 3.23,
  awayAvgGoals: 3.16,
  h2hHomeVenueAvg: 3.33,
  h2hAllVenuesAvg: 3.21,
};

/** iOS `derivedOver25DisplayStats` — when Desktop markers were the only significantStats. */
export function derivedOver25DisplayStats(stats: FixtureStatsSummary): string[] {
  const s = OVER25_STRICT;
  const lines: string[] = [];
  if (stats.h2hLast6Over25Percent >= s.h2hLast6Over25) lines.push('H2H Over 2.5%');
  if (stats.h2hHomeVenueLast6Over25Percent >= s.h2hHomeVenueOver25) lines.push('H2H Home Venue Over 2.5%');
  if (stats.bttsHomeVenueLast6Percent >= s.bttsHomeVenue) lines.push('BTTS Home Venue%');
  if (stats.homeTeamLast6HomeOver25Percent >= s.homeTeamOver25) lines.push('Home Team Over 2.5%');
  if (stats.awayTeamLast6AwayOver25Percent >= s.awayTeamOver25) lines.push('Away Team Over 2.5%');
  if (stats.homeConcessionLast6HomePercent >= s.homeConcession) lines.push('Home Concession%');
  if (stats.awayConcessionLast6AwayPercent >= s.awayConcession) lines.push('Away Concession%');
  if (stats.homeAvgGoalsLast6Home >= s.homeAvgGoals) lines.push('Home Avg Goals');
  if (stats.awayAvgGoalsLast6Away >= s.awayAvgGoals) lines.push('Away Avg Goals');
  if (stats.h2hHomeVenueAvgGoals >= s.h2hHomeVenueAvg) lines.push('H2H Home Venue Avg');
  if (stats.h2hAllVenuesAvgGoals >= s.h2hAllVenuesAvg) lines.push('H2H All Venues Avg');
  return lines;
}

/** iOS `resolvedDisplaySignificantStats` + user-facing formatting. */
export function resolvedDisplayKeySignals(
  prediction: StatStrikePrediction | null | undefined,
  stats: FixtureStatsSummary | null,
): string[] {
  if (!prediction) return [];
  const visible = prediction.significantStats.filter((s) => !isSourceMarkerStatLine(s));
  let rawLines = visible;
  if (rawLines.length === 0 && stats) {
    const tip = prediction.recommendedLevel || prediction.level;
    if (tip.includes('Over 2.5') || tip === 'Over 2.5 Goals') {
      rawLines = derivedOver25DisplayStats(stats);
    }
  }
  return rawLines.map((line) => userFacingSignificantStat(line, stats));
}

function leagueLookupKeys(fixture: StatStrikeFixture): string[] {
  const country = fixture.league.country.trim();
  const name = fixture.league.name.trim();
  const keys = [leaguePerformanceLookupKey(country, name)];
  if (country === 'USA' || country === 'United States') {
    const alt = country === 'USA' ? 'United States' : 'USA';
    const k = leaguePerformanceLookupKey(alt, name);
    if (!keys.includes(k)) keys.push(k);
  }
  return keys;
}

export function trackRecordDisplayForFixture(
  fixture: StatStrikeFixture,
  prediction: StatStrikePrediction | null | undefined,
  leagueTrackRecord: Record<string, StatStrikeLeagueTrackRecord>,
  leagueBandTrackRecord: Record<string, StatStrikeLeagueTrackRecord>,
): StatStrikeTrackRecordDisplay | null {
  const tip = prediction?.recommendedLevel || prediction?.level || '';
  const leagueKeys = leagueLookupKeys(fixture);

  if (tip && tip !== 'No Clear Signal') {
    const bandKey = archiveBandLookupKey(tip);
    for (const leagueKey of leagueKeys) {
      const record = leagueBandTrackRecord[`${leagueKey}|${bandKey}`];
      if (record && record.forecastCount > 0) {
        return {
          trackRecord: record,
          title: `League track record — ${tip}`,
          helperText: null,
        };
      }
    }
  }

  for (const leagueKey of leagueKeys) {
    const record = leagueTrackRecord[leagueKey];
    if (record && record.forecastCount > 0) {
      return {
        trackRecord: record,
        title: 'League track record (league-wide)',
        helperText: 'All bands combined',
      };
    }
  }

  return null;
}
