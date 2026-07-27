'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ComingSoonBlur } from '@/components/hub/ComingSoonBlur';
import { StatStrikeBoard } from '@/components/statstrike/StatStrikeBoard';
import { useStatStrikeBoard } from '@/hooks/useStatStrikeBoard';
import { useStatStrikePassSession } from '@/hooks/useStatStrikePassSession';
import { useStatStrikeWebBlur } from '@/hooks/useStatStrikeWebBlur';
import { passCreatePath } from '@/lib/statstrike/pass-constants';

/**
 * GoalLab hero right cell — branded StatStrike live board.
 * Pass gate blur is controlled live from admin (RTDB).
 * Active 24h pass sessions bypass the gate on this browser.
 */
export function StatStrikeHeroPanel() {
  const board = useStatStrikeBoard();
  const { blur: adminBlur, supporterPassSalesEnabled } = useStatStrikeWebBlur();
  const pass = useStatStrikePassSession();
  const blur = adminBlur && !pass.unlocked;

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
      aria-label={blur ? 'StatStrike web — unlock with a supporter pass' : 'StatStrike web board'}
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
          <p className="text-[10px] font-medium text-black/80">
            {pass.unlocked ? 'Pass active' : blur ? 'Pass required' : 'Live board'}
            {!board.loading ? (
              <span className="tabular-nums"> · {board.todayKey}</span>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!pass.unlocked && supporterPassSalesEnabled ? (
            <Link
              href={passCreatePath()}
              className="rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black text-black shadow-sm hover:bg-amber-200"
            >
              Get access
            </Link>
          ) : null}
          <Link
            href="/statstrike"
            className="text-[10px] font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
          >
            Open
          </Link>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {blur ? (
          <ComingSoonBlur
            badge={null}
            ctaHref={supporterPassSalesEnabled ? passCreatePath() : undefined}
            ctaLabel={supporterPassSalesEnabled ? 'Get access' : undefined}
            ctaInternal
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
