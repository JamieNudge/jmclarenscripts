export default function RecipeSaviourPrivacy() {
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
          <h1 className="text-4xl font-bold mb-4">Recipe Saviour Privacy Policy</h1>
          <p className="text-slate-400">Last Updated: November 30, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Data Collection</h2>
            <p>
              Recipe Saviour does not collect, store, or share any personal information. 
              All recipes you save are stored locally on your device only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">What We Don&apos;t Do</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>No user accounts or login required</li>
              <li>No analytics or tracking</li>
              <li>No advertisements</li>
              <li>No data sent to external servers</li>
              <li>No cookies or tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Recipe Extraction</h2>
            <p>
              When you provide a website URL, Recipe Saviour fetches the webpage content 
              to extract recipe information. This happens directly between your device and 
              the recipe website. We do not store or access these URLs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Local Storage</h2>
            <p>
              All saved recipes, meal plans, and shopping lists are stored locally on your 
              device using iOS&apos;s standard storage. This data never leaves your device and 
              is not accessible to us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Websites</h2>
            <p>
              When you visit recipe websites through Recipe Saviour, those websites may 
              have their own privacy policies and data collection practices. We recommend 
              reviewing their policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Children&apos;s Privacy</h2>
            <p>
              Recipe Saviour does not knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of 
              any changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <p>
              If you have questions about this privacy policy, please contact us through 
              the portfolio website.
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

