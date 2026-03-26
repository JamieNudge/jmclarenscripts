/**
 * Shared outer shell for the six Best Picks grid tiles.
 * On md+, use a fixed height (not only max-height) so flex children get a bounded column and
 * `flex-1 min-h-0 overflow-auto` regions actually scroll instead of growing the row.
 * `min-w-0` avoids grid min-content width/height forcing tiles to match the longest copy.
 */
export const bestPicksGridTileClassName =
  'rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 flex flex-col overflow-hidden min-w-0 min-h-[160px] md:min-h-0 max-h-[min(32rem,90vh)] md:max-h-none md:h-[min(24rem,50vh)]';
