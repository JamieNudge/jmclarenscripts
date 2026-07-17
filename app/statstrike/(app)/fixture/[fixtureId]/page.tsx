import Image from 'next/image';
import Link from 'next/link';
import {
  resolveFixtureDetailDateKey,
  StatStrikeFixtureDetail,
} from '@/components/statstrike/StatStrikeFixtureDetail';

type PageProps = {
  params: { fixtureId: string };
  searchParams: { date?: string };
};

export default function StatStrikeFixturePage({ params, searchParams }: PageProps) {
  const fixtureId = Number(params.fixtureId);
  const dateKey = resolveFixtureDetailDateKey(searchParams.date);

  return (
    <div className="min-h-screen bg-[#eef2f6] text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Image
            src="/images/stat-strike-icon.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-[#0b3d5c]">Fixture</h1>
            <p className="text-xs text-black/70">StatStrike Web</p>
          </div>
          <Link href="/statstrike" className="text-xs font-semibold text-[#0b3d5c] hover:underline">
            ← Board
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        {!Number.isFinite(fixtureId) || fixtureId <= 0 ? (
          <p className="text-sm text-black/70">Invalid fixture id.</p>
        ) : (
          <StatStrikeFixtureDetail fixtureId={fixtureId} dateKey={dateKey} />
        )}
      </main>
    </div>
  );
}
