import type { Metadata } from 'next';
import { GoalLabV2SubpageShell } from '@/components/goallab/v2/GoalLabV2SubpageShell';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

const CONTACT_EMAIL = 'jmclarenscripts@gmail.com';
const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('GoalLab — website')}`;

export const metadata: Metadata = {
  title: `Contact — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
  description: 'Contact the publisher of GoalLab and this portfolio website.',
};

export default function BestPicksContactPage() {
  return (
    <GoalLabV2SubpageShell
      title="Contact"
      description="Reach the publisher for questions about this website, privacy, or GoalLab."
    >
      <section className="space-y-4">
        <p>
          For privacy questions about this site (including this hub, cookies, and any advertising tech when
          enabled), use the same contact channel referenced in the{' '}
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
            target="_blank"
            rel="noopener noreferrer"
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
    </GoalLabV2SubpageShell>
  );
}
