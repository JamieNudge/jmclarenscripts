/**
 * Shared outer shell for the six Best Picks grid tiles (2×3 on md+).
 *
 * - **md+:** Parent grid sets row tracks; tiles use `h-full` + `min-h-0`.
 * - **Mobile:** Same scroll-in-tile behaviour needs a **definite height** (`h` + `max-h`),
 *   not only `max-h` on an `auto`-height flex column — otherwise the tile grows with content
 *   and the page becomes one long scroll. `svh` tracks mobile browser chrome better than `vh`.
 */
export const bestPicksGridTileClassName =
  'box-border rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 flex flex-col overflow-hidden min-w-0 min-h-0 ' +
  'h-[min(26rem,58svh)] max-h-[min(26rem,58svh)] shrink-0 ' +
  'md:h-full md:max-h-none';
