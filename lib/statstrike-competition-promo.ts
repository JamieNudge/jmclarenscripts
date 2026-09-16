import { statstrikeAndroidMeta } from '@/lib/statstrike-android-beta-meta';

/**
 * Homepage You vs StatStrike promo. `live` is true while the iOS contest is on the App Store.
 */
export const statstrikeCompetitionPromo = {
  live: true,
  iconSrc: statstrikeAndroidMeta.iconSrc,
  title: 'You vs StatStrike App Competition!',
  rulesHref: '/statstrike/competition',
  rulesLabel: 'Official rules',
  comingSoon: {
    badge: 'Coming soon · iOS',
    body: 'Beat StatStrike’s Over/Under 2.5 tips. Conquer the app over a week and win a free month of Premium. iPhone after App Store review — Android later.',
  },
  liveCopy: {
    badge: 'Live · iOS · Coming soon Android',
    body: 'Open Beat StatStrike in the iPhone app. Beat Over/Under 2.5 tips over a week for a free month of Premium. Coming soon on StatStrike for Android.',
  },
} as const;
