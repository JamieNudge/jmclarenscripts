/** Board-facing types aligned with iOS DailySelection / Fixture / Prediction. */

export type StatStrikePredictionLevel =
  | 'No Clear Signal'
  | 'Over 2.5 Goals'
  | 'Over 3.5 Goals'
  | 'Over 4.5 Goals'
  | 'Over 5.5+ Goals'
  | 'Under 2.5 Goals'
  | string;

export type StatStrikeTeam = {
  id: number;
  name: string;
  logo?: string | null;
};

export type StatStrikeLeague = {
  id: number;
  name: string;
  country: string;
  logo?: string | null;
};

export type StatStrikeFixture = {
  id: number;
  date: string; // ISO
  kickoffMs: number;
  homeTeam: StatStrikeTeam;
  awayTeam: StatStrikeTeam;
  league: StatStrikeLeague;
  venue?: string | null;
  status?: string | null;
  elapsed?: number | null;
  homeScore?: number | null;
  awayScore?: number | null;
};

export type StatStrikePrediction = {
  level: StatStrikePredictionLevel;
  recommendedLevel?: StatStrikePredictionLevel | null;
  matchedCriteria: number;
  totalCriteria: number;
  significantStats: string[];
  bookmakerOdds?: number | null;
  sourceLabel?: string | null;
};

export type StatStrikeBoardRow = {
  fixture: StatStrikeFixture;
  prediction: StatStrikePrediction | null;
  /** From selections.leaguePerformance ("Country - League" >= 70). */
  bestPerformingLeague: boolean;
  /** Carried from yesterday UK selection (live only). */
  fromYesterday: boolean;
  selectionDateKey: string;
};

export type StatStrikeDailySelection = {
  date: string;
  fixtures: StatStrikeFixture[];
  predictionsByFixtureId: Map<number, StatStrikePrediction>;
  leaguePerformance: Record<string, number>;
};
