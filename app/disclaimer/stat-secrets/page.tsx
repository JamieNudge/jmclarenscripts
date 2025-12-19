export default function StatSecretsDisclaimer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back to Portfolio Button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Portfolio
        </a>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Stat Secrets Disclaimer</h1>
          <p className="text-slate-400">Last Updated: December 19, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Purpose</h2>
            <p>
              Stat Secrets is a statistical analysis tool that provides football match 
              predictions based on historical data. It is designed for informational 
              and entertainment purposes only.
            </p>
          </section>

          <section className="bg-red-900/30 border border-red-500/50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-red-400 mb-4">⚠️ Important Warning</h2>
            <p className="mb-4 text-white">
              <strong>Stat Secrets does not encourage, promote, or facilitate gambling.</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Predictions are statistical estimates, not guarantees</li>
              <li>Past performance does not predict future results</li>
              <li>You should never risk money you cannot afford to lose</li>
              <li>If you choose to gamble, please do so responsibly</li>
              <li>Seek help if gambling becomes a problem</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">No Guarantee of Accuracy</h2>
            <p className="mb-4">
              While our algorithm analyzes multiple statistical factors, football matches 
              are inherently unpredictable. Predictions may be wrong.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Predictions are based on historical data that may not reflect current conditions</li>
              <li>Team news, injuries, weather, and other factors are not accounted for</li>
              <li>Match outcomes can be affected by random events</li>
              <li>Our track record is for transparency, not as a promise of future success</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Intended Use</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Research and informational purposes</li>
              <li>Entertainment value in following football matches</li>
              <li>Understanding statistical trends in football</li>
              <li>Enhancing enjoyment of watching live games</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">No Financial Advice</h2>
            <p>
              Nothing in Stat Secrets constitutes financial advice. We do not recommend, 
              encourage, or advise any form of gambling, betting, or wagering. Any decisions 
              you make based on our predictions are entirely your own responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Data</h2>
            <p className="mb-4">
              Stat Secrets uses football data from third-party providers.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We do not guarantee the accuracy of third-party data</li>
              <li>Live scores may be delayed or inaccurate</li>
              <li>Fixture information is subject to change</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
            <p>
              Stat Secrets and its developer shall not be held liable for any losses, damages, 
              or negative consequences arising from the use of this app. This includes but is 
              not limited to financial losses, emotional distress, or any decisions made based 
              on predictions provided by the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Age Restriction</h2>
            <p>
              Stat Secrets is intended for users aged 17 and over. By using this app, you 
              confirm that you are at least 17 years old.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Responsible Gambling Resources</h2>
            <p className="mb-4">
              If you or someone you know has a gambling problem, help is available:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>UK:</strong> GambleAware — <a href="https://www.begambleaware.org" className="text-blue-400 hover:text-blue-300">begambleaware.org</a></li>
              <li><strong>US:</strong> National Council on Problem Gambling — <a href="https://www.ncpgambling.org" className="text-blue-400 hover:text-blue-300">ncpgambling.org</a></li>
              <li><strong>International:</strong> Gamblers Anonymous — <a href="https://www.gamblersanonymous.org" className="text-blue-400 hover:text-blue-300">gamblersanonymous.org</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Acceptance</h2>
            <p>
              By using Stat Secrets, you acknowledge that you have read, understood, and 
              agree to this disclaimer. If you do not agree with any part of this disclaimer, 
              please do not use the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <p>
              If you have questions about this disclaimer, please contact us at{' '}
              <a href="mailto:jmclarenscripts@gmail.com" className="text-blue-400 hover:text-blue-300">
                jmclarenscripts@gmail.com
              </a>
            </p>
          </section>
        </div>

        {/* Back to Top Button */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}

