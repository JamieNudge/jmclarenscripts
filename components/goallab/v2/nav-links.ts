import {
  GOAL_LAB_V2_ABOUT_PATH,
  GOAL_LAB_V2_BLOG_PATH,
  GOAL_LAB_V2_FIXTURES_PATH,
  GOAL_LAB_V2_HOME_PATH,
  GOAL_LAB_V2_METHODOLOGY_PATH,
  GOAL_LAB_V2_RESEARCH_PATH,
} from '@/components/goallab/v2/paths';
import { AND_ANOTHER_THING_PATH } from '@/lib/football-predictions-brand';

export { GOAL_LAB_V2_HOME_PATH };

export const goalLabV2NavPrimary = [
  { href: GOAL_LAB_V2_HOME_PATH, label: 'Home' },
  { href: GOAL_LAB_V2_FIXTURES_PATH, label: 'Forecasts' },
  { href: GOAL_LAB_V2_RESEARCH_PATH, label: 'Research' },
  { href: GOAL_LAB_V2_METHODOLOGY_PATH, label: 'Models' },
  { href: GOAL_LAB_V2_BLOG_PATH, label: 'Insights' },
  { href: `${GOAL_LAB_V2_ABOUT_PATH}#apps-status`, label: 'Apps' },
  { href: GOAL_LAB_V2_ABOUT_PATH, label: 'About' },
] as const;

export const goalLabV2NavSecondary = [
  { href: AND_ANOTHER_THING_PATH, label: 'And Another Thing…' },
  { href: '/football-predictions/contact', label: 'Contact' },
  { href: '/football-predictions/privacy', label: 'Privacy' },
  { href: `${GOAL_LAB_V2_ABOUT_PATH}#apps-status`, label: 'Apps' },
  { href: `${GOAL_LAB_V2_ABOUT_PATH}#other-apps`, label: 'Other apps' },
] as const;
