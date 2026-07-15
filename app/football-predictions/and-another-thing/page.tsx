import type { Metadata } from 'next';
import { AndAnotherThingFeed } from '@/components/best-picks/AndAnotherThingFeed';
import { GoalLabV2SubpageShell } from '@/components/goallab/v2/GoalLabV2SubpageShell';
import {
  AND_ANOTHER_THING_TITLE,
  FOOTBALL_PREDICTIONS_PAGE_TITLE,
} from '@/lib/football-predictions-brand';
import { loadAndAnotherThingPostsForPublic } from '@/lib/and-another-thing.posts.server';

const desc =
  'Short updates and asides: thought-of-the-day style notes from the publication. Informational only.';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: `${AND_ANOTHER_THING_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
  description: desc,
  openGraph: {
    title: `${AND_ANOTHER_THING_TITLE} — ${FOOTBALL_PREDICTIONS_PAGE_TITLE}`,
    description: desc,
    type: 'website',
  },
};

export default async function AndAnotherThingPage() {
  const initialPosts = await loadAndAnotherThingPostsForPublic();
  return (
    <GoalLabV2SubpageShell
      title={AND_ANOTHER_THING_TITLE}
      description="A short, informal line — a thought for the day, a link, or a picture. Nothing here is betting or financial advice."
      wide
    >
      <AndAnotherThingFeed initialPosts={initialPosts} />
    </GoalLabV2SubpageShell>
  );
}
