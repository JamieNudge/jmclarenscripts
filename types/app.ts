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
  websiteUrl?: string;
  supportUrl?: string;
  privacyUrl?: string;
  disclaimerUrl?: string;
  contentRatingUrl?: string;
  accessibilityUrl?: string;
  platform: 'iOS' | 'macOS' | 'Web' | 'Cross-platform';
  status: 'live' | 'beta' | 'coming-soon';
}

