export default function RecipeSaviourDisclaimer() {
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
          <h1 className="text-4xl font-bold mb-4">Recipe Saviour Disclaimer</h1>
          <p className="text-slate-400">Last Updated: November 30, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Purpose</h2>
            <p>
              Recipe Saviour is a personal recipe management tool that helps you save and 
              organize recipes from websites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Content Ownership</h2>
            <p className="mb-4">
              All recipes remain the property of their original creators and publishers. 
              Recipe Saviour does not claim ownership of any extracted content.
            </p>
            <p>
              Users are responsible for respecting copyright and terms of service of source websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Intended Use</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>This app is for personal, non-commercial use only</li>
              <li>Recipes should be saved for your own cooking and meal planning</li>
              <li>We encourage visiting and supporting the original recipe creators</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">No Warranty</h2>
            <p className="mb-4">
              Recipe Saviour is provided &quot;as is&quot; without warranties of any kind, 
              either express or implied.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We are not responsible for the accuracy, safety, or quality of recipes</li>
              <li>Always use your judgment when following cooking instructions</li>
              <li>Check for food allergies and dietary restrictions</li>
              <li>Verify cooking times and temperatures for food safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Websites</h2>
            <p className="mb-4">
              Recipe Saviour accesses publicly available web content from recipe websites.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We do not control or endorse third-party websites</li>
              <li>Original websites may have their own terms of service and privacy policies</li>
              <li>Users should review and comply with source website policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
            <p>
              In no event shall Recipe Saviour be liable for any damages arising from the 
              use of this app, including but not limited to direct, indirect, incidental, 
              or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Your Responsibility</h2>
            <p>
              By using Recipe Saviour, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Use the app responsibly and legally</li>
              <li>Respect the intellectual property rights of recipe creators</li>
              <li>Not use extracted content for commercial purposes</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <p>
              If you have questions about this disclaimer, please contact us through 
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

