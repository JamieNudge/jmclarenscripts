import type { StatStrikeFixture, StatStrikePrediction, StatStrikePredictionLevel } from '@/lib/statstrike/models';

/** Statuses that count as a final result for WIN / FT badges (matches iOS isFinishedForCardDisplay). */
export const RESULT_FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);

export function isResultFinishedStatus(status: string | null | undefined): boolean {
  return RESULT_FINISHED_STATUSES.has(status ?? '');
}

/**
 * Same band rules as iOS `finalCorrectness` / `predictionResult`
 * (uses recommended level when present).
 */
export function isWinningForecast(
  band: StatStrikePredictionLevel | null | undefined,
  totalGoals: number,
): boolean | null {
  if (!band || band === 'No Clear Signal') return null;
  switch (band) {
    case 'Over 2.5 Goals':
      return totalGoals > 2;
    case 'Over 3.5 Goals':
      return totalGoals > 3;
    case 'Over 4.5 Goals':
      return totalGoals > 4;
    case 'Over 5.5+ Goals':
      return totalGoals > 5;
    case 'Under 2.5 Goals':
      return totalGoals <= 2;
    default:
      return null;
  }
}

export function predictionResultForFixture(
  fixture: StatStrikeFixture,
  prediction: StatStrikePrediction | null,
): boolean | null {
  if (!isResultFinishedStatus(fixture.status)) return null;
  if (fixture.homeScore == null || fixture.awayScore == null || !prediction) return null;
  const band = prediction.recommendedLevel || prediction.level;
  return isWinningForecast(band, fixture.homeScore + fixture.awayScore);
}
