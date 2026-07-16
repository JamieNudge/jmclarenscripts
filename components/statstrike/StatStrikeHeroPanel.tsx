'use client';

import Image from 'next/image';
import { ComingSoonBlur } from '@/components/hub/ComingSoonBlur';
import { StatStrikeBoard } from '@/components/statstrike/StatStrikeBoard';
import { useStatStrikeBoard } from '@/hooks/useStatStrikeBoard';
import { apps } from '@/lib/apps-data';

const statStrikeAppStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

/**
 * GoalLab hero right cell — branded StatStrike live board (fixtures teaser blurred).
 */
export function StatStrikeHeroPanel() {
  const board = useStatStrikeBoard();

  return (
    <aside
      className="flex max-h-[min(18.5rem,52vh)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#f7f9fb] shadow-[0_12px_40px_-20px_rgba(11,61,92,0.45)]"
      aria-label="StatStrike web version coming soon"
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
            Browser preview
            {!board.loading ? (
              <span className="tabular-nums"> · {board.todayKey}</span>
            ) : null}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ComingSoonBlur
          badge="Coming Soon!"
          ctaHref={statStrikeAppStoreUrl}
          ctaLabel="Get StatStrike on the App Store"
          minHeightClassName="min-h-full h-full"
          centerBadge
        >
          <StatStrikeBoard
            variant="hero"
            maxRows={5}
            loading={board.loading}
            error={board.error}
            configured={board.configured}
            rows={board.rows}
            todayKey={board.todayKey}
          />
        </ComingSoonBlur>
      </div>
    </aside>
  );
}
