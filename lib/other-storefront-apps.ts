import type { App } from '@/types/app';

/**
 * GoalLab About only lists apps we are ready to point traffic at.
 * Earlier store listings stay on the portfolio until their copy/screenshots are updated.
 */
const GOAL_LAB_OTHER_APP_IDS = new Set([
  'maincode',
  'contact-care',
  'icon-resizer-apple-apps',
]);

/** Non-forecasting apps opted into the GoalLab About list, with a public store URL. */
export function otherStorefrontApps(apps: App[]): App[] {
  return apps.filter((app) => {
    if (!GOAL_LAB_OTHER_APP_IDS.has(app.id)) return false;
    return Boolean(app.appStoreUrl || app.googlePlayUrl);
  });
}
