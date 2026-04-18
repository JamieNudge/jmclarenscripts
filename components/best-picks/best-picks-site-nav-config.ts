/**
 * Extended header/footer navigation for Today’s Best Picks (publisher transparency / AdSense scaffolding).
 *
 * Rollback without git: set `NEXT_PUBLIC_BEST_PICKS_EXTENDED_SITE_NAV=0` in `.env.local` and rebuild.
 * Instant UI rollback in dev: flip {@link BEST_PICKS_EXTENDED_SITE_NAV} to `false` below.
 */
export const BEST_PICKS_EXTENDED_SITE_NAV =
  process.env.NEXT_PUBLIC_BEST_PICKS_EXTENDED_SITE_NAV !== '0';
