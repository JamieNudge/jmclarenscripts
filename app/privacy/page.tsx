import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Portfolio & app showcase',
  description:
    'Privacy policy for the app portfolio home and related static pages. Today’s Best Picks and the blog have a separate policy.',
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

        <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy — Portfolio &amp; app showcase</h1>
        <p className="text-sm text-white/60 mb-8">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
          <p>
            <span className="font-semibold text-white">Today’s Best Picks</span> and the{' '}
            <span className="font-semibold text-white">blog</span> (feeds, posts, and Google AdSense in those
            areas) are covered in a{' '}
            <Link href="/best-picks/privacy" className="underline hover:text-blue-300">
              separate policy for that publication
            </Link>
            . This page covers the <strong className="font-medium text-white">portfolio home</strong> and other
            app showcase or legal pages you open from it (for example app terms, support, and policies linked
            for individual products), except where a page already states otherwise.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Who we are</h2>
          <p>
            The portfolio home and related information are published by Jamie McLaren. For questions about
            this part of the site, contact:{' '}
            <a
              href="mailto:jmclarenscripts@gmail.com?subject=Website%20privacy%20%28portfolio%29"
              className="underline hover:text-blue-300"
            >
              jmclarenscripts@gmail.com
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. What this part of the site does</h2>
          <p>
            The portfolio home presents app listings, modals, links to store pages, and optional static legal or
            support text. The main portfolio home <strong className="font-medium text-white">does not</strong>{' '}
            load the same Google AdSense script used on Today’s Best Picks and the blog. You do not need
            an account to browse the showcase.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Information collected on this part of the site</h2>
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
            This site is not designed to collect special categories of personal data. Please
            do not send sensitive personal information by email unless necessary.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Today’s Best Picks, blog, and cookies</h2>
          <p>
            If you follow a link to{' '}
            <Link href="/best-picks" className="underline hover:text-blue-300">
              Today’s Best Picks
            </Link>
            ,{' '}
            <Link href="/blog" className="underline hover:text-blue-300">
              the blog
            </Link>
            , or a blog post, Google AdSense and cookie behaviour there are described in the{' '}
            <Link href="/best-picks/privacy" className="underline hover:text-blue-300">
              Best Picks &amp; blog privacy policy
            </Link>
            . You do not need to read both documents if you only use the portfolio home.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Links to third parties</h2>
          <p>
            The site links to external services (app stores, social profiles, video platforms,
            etc.). Those services have their own privacy policies. We are not responsible for their
            practices.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. App-specific privacy policies (portfolio and other products)</h2>
          <p>Examples of per-app pages on this domain (including tools and cross-promoted apps) include:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <Link href="/privacy/icon-resizer" className="underline hover:text-blue-300">
                Icon Resizer — privacy policy
              </Link>
            </li>
            <li>
              <Link href="/privacy/maincode" className="underline hover:text-blue-300">
                MainCode — privacy policy
              </Link>
            </li>
            <li>
              <Link href="/privacy/nudgetronic" className="underline hover:text-blue-300">
                Nudgetronic — privacy policy
              </Link>
            </li>
            <li>
              <span className="text-white/90">
                <Link href="/privacy/aikido-vocabulary" className="underline hover:text-blue-300">
                  Aikido Vocabulary
                </Link>
                ,{' '}
                <Link href="/privacy/desktop-totem" className="underline hover:text-blue-300">
                  Desktop Totem
                </Link>
                , and other titles — see{' '}
              </span>
              <code className="text-white/80">/privacy/…</code> where available from the app&apos;s own card or
              support link.
            </li>
          </ul>
          <p>
            Football products featured on Today’s Best Picks (StatStrike, GoalLab, PopGoals, ProphIt) are listed
            in the{' '}
            <Link href="/best-picks/privacy" className="underline hover:text-blue-300">
              Best Picks &amp; blog
            </Link>{' '}
            policy. Their <code className="text-white/80">/privacy/…</code> pages on this domain still apply
            to the native apps.
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
            rights in connection with this part of the website, contact us at the email above.
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
