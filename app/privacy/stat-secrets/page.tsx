export default function StatSecretsPrivacy() {
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
          <h1 className="text-4xl font-bold mb-4">Stat Secrets Privacy Policy</h1>
          <p className="text-slate-400">Last Updated: December 19, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
            <p>
              Stat Secrets is designed with your privacy in mind. We collect minimal data 
              and never sell or share your personal information with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Data Collection</h2>
            <p className="mb-4">
              Stat Secrets collects the following data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Prediction history:</strong> Stored locally on your device to track your record</li>
              <li><strong>Tracked fixtures:</strong> Stored locally to enable live score updates</li>
              <li><strong>App preferences:</strong> Your settings are stored locally on device</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Services</h2>
            <p className="mb-4">
              Stat Secrets uses the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Football API:</strong> We fetch fixture data and live scores from a third-party 
              football data provider. Only fixture IDs are sent — no personal data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">What We Don&apos;t Do</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>No user accounts or login required</li>
              <li>No analytics or user tracking</li>
              <li>No advertisements</li>
              <li>No personal data sent to our servers</li>
              <li>No location tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Local Storage</h2>
            <p>
              All your prediction history, tracked matches, and preferences are stored 
              locally on your device. This data is not synced to the cloud and is not 
              accessible to us. Deleting the app will remove all locally stored data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Notifications</h2>
            <p>
              If you enable notifications, Stat Secrets will send local notifications 
              for goal alerts. These are generated on-device and do not involve any 
              external push notification services that could track you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Children&apos;s Privacy</h2>
            <p>
              Stat Secrets is not intended for children under 17. We do not knowingly 
              collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be 
              posted on this page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
            <p>
              If you have questions about this privacy policy, please contact us at{' '}
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

