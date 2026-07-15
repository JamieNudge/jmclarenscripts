import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';

export const metadata: Metadata = {
  title: 'App and Page Privacy Policies — Football Predictions & Data-Driven Picks',
  description:
    'Privacy information for Football Predictions & Data-Driven Picks, related pages, the blog, and links to app-specific privacy policies hosted on the GoalLab domain.',
};

export default function BestPicksPrivacyPage() {
  return (
    <BestPicksSubpageShell
      alwaysShowHeaderNav
      showBackToHub={false}
      title="App and Page Privacy Policies"
      description="This page covers Football Predictions & Data-Driven Picks, related blog pages, and links to the separate privacy policies for individual apps discussed on the GoalLab site."
    >
      <section className="space-y-6 text-sm md:text-base leading-relaxed text-[var(--hub-text-soft)]">
        <p>
          This site section is operated by Jamie McLaren as the publisher of Football Predictions &amp; Data-Driven
          Picks and the blog. It explains how privacy works for these GoalLab web pages and links to
          separate privacy policies for individual iPhone and iPad apps, which are listed below.
        </p>
        <p>
          For privacy questions about <strong className="font-medium text-[var(--hub-text)]">this publication only</strong>, contact:{' '}
          <a
            href="mailto:jmclarenscripts@gmail.com?subject=Football%20Predictions%20%26%20Data-Driven%20Picks%20%2F%20blog%20privacy"
            className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]"
          >
            jmclarenscripts@gmail.com
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold text-[var(--hub-text)] mt-8">1. What these pages are</h2>
        <p>
          <strong className="font-medium text-[var(--hub-text)]">Football Predictions &amp; Data-Driven Picks</strong> (for example
          the hub, How apps work, Methodology, About, and Contact) and the{' '}
          <strong className="font-medium text-[var(--hub-text)]">blog</strong> present
          editorial and informational content, links to the App Store or social profiles, optional embedded
          video, and may show daily or research-style pick summaries when configured. You do not need
          an account to read this material.
        </p>

        <h2 className="text-xl font-semibold text-[var(--hub-text)] mt-8">2. Information collected in this section</h2>
        <p>
          <span className="font-semibold text-[var(--hub-text-soft)]">What you send:</span> If you use an email
          address given on this hub or a contact page, we receive what you include (for example
          your address and the message). Use the <HubFootballLink href="/football-predictions/contact" className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]">contact</HubFootballLink> page
          for publication-related questions.
        </p>
        <p>
          <span className="font-semibold text-[var(--hub-text-soft)]">Technical and hosting data:</span> Hosting
          (for example Vercel) may process IP address, browser type, and request logs for security
          and reliability, under the host’s policies.
        </p>
        <p>
          <span className="font-semibold text-[var(--hub-text-soft)]">Web analytics:</span> We use{' '}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]"
          >
            Vercel Web Analytics
          </a>{' '}
          on these pages to count visits and see which routes are used. It records anonymized page-view
          data (for example path and referrer) and does not use cookies for that purpose. See{' '}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]"
          >
            Vercel’s privacy policy
          </a>
          .
        </p>
        <p>
          These areas are not designed to collect special categories of data. Do not share unnecessary
          sensitive information by email.
        </p>

        <h2 className="text-xl font-semibold text-[var(--hub-text)] mt-8">3. Cookies and Google AdSense</h2>
        <p>
          On <span className="font-semibold text-[var(--hub-text)]">this hub</span> and the <span className="font-semibold text-[var(--hub-text)]">blog</span> we
          may use <span className="font-semibold text-[var(--hub-text)]">Google AdSense</span> when that is
          enabled for the site. Google and partners may use cookies or similar technologies to serve
          and measure ads, including based on your visits to this or other sites.
        </p>
        <p>
          You can read how Google uses data from sites that use its services:{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]"
          >
            How Google uses information from sites or apps that use our services
          </a>
          . Manage ad personalization:{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]"
          >
            Google Ads Settings
          </a>
          . More on cookies:{' '}
          <a
            href="https://policies.google.com/technologies/cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]"
          >
            Google Privacy &amp; Terms
          </a>
          . Where the law requires consent, you can also use your browser and any on-site consent
          tools.
        </p>

        <h2 className="text-xl font-semibold text-[var(--hub-text)] mt-8">4. Links to third parties</h2>
        <p>
          We link to app stores, video hosts, and social or bluesky pages. Those services have
          their own terms and privacy rules; we are not responsible for their practices.
        </p>

        <h2 className="text-xl font-semibold text-[var(--hub-text)] mt-8">5. App-specific privacy policies (football apps in this section)</h2>
        <p>These native apps are discussed on this site. Each has its own policy:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>
            <Link href="/privacy/statstrike" className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]">
              StatStrike — privacy policy
            </Link>
          </li>
          <li>
            <Link href="/privacy/goallab" className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]">
              GoalLab — privacy policy
            </Link>
          </li>
          <li>
            <Link href="/privacy/popgoals" className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]">
              PopGoals — privacy policy
            </Link>
          </li>
          <li>
            <Link href="/privacy/prophit" className="text-[var(--hub-accent-link)] underline hover:text-[var(--hub-accent-link-hover)]">
              ProphIt — privacy policy
            </Link>
          </li>
        </ul>
        <p>
          Other apps (for example tools linked from the <Link href="/" className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]">portfolio</Link> home) are
          covered in the main site list when applicable.
        </p>

        <h2 className="text-xl font-semibold text-[var(--hub-text)] mt-8">6. Children’s privacy</h2>
        <p>
          This content is not aimed at children. We do not knowingly collect personal data from
          children through these pages. If you believe a child has sent personal data, use the
          contact email above.
        </p>

        <h2 className="text-xl font-semibold text-[var(--hub-text)] mt-8">7. Retention</h2>
        <p>
          Email is kept as needed to respond and for ordinary records. Server logs follow the
          host’s schedule.
        </p>

        <h2 className="text-xl font-semibold text-[var(--hub-text)] mt-8">8. Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, delete, or restrict
          use of your data, or to object. Contact the email in this document for requests related
          to this section of the site.
        </p>

        <h2 className="text-xl font-semibold text-[var(--hub-text)] mt-8">9. Changes</h2>
        <p>
          This policy can change. The &quot;Last updated&quot; date here will be refreshed when it does.
        </p>

        <p className="text-xs text-[var(--hub-text-soft)] pt-4 border-t border-[var(--hub-border-soft)]">
          Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}. For
          transparency only; not legal advice.
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
