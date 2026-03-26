import { PredictionIdeaForm } from '@/components/best-picks/PredictionIdeaForm';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';

const scrollArea =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth';

const hr = 'border-0 border-t border-white/15 my-5';

export function BestPicksNewProductPanel() {
  return (
    <div className={bestPicksGridTileClassName}>
      <h2 className="text-lg md:text-xl font-bold text-white tracking-tight pr-2 mb-2 shrink-0">
        Test Your Prediction Idea — In a Live Environment
      </h2>
      <div className={scrollArea}>
        <div className="space-y-4 text-sm text-white/75 leading-relaxed pb-1">
          <p>Have a theory for predicting match outcomes?</p>
          <p>
            This service lets you test your approach using real data, live execution, and transparent tracking
            — so you can see how it actually performs.
          </p>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">How it works</h3>
          <ol className="list-decimal list-outside pl-5 space-y-4 marker:text-white/45">
            <li>
              <span className="font-semibold text-white/90">You define your idea</span>
              <span className="block text-white/70 mt-1 pl-0">
                Describe your logic — from simple rules to more detailed concepts.
              </span>
            </li>
            <li>
              <span className="font-semibold text-white/90">I build your model</span>
              <span className="block text-white/70 mt-1 pl-0">
                Your idea is translated into a working forecasting algorithm.
              </span>
            </li>
            <li>
              <span className="font-semibold text-white/90">We run it live</span>
              <span className="block text-white/70 mt-1 pl-0">
                Your model is executed against real matches over a fixed research period.
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
            <li>Real-world validation (not just backtested theory)</li>
            <li>Clear insight into whether your idea has an edge</li>
          </ul>

          <hr className={hr} />

          <h3 className="text-base font-semibold text-white/95">After the research period</h3>
          <p className="text-white/75">When the initial research period ends, you can:</p>
          <ul className="list-disc list-outside pl-5 space-y-2 text-white/75">
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
          <ul className="list-disc list-outside pl-5 space-y-2 text-white/75">
            <li>
              This is a <strong className="font-semibold text-white/90">research and testing service</strong>, not
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

          <PredictionIdeaForm />
        </div>
      </div>
    </div>
  );
}
