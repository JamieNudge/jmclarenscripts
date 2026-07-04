/**
 * Visitor-facing metadata for the StatStrike Android closed-test strip on the GoalLab hub home.
 */
export const statstrikeAndroidBetaMeta = {
  displayName: 'StatStrike',
  iconSrc: '/images/stat-strike-icon.png',
  /** Primary CTA — join closed test on the web (Google Play). */
  playStoreJoinUrl: 'https://play.google.com/apps/testing/com.jamienudge.statstrike',
  playStoreJoinLabel: 'Join the Android closed test',
  /** Secondary — tester group for updates and discussion. */
  googleGroupUrl: 'https://groups.google.com/g/statstriketestgroup',
  googleGroupLabel: 'StatStrike test group',
} as const;
