import { statstrikeAndroidMeta } from '@/lib/statstrike-android-beta-meta';

/**
 * Homepage You vs StatStrike promo. Flip `live` after 10.3 is on the App Store.
 */
export const statstrikeCompetitionPromo = {
  live: false,
  iconSrc: statstrikeAndroidMeta.iconSrc,
  title: 'You vs StatStrike',
  rulesHref: '/statstrike/competition',
  rulesLabel: 'Official rules',
  comingSoon: {
    badge: 'Coming soon · iOS',
    body: 'Beat StatStrike’s Over/Under 2.5 tips. Conquer the app over a week and win a free month of Premium. iPhone after App Store review — Android later.',
  },
  liveCopy: {
    badge: 'Live · iOS',
    body: 'Open Beat StatStrike in the app. Beat StatStrike’s Over/Under 2.5 tips. Conquer the app over a week and win a free month of Premium. Android later.',
  },
} as const;
