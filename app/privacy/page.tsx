import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Website',
  description:
    'Privacy policy for Jamie McLaren’s portfolio website, including Today’s Best Picks, the blog, cookies, and Google AdSense.',
};

export default function WebsitePrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to portfolio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy — Website</h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            This policy describes how information is handled when you visit Jamie McLaren&apos;s
            public portfolio website (including pages such as the home page and &quot;Today&apos;s
            Best Picks&quot;). It is separate from the privacy policies that apply to individual
            mobile or desktop apps listed on the site; those apps have their own policies linked
            from the portfolio.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Who we are</h2>
          <p>
            This website is operated by Jamie McLaren as a showcase of apps and related
            information. For privacy questions about this site, contact:{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Website%20privacy"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. What this website does</h2>
          <p>
            The site presents app information, links (for example to the App Store or Google
            Play), and optional content such as daily best picks and embedded video. You do not need
            an account to browse this website.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Information collected on this site</h2>
          <p>
            <span className="font-semibold">Information you provide:</span> If you email the
            address above, we receive whatever you choose to send (typically your email address and
            message content).
          </p>
          <p>
            <span className="font-semibold">Technical and hosting data:</span> Like most websites,
            hosting infrastructure (for example Vercel) may process technical data such as IP
            address, browser type, and request logs for security and reliability. That processing is
            governed by the hosting provider&apos;s policies.
          </p>
          <p>
            This public site is not designed to collect special categories of personal data. Please
            do not send sensitive personal information by email unless necessary.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Cookies and Google AdSense</h2>
          <p>
            <span className="font-semibold">Today&apos;s Best Picks</span> and the{' '}
            <span className="font-semibold">Blog</span> sections: we may use{' '}
            <span className="font-semibold">Google AdSense</span> to show advertisements there when
            enabled for this site. The rest of this website (for example the portfolio home page) does
            not load the AdSense script. Google and its partners may use cookies or similar
            technologies when you visit those sections, to serve ads based on your prior visits to
            this or other websites, and to measure ad effectiveness.
          </p>
          <p>
            You can learn how Google uses data when you use our site or partners&apos; sites in
            Google&apos;s documentation:{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              How Google uses information from sites or apps that use our services
            </a>
            . You can manage ad personalization through{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              Google Ads Settings
            </a>{' '}
            and learn more about cookies at{' '}
            <a
              href="https://policies.google.com/technologies/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300"
            >
              Google&apos;s Privacy &amp; Terms
            </a>
            .
          </p>
          <p>
            Where required, we rely on appropriate legal bases for processing (such as consent for
            non-essential cookies, where applicable). You can adjust cookie choices through your
            browser settings and, where offered, any consent tool we add to the site.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Links to third parties</h2>
          <p>
            The site links to external services (app stores, social profiles, video platforms,
            etc.). Those services have their own privacy policies. We are not responsible for their
            practices.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. App-specific privacy policies</h2>
          <p>
            Each listed app may collect and use data according to its own policy. Examples on this
            site include:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <Link href="/privacy/statstrike" className="underline hover:text-blue-300">
                StatStrike — privacy policy
              </Link>
            </li>
            <li>
              <Link href="/privacy/goallab" className="underline hover:text-blue-300">
                GoalLab — privacy policy
              </Link>
            </li>
            <li>
              <Link href="/privacy/popgoals" className="underline hover:text-blue-300">
                PopGoals — privacy policy
              </Link>
            </li>
          </ul>
          <p>
            Other apps linked from the portfolio have policies under{' '}
            <code className="text-white/80">/privacy/…</code> where available.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Children&apos;s privacy</h2>
          <p>
            This website is not directed at children. We do not knowingly collect personal
            information from children through the site. If you believe a child has provided personal
            data, please contact us using the email above.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Retention</h2>
          <p>
            Email correspondence is kept only as long as needed to respond and for ordinary
            business records. Hosting logs are retained according to the hosting provider&apos;s
            schedule.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">9. Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct, delete, or restrict
            processing of personal data, or to object to certain processing. To exercise these
            rights in connection with this website, contact us at the email above.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">10. Changes</h2>
          <p>
            We may update this policy from time to time. The &quot;Last updated&quot; date will
            change when we do. Continued use of the site after changes means you accept the updated
            policy.
          </p>

          <p className="text-xs text-white/50 pt-8 border-t border-white/10">
            This policy is provided for transparency. It does not constitute legal advice. For
            regulated or high-risk uses, consider obtaining professional legal review.
          </p>
        </section>
      </div>
    </main>
  );
}
