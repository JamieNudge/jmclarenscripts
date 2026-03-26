import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';

/**
 * Copy for the extra grid panels on Today’s Best Picks — methodology panel still editable here.
 */
export const bestPicksMethodologyPlaceholderTitle = 'How tips are chosen';

export const bestPicksMethodologyPlaceholderBody =
  'Placeholder: examples of how picks are selected and evaluated will likely live here.';

const scrollArea =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth';

const hr = 'border-0 border-t border-white/15 my-5';

export function BestPicksNewProductPanel() {
  return (
    <div className={bestPicksGridTileClassName}>
      <h2 className="text-lg md:text-xl font-bold text-white tracking-tight pr-2 mb-2 shrink-0">
        Test Your Prediction Idea — For Real
      </h2>
      <div className={scrollArea}>
        <div className="space-y-4 text-sm text-white/75 leading-relaxed pb-1">
          <p>Have a theory for predicting match outcomes?</p>
          <p>Most ideas sound good in your head. Very few hold up over time.</p>
          <p>
            I offer a simple way to test your approach in a live environment — using real data,
            tracked results, and a dedicated interface.
          </p>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">How it works</h3>
          <ol className="list-decimal list-outside pl-5 space-y-4 marker:text-white/45">
            <li>
              <span className="font-semibold text-white/90">You define your idea</span>
              <span className="block text-white/70 mt-1 pl-0">
                Tell me your logic. This can be as simple or detailed as you like.
              </span>
            </li>
            <li>
              <span className="font-semibold text-white/90">I implement your model</span>
              <span className="block text-white/70 mt-1 pl-0">
                I translate your idea into a working forecasting algorithm.
              </span>
            </li>
            <li>
              <span className="font-semibold text-white/90">We run it live</span>
              <span className="block text-white/70 mt-1 pl-0">
                Your model is executed against real matches over a fixed period.
              </span>
            </li>
            <li>
              <span className="font-semibold text-white/90">You track the results</span>
              <span className="block text-white/70 mt-1 pl-0">
                You get access to a dedicated app/dashboard showing:
              </span>
              <ul className="list-disc list-outside pl-5 mt-2 space-y-1 text-white/70">
                <li>Predictions</li>
                <li>Results (W/L)</li>
                <li>Performance over time</li>
              </ul>
            </li>
          </ol>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">What you get</h3>
          <ul className="list-disc list-outside pl-5 space-y-2 text-white/75">
            <li>A working version of your idea as a live model</li>
            <li>A private dashboard to track performance</li>
            <li>Real-world validation (not backtested theory)</li>
            <li>Clear insight into whether your idea has an edge</li>
          </ul>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">Important</h3>
          <ul className="list-disc list-outside pl-5 space-y-2 text-white/75">
            <li>
              This is a <strong className="font-semibold text-white/90">testing and research service</strong>, not
              financial advice
            </li>
            <li>Most ideas do not perform well — that’s the point of testing</li>
            <li>Your model is treated as confidential</li>
            <li>Similar outcomes to existing models may occur naturally</li>
          </ul>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">Pricing</h3>
          <p>Flat fee depending on complexity and duration.</p>
          <p>No ongoing commitment.</p>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">Ready to test your idea?</h3>
          <p className="text-white/80">
            Submit your concept below and I&apos;ll let you know if it&apos;s suitable for implementation.
          </p>
          <p className="text-sm text-white/55 pt-2">
            Until a form is available here, email{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Prediction%20model%20idea"
              className="text-sky-300 hover:text-sky-200 underline underline-offset-2 font-medium"
            >
              jmclarenscripts@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export function BestPicksMethodologyPlaceholderPanel() {
  return (
    <div className={`${bestPicksGridTileClassName} justify-start`}>
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2 shrink-0">
        {bestPicksMethodologyPlaceholderTitle}
      </h2>
      <p className="text-sm text-white/65 leading-relaxed mb-4 shrink-0">{bestPicksMethodologyPlaceholderBody}</p>
      <div
        className="flex-1 min-h-0 rounded-xl border border-dashed border-white/20 bg-black/15 flex items-center justify-center text-center px-4 py-6"
        aria-hidden
      >
        <span className="text-xs font-medium uppercase tracking-wider text-white/30">
          Content TBD
        </span>
      </div>
    </div>
  );
}
