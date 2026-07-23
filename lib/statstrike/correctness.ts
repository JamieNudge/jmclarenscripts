import type { StatStrikeFixture, StatStrikePrediction, StatStrikePredictionLevel } from '@/lib/statstrike/models';
import { BTTS_NO, BTTS_YES } from '@/lib/statstrike/btts-selections';

/** Statuses that count as a final result for WIN / FT badges (matches iOS isFinishedForCardDisplay). */
export const RESULT_FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN']);

export function isResultFinishedStatus(status: string | null | undefined): boolean {
  return RESULT_FINISHED_STATUSES.has(status ?? '');
}

/**
 * Same band rules as iOS `finalCorrectness` / `predictionResult`
 * (uses recommended level when present). BTTS needs home/away individually.
 */
export function isWinningForecast(
  band: StatStrikePredictionLevel | null | undefined,
  homeScore: number,
  awayScore: number,
): boolean | null {
  if (!band || band === 'No Clear Signal') return null;
  const totalGoals = homeScore + awayScore;
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
    case BTTS_YES:
      return homeScore > 0 && awayScore > 0;
    case BTTS_NO:
      return !(homeScore > 0 && awayScore > 0);
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
  return isWinningForecast(band, fixture.homeScore, fixture.awayScore);
}

/** Settle the optional second BTTS tip independently of the O/U forecast. */
export function bttsPredictionResultForFixture(
  fixture: StatStrikeFixture,
  bttsPrediction: StatStrikePrediction | null | undefined,
): boolean | null {
  return predictionResultForFixture(fixture, bttsPrediction ?? null);
}
