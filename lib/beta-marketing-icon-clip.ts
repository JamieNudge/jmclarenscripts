import type { CSSProperties } from 'react';
import type { App } from '@/types/app';

/**
 * Crops the typical bottom-right “BETA” chip on marketing app icons so thumbnails stay clean.
 * Status stays visible as the pill next to the app name in the vertical list.
 * Replace icons with badge-free assets when you have them; this is a safe fallback.
 */
export function betaMarketingIconClipStyle(
  app: Pick<App, 'status' | 'iconHasEmbeddedBetaBadge'>
): CSSProperties | undefined {
  if (app.status !== 'beta') return undefined;
  if (app.iconHasEmbeddedBetaBadge === false) return undefined;
  return { clipPath: 'inset(0 11% 12% 0)' };
}
