import {
  FOOTBALL_PREDICTIONS_FIXTURES_PATH,
  FOOTBALL_PREDICTIONS_HUB_PATH,
  FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH,
} from '@/lib/football-predictions-brand';

/** Canonical GoalLab hub paths (post-cutover). */
export const GOAL_LAB_V2_HOME_PATH = FOOTBALL_PREDICTIONS_HUB_PATH;
export const GOAL_LAB_V2_FIXTURES_PATH = FOOTBALL_PREDICTIONS_FIXTURES_PATH;
export const GOAL_LAB_V2_RESEARCH_PATH = FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH;
export const GOAL_LAB_V2_METHODOLOGY_PATH = '/football-predictions/methodology' as const;
export const GOAL_LAB_V2_ABOUT_PATH = '/football-predictions/about' as const;
export const GOAL_LAB_V2_BLOG_PATH = '/blog' as const;

export function fixtureDetailHrefV2(fixtureId: number | string, dateKey: string): string {
  return `${GOAL_LAB_V2_FIXTURES_PATH}/${encodeURIComponent(String(fixtureId))}?date=${encodeURIComponent(dateKey)}`;
}

export function fixturesListHrefV2(dateKey?: string, todayKey?: string): string {
  if (dateKey && todayKey && dateKey !== todayKey) {
    return `${GOAL_LAB_V2_FIXTURES_PATH}?date=${encodeURIComponent(dateKey)}`;
  }
  return GOAL_LAB_V2_FIXTURES_PATH;
}
