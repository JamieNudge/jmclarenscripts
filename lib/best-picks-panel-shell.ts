/**
 * Shared outer shell for the Best Picks grid tiles (md+: three columns — left stack, centre how-apps, right combined).
 *
 * Row heights come from the parent grid (`grid-template-rows` on mobile and md+).
 * Tiles always `h-full min-h-0` so inner `flex-1 overflow-y-auto` regions scroll.
 */
/** Elevated panel shell on hub page background. */
export const bestPicksGridTileClassName =
  'box-border rounded-2xl border border-[var(--hub-border-zinc)] bg-[var(--hub-panel)] shadow-lg shadow-[var(--hub-shadow)] ring-1 ring-[var(--hub-ring)] p-6 md:p-8 flex flex-col overflow-hidden min-w-0 min-h-0 h-full max-h-full';
