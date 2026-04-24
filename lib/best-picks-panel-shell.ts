/**
 * Shared outer shell for the Best Picks grid tiles (md+: three columns — left stack, centre how-apps, right combined).
 *
 * Row heights come from the parent grid (`grid-template-rows` on mobile and md+).
 * Tiles always `h-full min-h-0` so inner `flex-1 overflow-y-auto` regions scroll.
 */
/** Elevated zinc shell on black page background (stronger border than translucent white on slate). */
export const bestPicksGridTileClassName =
  'box-border rounded-2xl border border-zinc-600/55 bg-zinc-950/95 shadow-lg shadow-black/50 ring-1 ring-white/[0.06] p-6 md:p-8 flex flex-col overflow-hidden min-w-0 min-h-0 h-full max-h-full';
