/**
 * Visitor-facing metadata for the live StatStrike Android promo on GoalLab.
 */
export const statstrikeAndroidMeta = {
  displayName: 'StatStrike on Android',
  iconSrc: '/images/stat-strike-icon.png',
  applicationId: 'com.jamienudge.statstrike',
  /** Optional badge toggle for prelaunch messaging. */
  showComingSoonBadge: false,
  /** Live Play Store listing. */
  playStoreInstallUrl:
    'https://play.google.com/store/apps/details?id=com.jamienudge.statstrike&pcampaignid=web_share',
  playStoreInstallLabel: 'View StatStrike on Google Play',
} as const;
