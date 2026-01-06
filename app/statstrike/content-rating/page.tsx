import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StatStrike — Age & Content Rating',
  description:
    'Age suitability and content rating information for StatStrike, a football prediction and betting advice app.',
};

export default function StatStrikeContentRatingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Back to portfolio */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white rounded-full bg-white/10 px-4 py-2 border border-white/20 hover:bg-white/15 transition-colors"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back to portfolio</span>
          </a>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          StatStrike — Age &amp; Content Rating
        </h1>
        <p className="text-sm text-white/60 mb-8">
          This page explains the type of content included in StatStrike so you can decide
          whether it is appropriate for you.
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <h2 className="text-xl font-semibold mt-4">Age Requirement</h2>
          <p>
            StatStrike is intended for users who are <span className="font-semibold">18 years of age or older</span>.
            The app provides betting advice and statistical analysis related to football matches,
            which may involve gambling activities that are restricted to adults in most jurisdictions.
          </p>

          <h2 className="text-xl font-semibold mt-4">Gambling &amp; Betting Content</h2>
          <p>
            StatStrike provides statistical analysis and predictions for football matches to inform
            betting decisions. The app includes:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Statistical analysis of football fixtures and team performance</li>
            <li>Goal prediction forecasts (e.g., Over/Under 2.5 goals)</li>
            <li>Confidence scoring and prediction recommendations</li>
            <li>Historical performance tracking and match statistics</li>
          </ul>
          <p className="mt-4">
            <span className="font-semibold">Important:</span> StatStrike provides informational
            predictions and analysis only. It does not facilitate actual betting or gambling
            transactions. Users are responsible for ensuring they comply with local laws regarding
            gambling and betting in their jurisdiction.
          </p>

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
            <li>No in-app purchases or advertising</li>
          </ul>
          <p className="mt-4">
            The app displays football match statistics, team data, and prediction results in a
            text-based, statistical format. No graphic or violent content is included.
          </p>

          <h2 className="text-xl font-semibold mt-4">App Store Rating</h2>
          <p>
            StatStrike is rated <span className="font-semibold">18+</span> on the App Store due
            to its gambling-related content and betting advice nature.
          </p>

          <h2 className="text-xl font-semibold mt-4">Responsible Use</h2>
          <p>
            StatStrike is designed to provide statistical insights and predictions for
            informational purposes. Users should:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Only use the app if they are 18 years or older</li>
            <li>Understand that predictions are not guarantees</li>
            <li>Gamble responsibly and within their means</li>
            <li>Comply with all local laws regarding gambling and betting</li>
            <li>Seek help if they have concerns about gambling addiction</li>
          </ul>

          <h2 className="text-xl font-semibold mt-4">Summary</h2>
          <p>
            StatStrike is a <span className="font-semibold">statistical analysis and prediction
            tool</span> for football matches, intended for adults who are interested in
            data-driven betting insights. The app contains no violent, sexual, or graphic content,
            but does provide betting-related advice that is restricted to users 18 years and older.
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
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

