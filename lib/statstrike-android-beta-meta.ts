/**
 * Visitor-facing metadata for the StatStrike Android closed-test strip on the GoalLab hub home.
 */
export const statstrikeAndroidBetaMeta = {
  displayName: 'StatStrike on Android',
  iconSrc: '/images/stat-strike-icon.png',
  applicationId: 'com.jamienudge.statstrike',
  /** Set false once Play closed testing is live (badge hidden). */
  showComingSoonBadge: false,
  /** Primary CTA — join closed test on the web (Google Play). */
  playStoreJoinUrl: 'https://play.google.com/apps/testing/com.jamienudge.statstrike',
  playStoreJoinLabel: 'Become a tester on Google Play',
  /** Play Store listing after opt-in (same account on phone). */
  playStoreInstallUrl:
    'https://play.google.com/store/apps/details?id=com.jamienudge.statstrike',
  playStoreInstallLabel: 'Install StatStrike from Google Play',
  /** Secondary — tester group for updates and discussion. */
  googleGroupUrl: 'https://groups.google.com/g/statstriketestgroup',
  googleGroupLabel: 'StatStrike test group',
  /** Email form used when linking this group in Play Console → Closed testing → Testers. */
  googleGroupEmail: 'statstriketestgroup@googlegroups.com',
  /** Ordered steps shown on the hub — group eligibility, then Play opt-in, then install. */
  installSteps: [
    {
      title: 'Join the tester group',
      body: 'Use the same Google account you use on your Android phone.',
      hrefKey: 'googleGroupUrl' as const,
      linkLabel: 'StatStrike test group',
    },
    {
      title: 'Wait 5–15 minutes',
      body: 'Google Play needs a short time to sync your group membership (sometimes up to a few hours).',
    },
    {
      title: 'Become a tester',
      body: 'Open the Play opt-in page and tap Become a tester.',
      hrefKey: 'playStoreJoinUrl' as const,
      linkLabel: 'Become a tester on Google Play',
    },
    {
      title: 'Install from Google Play',
      body: 'After opting in, install from the Play Store or search “StatStrike”.',
      hrefKey: 'playStoreInstallUrl' as const,
      linkLabel: 'Install StatStrike from Google Play',
    },
  ],
  accountNote:
    'Use the same Google account for the group, opt-in page, and Play Store on your phone. Work/school accounts and multiple Google accounts often cause “App not available” errors.',
} as const;

export type StatStrikeAndroidBetaHrefKey = 'googleGroupUrl' | 'playStoreJoinUrl' | 'playStoreInstallUrl';

export function statstrikeAndroidBetaHref(key: StatStrikeAndroidBetaHrefKey): string {
  return statstrikeAndroidBetaMeta[key];
}
