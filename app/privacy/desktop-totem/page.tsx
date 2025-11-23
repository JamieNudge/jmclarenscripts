import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Desktop Totem — Privacy Policy',
  description:
    'Privacy policy for Desktop Totem, a macOS productivity app that tracks app usage locally on your Mac to build a “totem” of your most-used applications.',
};

export default function DesktopTotemPrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px 4 py-12 md:py-16">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to portfolio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Desktop Totem — Privacy Policy
        </h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            Desktop Totem is a small macOS productivity app that helps you get back to the apps you use
            most often by building a live, ranked “totem” of your recent activity. This page explains what
            data the app processes, how it is stored, and how it is used.
          </p>

          <h2 className="text-xl font-semibold mt-6">1. Data We Collect and Process</h2>
          <p>
            Desktop Totem is designed to work entirely on your Mac. It does{' '}
            <span className="font-semibold">not</span> require an account, and it does{' '}
            <span className="font-semibold">not</span> send your personal information to any external
            servers controlled by the developer.
          </p>
          <p>On your device, Desktop Totem may store or process the following information:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              A list of recently used applications and documents, based on the apps you bring to the front
              or open, including their names and file paths.
            </li>
            <li>
              Simple usage counts and timestamps (for example, how many times a given app has been opened,
              or when it was last accessed) so that frequently used apps can be shown higher in the totem.
            </li>
            <li>
              Optional short notes you choose to attach to an app (for example, “finish report” or
              “email Alex”), stored locally so you can remember what you were working on.
            </li>
            <li>
              Basic preferences such as whether the desktop totem window is pinned “always on top” and
              whether you have dismissed the onboarding screen.
            </li>
          </ul>
          <p>
            This information is stored locally on your Mac using Apple-provided mechanisms such as{' '}
            <span className="font-mono">UserDefaults</span>. It is used only to provide the core features
            of Desktop Totem — ranking and displaying your own apps and notes so you can get back to them
            quickly.
          </p>

          <h2 className="text-xl font-semibold mt 6">2. No Accounts, Analytics or Ads</h2>
          <p>
            Desktop Totem does not use in-app analytics SDKs (such as Google Analytics or Firebase), does
            not track you across other apps or websites, and does not include third-party advertising. The
            app does not collect your name, email address, payment details or any other personal profile
            information.
          </p>

          <h2 className="text-xl font-semibold mt-6">3. Network and Cloud Services</h2>
          <p>
            Desktop Totem is intended to run entirely on your Mac. It does not upload your usage data,
            notes or app list to any remote server controlled by the developer.
          </p>
          <p>
            Your macOS system and installed apps may communicate with Apple or other services in the
            normal course of operation (for example, App Store updates or background iCloud sync), but
            Desktop Totem does not add any additional tracking or analytics to those services.
          </p>

          <h2 className="text-xl font-semibold mt-6">4. Data Storage &amp; Retention</h2>
          <p>
            All data used by Desktop Totem is stored locally on your Mac. This typically includes small
            configuration and state files (such as usage counts and notes) in your user Library folder.
          </p>
          <p>
            If you uninstall Desktop Totem, macOS will remove the application bundle. Locally stored
            settings and usage data may remain in your user Library folder; if you wish to remove them as
            well, you can delete the app&apos;s preferences using standard macOS tools or by removing the
            relevant <span className="font-mono">Me.Desktop-Totem</span> preferences and support files.
          </p>

          <h2 className="text-xl font-semibold mt-6">5. Children&apos;s Privacy</h2>
          <p>
            Desktop Totem is a general-purpose productivity tool aimed at adults and older teenagers who
            use macOS. It does not contain in-app purchases, advertising or social features, and it does
            not knowingly collect personal information from children. If you are a parent or guardian and
            believe a child has used the app in a way that raises privacy concerns, please contact the
            developer.
          </p>

          <h2 className="text-xl font-semibold mt-6">6. Your Choices</h2>
          <p>You remain in control of your data on your Mac. You can:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Uninstall Desktop Totem at any time, which removes the application from your Mac.</li>
            <li>
              Clear the app&apos;s local state (usage counts, notes and preferences) by resetting the app
              or manually deleting its preferences from your user Library.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6">7. Contact</h2>
          <p>
            If you have any questions about this privacy policy or how Desktop Totem handles data, please
            get in touch:
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


