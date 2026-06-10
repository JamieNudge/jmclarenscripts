import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GoalLab — Age & Content Rating',
  description:
    'Age suitability and content rating information for GoalLab, a football prediction app for Over and Under 2.5 Goals markets.',
};

export default function GoalLabContentRatingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0c1929] to-[#164e63] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white rounded-full bg-white/10 px-4 py-2 border border-white/20 hover:bg-white/15 transition-colors"
          >
            <span className="text-lg leading-none">&larr;</span>
            <span>Back to GoalLab</span>
          </a>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          GoalLab — Age &amp; Content Rating
        </h1>
        <p className="text-sm text-white/60 mb-8">
          This page explains the type of content included in GoalLab so you can decide
          whether it is appropriate for you.
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <h2 className="text-xl font-semibold mt-4">Age Requirement</h2>
          <p>
            GoalLab is intended for users who are <span className="font-semibold">18 years of age or older</span>.
            The app provides betting advice and statistical analysis related to football matches,
            which may involve gambling activities that are restricted to adults in most jurisdictions.
          </p>

          <h2 className="text-xl font-semibold mt-4">Gambling &amp; Betting Content</h2>
          <p>
            GoalLab provides statistical analysis and predictions for Over and Under 2.5 Goals
            betting markets using an 11-criteria algorithm with forecaster confidence. The app
            includes:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>11-criteria forecasting for Over and Under 2.5 goal bands</li>
            <li>Forecaster confidence and historical win-rate context</li>
            <li>Transparent track record and full track history</li>
            <li>Curated Best Picks when strict quality thresholds are met</li>
            <li>Historical performance tracking and match statistics</li>
          </ul>
          <p className="mt-4">
            <span className="font-semibold">Important:</span> GoalLab provides informational
            predictions and analysis only. It does not facilitate actual betting or gambling
            transactions. Users are responsible for ensuring they comply with local laws regarding
            gambling and betting in their jurisdiction.
          </p>

          <h2 className="text-xl font-semibold mt-4">Advertising</h2>
          <p>
            GoalLab displays advertisements through Google AdMob while the user is in the
            ad-supported state, including during any eligible introductory subscription trial.
            Advertisements may include:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Banner advertisements within the app interface</li>
            <li>Ads may be personalised based on your interests (can be disabled in device settings)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-4">Content Warnings</h2>
          <p>
            The app contains content related to sports betting and gambling, which may not be
            suitable for:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Individuals under 18 years of age</li>
            <li>Individuals with gambling addiction or related concerns</li>
            <li>Users in jurisdictions where gambling is illegal</li>
          </ul>

          <h2 className="text-xl font-semibold mt-4">Other Content</h2>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>No violence, gore, or graphic imagery</li>
            <li>No sexual content or nudity</li>
            <li>No drugs, alcohol, or tobacco promotion</li>
            <li>No user-generated public content or online chat</li>
            <li>Contains advertising while in the ad-supported state</li>
          </ul>
          <p className="mt-4">
            The app displays football match statistics, team data, confidence bands, and prediction
            results in a text-based, statistical format. No graphic or violent content is included.
          </p>

          <h2 className="text-xl font-semibold mt-4">App Store Rating</h2>
          <p>
            GoalLab is rated <span className="font-semibold">18+</span> on the App Store due
            to its gambling-related content and betting advice nature.
          </p>

          <h2 className="text-xl font-semibold mt-4">Responsible Use</h2>
          <p>
            GoalLab is designed to provide statistical insights and predictions for
            informational purposes. Users should:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Only use the app if they are 18 years or older</li>
            <li>Understand that predictions are not guarantees</li>
            <li>Gamble responsibly and within their means</li>
            <li>Comply with all local laws regarding gambling and betting</li>
            <li>Seek help if they have concerns about gambling addiction</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4">Gambling Support</h3>
          <p>
            Please gamble responsibly. If you feel your gambling is becoming a problem, support
            and advice are available at:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <a
                href="https://www.begambleaware.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-cyan-300"
              >
                BeGambleAware — begambleaware.org
              </a>
            </li>
            <li>
              <a
                href="tel:08088020133"
                className="underline hover:text-cyan-300"
              >
                National Gambling Helpline — 0808 8020 133
              </a>
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-4">Legal Disclaimer</h2>
          <p>
            This application provides statistical football data and predictive analysis for Over
            and Under 2.5 Goals markets using an 11-criteria algorithm. The content is supplied for
            information and entertainment purposes only and does not constitute betting advice,
            financial advice, or a recommendation to place wagers.
          </p>
          <p>
            No guarantee is made, express or implied, as to the accuracy, performance, or outcome of
            any predictions or statistics presented within the app. Football results are inherently
            uncertain and past performance is not a reliable indicator of future outcomes.
          </p>
          <p>
            Any decisions made in relation to betting, wagering, or financial expenditure are made
            entirely at the user&apos;s own discretion and risk. By using this application, you
            acknowledge that the developer and publisher accept no responsibility or liability for
            any financial loss, damages, or consequences arising from reliance on the content
            provided.
          </p>
          <p>
            This application does not facilitate or encourage gambling. Users must ensure they
            comply with all applicable laws and regulations in their jurisdiction.
          </p>

          <h2 className="text-xl font-semibold mt-4">Summary</h2>
          <p>
            GoalLab is a <span className="font-semibold">football prediction lab</span> for Over
            and Under 2.5 Goals markets (11-criteria algorithm, forecaster confidence, transparent
            track record), intended for adults who are interested in data-driven betting insights.
            The app contains no violent, sexual, or graphic content, but does provide
            betting-related advice that is restricted to users 18 years and older.
          </p>

          <h2 className="text-xl font-semibold mt-4">Questions</h2>
          <p>
            If you have any questions about the age suitability or content of the app, you can
            contact the developer:
          </p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com"
              className="underline hover:text-cyan-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
