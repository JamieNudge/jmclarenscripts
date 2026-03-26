/**
 * Shared outer shell for the six Best Picks grid tiles.
 * Caps height on md+ so rows stay compact (like the video / App Store row); scroll inside each tile.
 */
export const bestPicksGridTileClassName =
  'rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 min-h-[160px] md:min-h-0 flex flex-col md:max-h-[min(24rem,50vh)] overflow-hidden';
