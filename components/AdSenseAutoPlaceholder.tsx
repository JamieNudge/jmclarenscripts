/**
 * Dashed regions hinting where Google AdSense Auto ads may inject when enabled (site + account ready).
 * Used on the predictions hub and Blog.
 */
export function AdSenseAutoPlaceholder({
  orientation,
  className = '',
}: {
  orientation: 'vertical' | 'horizontal';
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-white/25 bg-black/20 flex items-center justify-center text-white/35 text-[10px] md:text-xs font-medium uppercase tracking-wider text-center px-2 ${className}`}
      aria-hidden
    >
      {orientation === 'vertical' ? (
        <span
          className="inline-block [writing-mode:vertical-rl] rotate-180 py-4"
          style={{ letterSpacing: '0.2em' }}
        >
          Auto ads area
        </span>
      ) : (
        <span className="px-4 py-3">Auto ads may also appear in-page via Google</span>
      )}
    </div>
  );
}
