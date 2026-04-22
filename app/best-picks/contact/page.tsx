import type { Metadata } from 'next';
import Link from 'next/link';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';

const CONTACT_EMAIL = 'jmclarenscripts@gmail.com';
const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Today’s Best Picks — website')}`;

export const metadata: Metadata = {
  title: 'Contact — Today’s Best Picks',
  description: 'Contact the publisher of Today’s Best Picks and this portfolio website.',
};

export default function BestPicksContactPage() {
  return (
    <BestPicksSubpageShell
      title="Contact"
      description="Reach the publisher for questions about this website, privacy, or Today’s Best Picks."
    >
      <section className="space-y-4">
        <p>
          For privacy questions about this site (including Today&apos;s Best Picks, cookies, and Google ads), use the
          same contact channel referenced in the{' '}
          <Link
            href="/best-picks/privacy"
            className="text-amber-200/80 underline underline-offset-2 hover:text-amber-100/90"
          >
            privacy policy
          </Link>
          .
        </p>
        <p>
          <strong className="font-medium text-white">Email</strong>{' '}
          <a
            href={mailtoHref}
            className="text-amber-200/90 underline underline-offset-2 hover:text-amber-50 break-all"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-xs text-white/55">
          App-specific support may live on per-app pages from the portfolio; this address is for the public website
          and Best Picks unless you are directed otherwise.
        </p>
      </section>
    </BestPicksSubpageShell>
  );
}
