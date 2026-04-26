import type { Metadata } from 'next';
import { AndAnotherThingFeed } from '@/components/best-picks/AndAnotherThingFeed';
import { BestPicksSubpageShell } from '@/components/best-picks/BestPicksSubpageShell';
import {
  AND_ANOTHER_THING_TITLE,
  FOOTBALL_PREDICTIONS_PAGE_TITLE,
} from '@/lib/football-predictions-brand';

const desc =
  'Short updates and asides: thought-of-the-day style notes from the publication. Informational only.';

export const metadata: Metadata = {
  title: `${AND_ANOTHER_THING_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
  description: desc,
  openGraph: {
    title: `${AND_ANOTHER_THING_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
    description: desc,
    type: 'website',
  },
};

export default function AndAnotherThingPage() {
  return (
    <BestPicksSubpageShell
      title={AND_ANOTHER_THING_TITLE}
      description="A short, informal line — a thought for the day, a link, or a picture. Nothing here is betting or financial advice."
      hubFooter
    >
      <AndAnotherThingFeed />
    </BestPicksSubpageShell>
  );
}
