import type { App } from '@/types/app';

const FOOTBALL_APP_IDS = new Set(['goallab', 'stat-strike', 'popgoals', 'research-lab']);

/** Non-forecasting apps that already have a public App Store or Google Play listing. */
export function otherStorefrontApps(apps: App[]): App[] {
  return apps.filter((app) => {
    if (FOOTBALL_APP_IDS.has(app.id)) return false;
    return Boolean(app.appStoreUrl || app.googlePlayUrl);
  });
}
