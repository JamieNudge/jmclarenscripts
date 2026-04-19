/**
 * Basic app metadata for the Best Picks “coming soon” strip (PopGoals / PoPBeT iOS).
 * Source: `PoPBeT.xcodeproj` — display name, target name, MARKETING_VERSION. Icon: `public/images/popgoals-icon.png`.
 * Update when the app nears release.
 */
export const bestPicksPopgoalsComingSoonMeta = {
  displayName: 'PopGoals',
  xcodeTarget: 'PoPBeT',
  /** Public asset (see `apps-data` PopGoals entry). */
  iconSrc: '/images/popgoals-icon.png',
  marketingVersion: '1.0',
} as const;
