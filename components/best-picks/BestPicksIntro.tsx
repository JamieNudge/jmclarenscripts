import Link from 'next/link';

/**
 * Compact hero + one collapsible block so the picks grid stays high on the viewport.
 */
export function BestPicksIntro() {
  return (
    <header className="max-w-4xl mb-5 md:mb-6 space-y-3">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white">
        <span className="block">Today&apos;s Best Picks</span>
        <span className="block mt-2 md:mt-3 text-lg md:text-xl lg:text-2xl font-semibold text-amber-50/90 leading-snug">
          Selected by filtering the work of four different algorithms and what each does best!
        </span>
      </h1>

      <details className="group rounded-xl border border-amber-200/15 bg-black/25 px-3 py-2.5 md:px-4 md:py-3">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-2 text-xs md:text-sm font-semibold text-amber-50/95 hover:text-amber-50 [&::-webkit-details-marker]:hidden">
          <span>About data sources, how it works &amp; stat labels</span>
          <svg
            className="w-4 h-4 text-amber-200/50 shrink-0 transition-transform duration-200 group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-3 pt-3 border-t border-white/10 space-y-4 text-sm text-white/70 leading-relaxed">
          <ul className="space-y-2.5 list-none pl-0 border-l-2 border-amber-400/20 pl-3">
            <li>
              <span className="font-semibold text-amber-100/90">StatStrike</span> — In-app daily selection with
              criteria-style confidence on goal bands (App Store link in the first grid tile).
            </li>
            <li>
              <span className="font-semibold text-amber-100/90">GoalLab</span> — Four independent models on Over /
              Under 2.5; curated picks when models align.
            </li>
            <li>
              <span className="font-semibold text-amber-100/90">This page</span> — A daily updated list of highlighted
              forecasts (when your pipeline syncs), supporting context, and product links—App Store tiles, optional
              video, and ProphIt. How the pick tiles are built from Firebase is summarised in the next paragraphs.
            </li>
          </ul>

          <p>
            Picks are <strong className="font-medium text-white/85">informational</strong> only—not betting tips,
            promises, or financial advice.
          </p>
          <p>
            <strong className="font-medium text-white/85">Over / Under 2.5</strong> tiles combine automated exports
            with any manual rows, then (when available) filter to best-performing leagues in the uploaded archive
            (same idea as the in-app chip: strong historical win rate in that league).
          </p>
          <p>
            <strong className="font-medium text-white/85">Expanded pick stats</strong> (e.g. in-app key stats) use
            whatever match window the forecasting pipeline attached; it can differ by statistic—not always a fixed
            &quot;last six&quot; sample unless the label says so.
          </p>
          <p className="text-xs text-white/50">
            App terms &amp; privacy: App Store listings and{' '}
            <Link href="/privacy" className="text-amber-200/70 underline underline-offset-2 hover:text-amber-100/90">
              site privacy policy
            </Link>
            .
          </p>
        </div>
      </details>
    </header>
  );
}
