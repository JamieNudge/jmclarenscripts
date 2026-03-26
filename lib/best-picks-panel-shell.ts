/**
 * Shared outer shell for the six Best Picks grid tiles (2×3 on md+).
 *
 * Fixed height on md+ so every panel matches the sketch: equal boxes, scroll inside.
 * (Grid track sizing uses min-content unless min-h is pinned; h + min-h + max-h + min-w-0 prevents blowout.)
 */
export const bestPicksGridTileClassName =
  'box-border rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 flex flex-col overflow-hidden min-w-0 ' +
  'min-h-[160px] max-h-[min(32rem,90vh)] ' +
  'md:h-[26rem] md:min-h-[26rem] md:max-h-[26rem] md:shrink-0';
