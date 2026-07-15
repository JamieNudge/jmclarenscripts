import type { Metadata } from 'next';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';

const CONTACT_EMAIL = 'jmclarenscripts@gmail.com';
const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  'Football Predictions & Data-Driven Picks — website',
)}`;

export const metadata: Metadata = {
  title: 'Contact — Football Predictions & Data-Driven Picks',
  description:
    'Contact the publisher of Football Predictions & Data-Driven Picks and this portfolio website.',
};

export default function BestPicksContactPage() {
  return (
    <BestPicksSubpageShell
      title="Contact"
      description="Reach the publisher for questions about this website, privacy, or Football Predictions & Data-Driven Picks."
    >
      <section className="space-y-4">
        <p>
          For privacy questions about this site (including this hub, cookies, and Google ads), use the
          same contact channel referenced in the{' '}
          <HubFootballLink
            href="/football-predictions/privacy"
            className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)]"
          >
            privacy policy
          </HubFootballLink>
          .
        </p>
        <p>
          <strong className="font-medium text-[var(--hub-text)]">Email</strong>{' '}
          <a
            href={mailtoHref}
            className="text-[var(--hub-accent-link)] underline underline-offset-2 hover:text-[var(--hub-accent-link-hover)] break-all"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-xs text-[var(--hub-text-soft)]">
          App-specific support may live on per-app pages from the portfolio; this address is for the public website
          and this publication unless you are directed otherwise.
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
