/**
 * Visitor-facing metadata for the live StatStrike store promo on GoalLab.
 */
export const statstrikeAndroidMeta = {
  displayName: 'StatStrike — now on Android and the App Store',
  iconSrc: '/images/stat-strike-icon.png',
  applicationId: 'com.jamienudge.statstrike',
  /** Optional badge toggle for prelaunch messaging. */
  showComingSoonBadge: false,
  /** Live Play Store listing. */
  playStoreInstallUrl:
    'https://play.google.com/store/apps/details?id=com.jamienudge.statstrike&pcampaignid=web_share',
  playStoreInstallLabel: 'View StatStrike on Google Play',
  appStoreUrl: 'https://apps.apple.com/gb/app/statstrike/id6757434374',
  appStoreInstallLabel: 'View StatStrike on the App Store',
} as const;
