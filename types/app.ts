export interface App {
  id: string;
  name: string;
  tagline: string;
  description: string;
  color: string; // Hex color for the app's theme
  icon: string; // Path to app icon
  screenshots: string[]; // Paths to phone mockup images
  features: string[];
  appStoreUrl?: string;
  /** Bluesky profile URL, e.g. https://bsky.app/profile/handle.bsky.social */
  blueskyUrl?: string;
  /** Short handle for UI, e.g. @statstrikeapp */
  blueskyLabel?: string;
  websiteUrl?: string;
  supportUrl?: string;
  privacyUrl?: string;
  termsUrl?: string;
  disclaimerUrl?: string;
  contentRatingUrl?: string;
  accessibilityUrl?: string;
  platform: 'iOS' | 'macOS' | 'Web' | 'Cross-platform';
  status: 'live' | 'beta' | 'coming-soon' | 'in-review';
  /** When set, show a second badge for Android/Google Play (e.g. app is Live on iOS but in review on Google Play). */
  googlePlayStatus?: 'live' | 'beta' | 'coming-soon' | 'in-review';
}

