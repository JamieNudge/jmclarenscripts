import { redirect } from 'next/navigation';

export default function GoalLabV2FixtureDetailRedirect({
  params,
  searchParams,
}: {
  params: { fixtureId: string };
  searchParams?: { date?: string };
}) {
  const id = encodeURIComponent(params.fixtureId);
  const date = searchParams?.date?.trim();
  const qs = date ? `?date=${encodeURIComponent(date)}` : '';
  redirect(`/football-predictions/fixtures/${id}${qs}`);
}
