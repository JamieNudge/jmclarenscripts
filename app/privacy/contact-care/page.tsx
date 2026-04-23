import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Care — Privacy Policy',
  description:
    'Privacy policy for Contact Care: local contacts and reminders, RevenueCat, Google AdMob, diagnostics, and how to contact the developer.',
};

const link = 'text-amber-200/90 underline hover:text-amber-100 underline-offset-2';

export default function ContactCarePrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to portfolio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-2">Privacy Policy for Contact Care</h1>
        <p className="text-sm text-white/60 mb-8">Last updated: April 2026</p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            At Contact Care, we take your privacy seriously. This Privacy Policy explains how we handle your data, what
            information is collected by third-party services, and how we protect your information.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Information Collected and Used</h2>

          <h3 className="text-lg font-medium text-white/95 mt-4">Local Data (Stored on Device Only)</h3>
          <p>The primary purpose of Contact Care is to help you stay connected with your contacts.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold text-white/95">Contacts:</span> Our app requests permission to access your
              device&apos;s contacts. This data is used only to allow you to select people to care for. This information
              is stored in a local database on your device and is never transmitted to our servers or shared with any
              third parties.
            </li>
            <li>
              <span className="font-semibold text-white/95">Notes and Reminders:</span> Any notes you jot down or
              reminder schedules you create are stored locally on your device.
            </li>
          </ul>

          <h3 className="text-lg font-medium text-white/95 mt-6">Data Collected by Third-Party Services</h3>
          <p>
            To provide certain features (like premium subscriptions and advertisements), we use third-party SDKs that
            collect data.
          </p>

          <p>
            <span className="font-semibold text-white/95">A. Financial Information (RevenueCat)</span>
            <br />
            We use RevenueCat to manage in-app purchases and subscriptions.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold text-white/95">Data Collected:</span> Purchase history (e.g. transaction
              IDs, subscription status).
            </li>
            <li>
              <span className="font-semibold text-white/95">Purpose:</span> App functionality and account management (to
              ensure you have access to the features you&apos;ve purchased).
            </li>
            <li>
              <span className="font-semibold text-white/95">Privacy link:</span>{' '}
              <a
                href="https://www.revenuecat.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                RevenueCat Privacy Policy
              </a>
            </li>
          </ul>

          <p className="pt-2">
            <span className="font-semibold text-white/95">B. Device Identifiers (Google AdMob)</span>
            <br />
            We use Google AdMob to serve advertisements.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold text-white/95">Data Collected:</span> Device identifiers such as the
              Android Advertising ID (AAID).
            </li>
            <li>
              <span className="font-semibold text-white/95">Data Sharing:</span> This identifier is shared with Google
              and its advertising partners to serve personalized ads and measure ad performance.
            </li>
            <li>
              <span className="font-semibold text-white/95">Purpose:</span> Advertising, marketing, and analytics.
            </li>
            <li>
              <span className="font-semibold text-white/95">Privacy link:</span>{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                Google Privacy &amp; Terms
              </a>
            </li>
          </ul>

          <p className="pt-2">
            <span className="font-semibold text-white/95">C. App Performance &amp; Diagnostics</span>
            <br />
            We collect anonymous diagnostic information to keep the app stable.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold text-white/95">Data Collected:</span> Crash logs and app performance
              diagnostics.
            </li>
            <li>
              <span className="font-semibold text-white/95">Purpose:</span> Analytics and bug fixing.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. Data Security and Retention</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold text-white/95">Encryption:</span> All data transmitted off the device by
              our third-party partners (RevenueCat and AdMob) is encrypted in transit using modern HTTPS protocols.
            </li>
            <li>
              <span className="font-semibold text-white/95">No User Accounts:</span> Contact Care does not require you to
              create an account or provide an email address. Therefore, we do not store any personal identity data on
              our servers.
            </li>
            <li>
              <span className="font-semibold text-white/95">Data Retention:</span> Since we do not use accounts, we do
              not have a mechanism to store your data once the app is uninstalled. All local data is permanently deleted
              when you uninstall the app from your device.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Your Choices and Rights</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold text-white/95">Permissions:</span> You can grant or revoke access to your
              contacts or notifications at any time through your device&apos;s system settings.
            </li>
            <li>
              <span className="font-semibold text-white/95">Ad tracking:</span> You can opt out of personalized
              advertising or reset your Advertising ID by going to your Android Settings &gt; Google &gt; Ads.
            </li>
            <li>
              <span className="font-semibold text-white/95">In-app purchases:</span> You can manage or cancel
              subscriptions through the Google Play Store.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. Children&apos;s Privacy</h2>
          <p>
            Our app does not target children under the age of 13. We do not knowingly collect personal information from
            children.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Contact Us</h2>
          <p>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:{' '}
            <a href="mailto:jmclarenscripts@gmail.com" className={link}>
              jmclarenscripts@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
