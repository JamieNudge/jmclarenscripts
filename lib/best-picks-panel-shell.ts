/**
 * Shared outer shell for the six Best Picks grid tiles (2×3 on md+).
 *
 * Row heights come from the parent grid (`grid-template-rows` on mobile and md+).
 * Tiles always `h-full min-h-0` so inner `flex-1 overflow-y-auto` regions scroll.
 */
/** Restrained gold-tinted shell (rollback: revert to border-white/15 bg-white/5). */
export const bestPicksGridTileClassName =
  'box-border rounded-2xl border border-amber-200/14 bg-white/[0.035] shadow-sm shadow-black/15 p-6 md:p-8 flex flex-col overflow-hidden min-w-0 min-h-0 h-full max-h-full';
