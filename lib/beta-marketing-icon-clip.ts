import type { CSSProperties } from 'react';
import type { App } from '@/types/app';

/**
 * Optional crop for marketing PNGs that bake a “BETA” chip into the bottom-right. The site already
 * shows a BETA status pill, so clipping avoids double-badging. Opt-in only — normal square icons
 * should omit this flag so thumbnails fill the frame.
 */
export function betaMarketingIconClipStyle(
  app: Pick<App, 'status' | 'iconHasEmbeddedBetaBadge'>
): CSSProperties | undefined {
  if (app.status !== 'beta') return undefined;
  if (app.iconHasEmbeddedBetaBadge !== true) return undefined;
  return { clipPath: 'inset(0 11% 12% 0)' };
}
