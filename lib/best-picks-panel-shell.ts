/**
 * Shared outer shell for the six Best Picks grid tiles (2×3 on md+).
 *
 * Row heights are fixed on the parent grid (`grid-template-rows`); tiles use
 * `min-h-0` + `h-full` so inner flex scroll areas work and content cannot
 * inflate the grid track (grid item `min-height:auto` would otherwise follow content).
 */
export const bestPicksGridTileClassName =
  'box-border rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 flex flex-col overflow-hidden min-w-0 ' +
  'min-h-[160px] max-h-[min(32rem,90vh)] ' +
  'md:min-h-0 md:h-full md:max-h-none';
