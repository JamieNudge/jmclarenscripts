'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ComingSoonBlur } from '@/components/hub/ComingSoonBlur';
import { StatStrikeBoard } from '@/components/statstrike/StatStrikeBoard';
import { useStatStrikeBoard } from '@/hooks/useStatStrikeBoard';
import { useStatStrikeWebBlur } from '@/hooks/useStatStrikeWebBlur';
import { apps } from '@/lib/apps-data';

const statStrikeAppStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

/**
 * GoalLab hero right cell — branded StatStrike live board.
 * Coming Soon blur is controlled live from admin (RTDB), not a hardcode.
 */
export function StatStrikeHeroPanel() {
  const board = useStatStrikeBoard();
  const { blur } = useStatStrikeWebBlur();

  const boardEl = (
    <StatStrikeBoard
      variant="hero"
      maxRows={5}
      loading={board.loading}
      error={board.error}
      configured={board.configured}
      rows={board.rows}
      todayKey={board.todayKey}
    />
  );

  return (
    <aside
      className="flex h-[min(18.5rem,52vh)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#f7f9fb] shadow-[0_12px_40px_-20px_rgba(11,61,92,0.45)]"
      aria-label={blur ? 'StatStrike web version coming soon' : 'StatStrike web board'}
    >
      <header className="flex shrink-0 items-center gap-2.5 border-b border-black/8 bg-white/90 px-3 py-2">
        <Image
          src="/images/stat-strike-icon.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-md object-cover shadow-sm"
          priority
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-tight text-[#0b3d5c]">
            StatStrike (Web Version)
          </p>
          <p className="text-[10px] font-medium text-black/45">
            {blur ? 'Browser preview' : 'Live board'}
            {!board.loading ? (
              <span className="tabular-nums"> · {board.todayKey}</span>
            ) : null}
          </p>
        </div>
        {!blur ? (
          <Link
            href="/statstrike"
            className="shrink-0 text-[10px] font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
          >
            Open
          </Link>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {blur ? (
          <ComingSoonBlur
            badge="Coming Soon!"
            ctaHref={statStrikeAppStoreUrl}
            ctaLabel="Get StatStrike on the App Store"
            ctaStatStrike
            ctaPlacement="bottom"
            minHeightClassName="h-full"
            centerBadge
          >
            {boardEl}
          </ComingSoonBlur>
        ) : (
          <div className="h-full overflow-y-auto">{boardEl}</div>
        )}
      </div>
    </aside>
  );
}
