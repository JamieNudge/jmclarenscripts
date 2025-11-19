import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aikido Vocabulary App — Privacy Policy',
  description:
    'Privacy policy for the Aikido Vocabulary App, a Japanese vocabulary trainer for Aikido students.',
};

export default function AikidoVocabularyPrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Aikido Vocabulary App — Privacy Policy
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            The Aikido Vocabulary App is a focused learning tool to help Aikido students
            learn and review key Japanese terms used in the dojo. This privacy policy
            explains what data the app does — and does not — collect, and how that data is
            used.
          </p>

          <h2 className="text-xl font-semibold mt-6">1. Data We Collect</h2>
          <p>
            The Aikido Vocabulary App is designed to work primarily on your device. It
            does <span className="font-semibold">not</span> require an account and does{' '}
            <span className="font-semibold">not</span> collect personal information such
            as your name, email address or contact details.
          </p>
          <p>On your device, the app may store:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Your progress or completion state for vocabulary items.</li>
            <li>
              Basic app settings and preferences (for example, which vocab list you were
              last viewing).
            </li>
          </ul>
          <p>
            This information is stored locally on your device using Apple-provided
            storage mechanisms such as <span className="font-mono">UserDefaults</span> or
            a small local database. It is used only to make the app function as expected
            (for example, remembering what you were last studying).
          </p>

          <h2 className="text-xl font-semibold mt-6">2. Online Services &amp; Analytics</h2>
          <p>
            At this stage, the Aikido Vocabulary App does{' '}
            <span className="font-semibold">not</span> integrate third‑party analytics
            SDKs (such as Google Analytics or Firebase Analytics) and does{' '}
            <span className="font-semibold">not</span> send your usage data to external
            servers controlled by the developer.
          </p>

          <h2 className="text-xl font-semibold mt-6">3. Embedded Media (Future Versions)</h2>
          <p>
            Future versions of the app may include optional embedded tutorial or
            demonstration videos to help explain techniques or terminology. These videos
            may be hosted by third‑party providers (for example, Vimeo or YouTube).
          </p>
          <p>
            If and when this is added, those providers may collect limited usage data
            under their own privacy policies (for example, video play counts or generic
            analytics). The Aikido Vocabulary App itself will not add any extra tracking
            on top of what those providers already collect. Links to the relevant
            third‑party privacy policies will be provided where appropriate.
          </p>

          <h2 className="text-xl font-semibold mt-6">4. Data Storage &amp; Backups</h2>
          <p>
            All learning progress and settings are stored on your device. Depending on
            your iOS settings, this data may be included in your encrypted device backup
            (for example, via iCloud Backup or an encrypted iTunes/Finder backup). Those
            backups are managed by Apple under their own terms and privacy policy.
          </p>

          <h2 className="text-xl font-semibold mt-6">5. Children&apos;s Privacy</h2>
          <p>
            The Aikido Vocabulary App is suitable for older children and adults who are
            practising Aikido. It does not contain in‑app purchases, advertising or social
            features. Parents or guardians should supervise use of the app by younger
            children, as with any learning tool.
          </p>

          <h2 className="text-xl font-semibold mt-6">6. Your Choices &amp; Rights</h2>
          <p>
            Because the app does not create an account or store your data on a developer‑
            controlled server, you remain in control of your data on your device:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              You can delete the app at any time to remove its local data from your
              device.
            </li>
            <li>
              You can manage device backups through your iOS or iCloud settings if you
              wish to include or exclude app data.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">7. Contact</h2>
          <p>
            If you have any questions about this privacy policy or how the Aikido
            Vocabulary App handles data, please contact:
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


