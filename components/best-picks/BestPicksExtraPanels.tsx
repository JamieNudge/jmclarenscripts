/**
 * Copy for the extra grid panels on Today’s Best Picks — edit here as content evolves.
 */
export const bestPicksNewProductTitle = 'New project';

export const bestPicksNewProductBody =
  'A new product is in early development. This panel will grow as the idea firms up — check back later for more.';

export const bestPicksMethodologyPlaceholderTitle = 'How tips are chosen';

export const bestPicksMethodologyPlaceholderBody =
  'Placeholder: examples of how picks are selected and evaluated will likely live here.';

const panelShell =
  'rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 min-h-[160px] flex flex-col justify-start';

export function BestPicksNewProductPanel() {
  return (
    <div className={panelShell}>
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2">{bestPicksNewProductTitle}</h2>
      <p className="text-sm text-white/65 leading-relaxed">{bestPicksNewProductBody}</p>
    </div>
  );
}

export function BestPicksMethodologyPlaceholderPanel() {
  return (
    <div className={panelShell}>
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
        {bestPicksMethodologyPlaceholderTitle}
      </h2>
      <p className="text-sm text-white/65 leading-relaxed mb-4">{bestPicksMethodologyPlaceholderBody}</p>
      <div
        className="flex-1 min-h-[120px] rounded-xl border border-dashed border-white/20 bg-black/15 flex items-center justify-center text-center px-4 py-6"
        aria-hidden
      >
        <span className="text-xs font-medium uppercase tracking-wider text-white/30">
          Content TBD
        </span>
      </div>
    </div>
  );
}
