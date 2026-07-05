import { PredictionIdeaForm } from '@/components/best-picks/PredictionIdeaForm';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';

const scrollArea =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth';

const hr = 'border-0 border-t border-white/15 my-5';

function BestPicksProphitPanelBody({
  headingLevel = 'h2',
  scrollInParent = false,
}: {
  headingLevel?: 'h2' | 'h3';
  /** When true, content flows in a parent scroll region (e.g. combined Coming Soon tile). */
  scrollInParent?: boolean;
}) {
  const TitleTag = headingLevel;
  const bodyScrollClass = scrollInParent ? 'min-w-0' : scrollArea;
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-2 shrink-0 pr-2">
        <TitleTag className="text-lg md:text-xl font-bold text-white tracking-tight min-w-0 flex-1">
          ProphIt — Test Your Own Prediction Ideas in a living app!
        </TitleTag>
        <span
          className="shrink-0 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-100/95 shadow-sm shadow-amber-900/20"
          title="This project is in the research stage"
        >
          Coming Soon!
        </span>
      </div>
      <div className={bodyScrollClass}>
        <div className="space-y-4 text-sm text-white/93 leading-relaxed pb-1">
          <p>Have a theory for predicting goal band outcomes?</p>
          <p>
            This service lets you test your approach using real data, live execution, and transparent tracking
            — so you can see how it actually performs.
          </p>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">How the research service works</h3>
          <ol className="list-decimal list-outside pl-5 space-y-4 marker:text-white/93">
            <li>
              <span className="font-semibold text-white/92">You define your idea</span>
              <span className="block text-white/94 mt-1 pl-0">
                Describe your logic — from simple rules to more detailed concepts.
              </span>
            </li>
            <li>
              <span className="font-semibold text-white/92">I build your model</span>
              <span className="block text-white/94 mt-1 pl-0">
                Your idea is translated into a working forecasting algorithm.
              </span>
            </li>
            <li>
              <span className="font-semibold text-white/92">We run it live</span>
              <span className="block text-white/94 mt-1 pl-0">
                Your model is executed against real matches over a fixed research period.
              </span>
            </li>
            <li>
              <span className="font-semibold text-white/92">You track the results</span>
              <span className="block text-white/94 mt-1 pl-0">
                You get access to a dedicated app/dashboard showing:
              </span>
              <ul className="list-disc list-outside pl-5 mt-2 space-y-1 text-white/92">
                <li>Predictions</li>
                <li>Results (W/L)</li>
                <li>Performance over time</li>
              </ul>
            </li>
          </ol>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">What you get</h3>
          <ul className="list-disc list-outside pl-5 space-y-2 text-white/93">
            <li>A working version of your idea as a live model</li>
            <li>A private dashboard to track performance</li>
            <li>Real-world validation (not just backtested theory)</li>
            <li>Clear insight into whether your idea has an edge</li>
          </ul>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">After the research period</h3>
          <p className="text-white/93">When the initial research period ends, you can:</p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-white/93">
            <li>Extend testing for an additional fee, or</li>
            <li>
              Have your algorithm deployed in a dedicated app for your personal use, for a one-off fixed cost
            </li>
          </ul>
          <p>
            For ongoing use, you will need a low-cost API subscription for match data. You can connect your own
            API key, and the system will run your model automatically.
          </p>
          <p>If preferred, managed data access can be provided for a small monthly fee.</p>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">Important</h3>
          <ul className="list-disc list-outside pl-5 space-y-2 text-white/93">
            <li>
              This is a <strong className="font-semibold text-white/95">research and testing service</strong>, not
              financial advice
            </li>
            <li>No outcomes or profitability are guaranteed</li>
            <li>Most ideas do not perform well — that is the purpose of testing</li>
            <li>Your model is treated as confidential</li>
            <li>Similar outcomes to existing models may occur independently</li>
          </ul>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">Pricing</h3>
          <p>Flat fee depending on complexity and duration.</p>
          <p>No ongoing commitment required.</p>

          <hr className={hr} />

          <details className="group rounded-xl border border-white/18 bg-zinc-950/80 overflow-hidden -mx-1">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-3 py-3 text-sm font-semibold text-white hover:bg-white/[0.07] [&::-webkit-details-marker]:hidden">
              <span>Submit your idea</span>
              <span className="flex items-center gap-2 text-xs font-medium text-sky-200/93 shrink-0">
                <span className="max-sm:hidden">Click to expand</span>
                <span className="sm:hidden">Tap to expand</span>
                <svg
                  className="w-4 h-4 text-white/94 transition-transform duration-200 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="px-3 pb-3 pt-2 border-t border-white/10">
              <PredictionIdeaForm collapsibleTrigger />
            </div>
          </details>
        </div>
      </div>
    </>
  );
}

/**
 * @param embedded When true, omits the outer tile shell so this can sit inside a combined grid cell
 * (e.g. with PopGoals above it). Parent must be a flex column with `min-h-0` + `flex-1` for the scroll region.
 */
export function BestPicksNewProductPanel({
  embedded = false,
  scrollInParent = false,
}: {
  embedded?: boolean;
  scrollInParent?: boolean;
}) {
  if (embedded) {
    return (
      <div className={scrollInParent ? 'min-w-0' : 'flex min-h-0 min-w-0 flex-1 flex-col'}>
        <BestPicksProphitPanelBody headingLevel="h3" scrollInParent={scrollInParent} />
      </div>
    );
  }
  return (
    <div className={`${bestPicksGridTileClassName} min-h-0`}>
      <BestPicksProphitPanelBody headingLevel="h2" />
    </div>
  );
}
