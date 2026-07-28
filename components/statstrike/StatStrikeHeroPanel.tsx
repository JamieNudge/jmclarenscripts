'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StatStrikeBoard } from '@/components/statstrike/StatStrikeBoard';
import { useStatStrikeBoard } from '@/hooks/useStatStrikeBoard';
import { useStatStrikePassSession } from '@/hooks/useStatStrikePassSession';
import { useStatStrikeWebBlur } from '@/hooks/useStatStrikeWebBlur';
import { passCreatePath } from '@/lib/statstrike/pass-constants';

/**
 * GoalLab hero right cell — branded StatStrike live board.
 * When the pass gate is on, show a clear teaser (no blur); “Open” / Get access
 * send visitors to create a pass. Pass holders get the interactive board.
 */
export function StatStrikeHeroPanel() {
  const board = useStatStrikeBoard();
  const { blur: adminBlur, supporterPassSalesEnabled } = useStatStrikeWebBlur();
  const pass = useStatStrikePassSession();
  const gated = adminBlur && !pass.unlocked;
  const accessHref = passCreatePath();
  const openHref = gated && supporterPassSalesEnabled ? accessHref : '/statstrike';

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
      aria-label={
        gated ? 'StatStrike web — unlock with a supporter pass' : 'StatStrike web board'
      }
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
            {pass.unlocked ? 'Pass active' : gated ? 'Pass required' : 'Live board'}
            {!board.loading ? (
              <span className="tabular-nums"> · {board.todayKey}</span>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!pass.unlocked && supporterPassSalesEnabled ? (
            <Link
              href={accessHref}
              className="rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black text-black shadow-sm hover:bg-amber-200"
            >
              Get access
            </Link>
          ) : null}
          <Link
            href={openHref}
            className="text-[10px] font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
          >
            Open
          </Link>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className={`h-full overflow-y-auto ${gated ? 'pointer-events-none select-none' : ''}`}
        >
          {boardEl}
        </div>
        {gated && supporterPassSalesEnabled ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#f7f9fb]/85 via-[#f7f9fb]/25 to-transparent px-3">
            <Link
              href={accessHref}
              className="pointer-events-auto inline-flex max-w-full items-center justify-center rounded-xl bg-[#0b3d5c] px-4 py-2.5 text-center text-xs font-semibold text-white shadow-md hover:opacity-90"
            >
              Get access
            </Link>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
