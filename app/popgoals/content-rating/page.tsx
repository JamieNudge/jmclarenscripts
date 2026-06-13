import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PopGoals — Age & Content Rating',
  description:
    'Age suitability and content rating information for PopGoals, a football app with bubble-lake targets and live hot-zone guidance.',
};

export default function PopGoalsContentRatingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a0d2e] to-[#581c87] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white rounded-full bg-white/10 px-4 py-2 border border-white/20 hover:bg-white/15 transition-colors"
          >
            <span className="text-lg leading-none">&larr;</span>
            <span>Back to portfolio</span>
          </a>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          PopGoals — Age &amp; Content Rating
        </h1>
        <p className="text-sm text-white/60 mb-8">
          This page explains the type of content in PopGoals so you can decide whether it is
          appropriate for you.
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <h2 className="text-xl font-semibold mt-4">Age Requirement</h2>
          <p>
            PopGoals is intended for users who are{' '}
            <span className="font-semibold">18 years of age or older</span>. The app presents
            football match data, live hot-zone targets, and settled win/loss tracking in a context
            related to betting markets, which is typically restricted to adults.
          </p>

          <h2 className="text-xl font-semibold mt-4">Gambling &amp; betting context</h2>
          <p>PopGoals includes:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Fixture lists, kick-off times, and match metadata</li>
            <li>Bubble-lake stages such as qualified, watching, trigger, wins, and losses</li>
            <li>Hot-zone target minute windows and settled goal-time summaries</li>
            <li>Explanatory copy about alerts, target windows, and responsible use</li>
          </ul>
          <p className="mt-4">
            <span className="font-semibold">Important:</span> The app does not place bets or
            process wagers. You are responsible for complying with local laws on gambling and
            betting.
          </p>

          <h2 className="text-xl font-semibold mt-4">Advertising</h2>
          <p>
            PopGoals may show Google AdMob banner ads unless you purchase ad removal. Ads may be
            personalised; you can limit this in iOS Settings.
          </p>

          <h2 className="text-xl font-semibold mt-4">Other content</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>No violence, gore, or graphic imagery</li>
            <li>No sexual content or nudity</li>
            <li>No user-generated public feeds or in-app chat</li>
            <li>Optional motion-rich UI (can be paused in-app)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-4">App Store rating</h2>
          <p>
            PopGoals should be treated as <span className="font-semibold">18+</span> because of
            betting-market context and responsible-gambling expectations, consistent with similar
            apps from this developer.
          </p>

          <h2 className="text-xl font-semibold mt-4">Responsible use</h2>
          <p>
            Use PopGoals for information and entertainment. Predictions and bands are not guarantees.
            If you gamble, do so responsibly — e.g.{' '}
            <a
              href="https://www.begambleaware.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-violet-300"
            >
              BeGambleAware.org
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold mt-4">Questions</h2>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a href="mailto:jmclarenscripts@gmail.com" className="underline hover:text-violet-300">
              jmclarenscripts@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
