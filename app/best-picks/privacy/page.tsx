import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';

export const metadata: Metadata = {
  title: 'Privacy — Today’s Best Picks & blog',
  description:
    'Privacy policy for the Today’s Best Picks hub, related pages, and the blog: cookies, Google AdSense, and how to get in touch.',
};

export default function BestPicksPrivacyPage() {
  return (
    <BestPicksSubpageShell
      alwaysShowHeaderNav
      showBackToHub={false}
      title="Privacy policy"
      description="This policy covers Today’s Best Picks (all pages under /best-picks), the blog (index and posts under /blog), and how data is used there. It does not describe the separate app showcase home page."
    >
      <section className="space-y-6 text-sm md:text-base leading-relaxed text-white/90">
        <p>
          This site section is operated by Jamie McLaren as the publisher of Today’s Best Picks and the
          blog. It is separate from the <Link href="/privacy" className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90">main portfolio and app showcase privacy policy</Link> (for
          the home page and other non–Best Picks pages) and from privacy policies for individual
          iPhone or iPad apps, which are linked below.
        </p>
        <p>
          For privacy questions about <strong className="font-medium text-white">this publication only</strong>, contact:{' '}
          <a
            href="mailto:jmclarenscripts@gmail.com?subject=Today%27s%20Best%20Picks%20%2F%20blog%20privacy"
            className="text-amber-200/80 underline hover:text-amber-100/90"
          >
            jmclarenscripts@gmail.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">1. What these pages are</h2>
        <p>
          <strong className="font-medium text-white">Today’s Best Picks</strong> (for example the hub, How apps work,
          Methodology, About, and Contact) and the <strong className="font-medium text-white">blog</strong> present
          editorial and informational content, links to the App Store or social profiles, optional embedded
          video, and may show daily or research-style pick summaries when configured. You do not need
          an account to read this material.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">2. Information collected in this section</h2>
        <p>
          <span className="font-semibold text-white/95">What you send:</span> If you use an email
          address given on a Best Picks or contact page, we receive what you include (for example
          your address and the message). Use the <Link href="/best-picks/contact" className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90">contact</Link> page
          for publication-related questions.
        </p>
        <p>
          <span className="font-semibold text-white/95">Technical and hosting data:</span> Hosting
          (for example Vercel) may process IP address, browser type, and request logs for security
          and reliability, under the host’s policies.
        </p>
        <p>
          These areas are not designed to collect special categories of data. Do not share unnecessary
          sensitive information by email.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">3. Cookies and Google AdSense</h2>
        <p>
          On <span className="font-semibold text-white">Today’s Best Picks</span> and the <span className="font-semibold text-white">blog</span> we
          may use <span className="font-semibold text-white">Google AdSense</span> when that is
          enabled for the site. Google and partners may use cookies or similar technologies to serve
          and measure ads, including based on your visits to this or other sites.
        </p>
        <p>
          You can read how Google uses data from sites that use its services:{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-200/80 underline hover:text-amber-100/90"
          >
            How Google uses information from sites or apps that use our services
          </a>
          . Manage ad personalization:{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-200/80 underline hover:text-amber-100/90"
          >
            Google Ads Settings
          </a>
          . More on cookies:{' '}
          <a
            href="https://policies.google.com/technologies/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-200/80 underline hover:text-amber-100/90"
          >
            Google Privacy &amp; Terms
          </a>
          . Where the law requires consent, you can also use your browser and any on-site consent
          tools.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">4. Links to third parties</h2>
        <p>
          We link to app stores, video hosts, and social or bluesky pages. Those services have
          their own terms and privacy rules; we are not responsible for their practices.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">5. App-specific privacy policies (football apps in this section)</h2>
        <p>These native apps are discussed on Today’s Best Picks. Each has its own policy on this site:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>
            <Link href="/privacy/statstrike" className="text-amber-200/80 underline hover:text-amber-100/90">
              StatStrike — privacy policy
            </Link>
          </li>
          <li>
            <Link href="/privacy/goallab" className="text-amber-200/80 underline hover:text-amber-100/90">
              GoalLab — privacy policy
            </Link>
          </li>
          <li>
            <Link href="/privacy/popgoals" className="text-amber-200/80 underline hover:text-amber-100/90">
              PopGoals — privacy policy
            </Link>
          </li>
          <li>
            <Link href="/privacy/prophit" className="text-amber-200/80 underline hover:text-amber-100/90">
              ProphIt — privacy policy
            </Link>
          </li>
        </ul>
        <p>
          Other apps (for example tools linked from the <Link href="/" className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90">portfolio</Link> home) are
          covered in the main site list when applicable.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">6. Children’s privacy</h2>
        <p>
          This content is not aimed at children. We do not knowingly collect personal data from
          children through these pages. If you believe a child has sent personal data, use the
          contact email above.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">7. Retention</h2>
        <p>
          Email is kept as needed to respond and for ordinary records. Server logs follow the
          host’s schedule.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">8. Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, delete, or restrict
          use of your data, or to object. Contact the email in this document for requests related
          to this section of the site.
        </p>

        <h2 className="text-xl font-semibold text-white mt-8">9. Changes</h2>
        <p>
          This policy can change. The &quot;Last updated&quot; date here will be refreshed when it does.
        </p>

        <p className="text-xs text-white/50 pt-4 border-t border-white/10">
          Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}. For
          transparency only; not legal advice.
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
