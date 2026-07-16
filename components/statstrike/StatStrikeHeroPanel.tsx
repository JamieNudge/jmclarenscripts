'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StatStrikeBoard } from '@/components/statstrike/StatStrikeBoard';
import { useStatStrikeBoard } from '@/hooks/useStatStrikeBoard';

/**
 * GoalLab hero right cell — branded StatStrike live board.
 * Distinct from GoalLab fixture cards; uses /images/stat-strike-icon.png + wordmark.
 */
export function StatStrikeHeroPanel() {
  const board = useStatStrikeBoard();

  return (
    <aside
      className="flex max-h-[min(18.5rem,52vh)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#f7f9fb] shadow-[0_12px_40px_-20px_rgba(11,61,92,0.45)]"
      aria-label="StatStrike web app"
    >
      <header className="flex shrink-0 items-center gap-2.5 border-b border-black/8 bg-white/90 px-3 py-2 backdrop-blur-sm">
        <Image
          src="/images/stat-strike-icon.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-md object-cover shadow-sm"
          priority
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold tracking-tight text-[#0b3d5c]">StatStrike</p>
          <p className="text-[10px] font-medium text-black/45">
            Web app
            {!board.loading ? (
              <span className="tabular-nums">
                {' '}
                · {board.todayKey} · {board.rows.length} live
              </span>
            ) : null}
          </p>
        </div>
        <Link
          href="/statstrike"
          className="shrink-0 rounded-md bg-[#0b3d5c] px-2 py-1 text-[10px] font-semibold text-white hover:opacity-90"
        >
          Open full
        </Link>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <StatStrikeBoard
          variant="hero"
          maxRows={5}
          loading={board.loading}
          error={board.error}
          configured={board.configured}
          rows={board.rows}
          todayKey={board.todayKey}
          onReload={board.reload}
        />
      </div>

      <footer className="shrink-0 border-t border-black/8 bg-white/70 px-3 py-1.5">
        <Link
          href="/statstrike"
          className="text-[11px] font-semibold text-[#0b3d5c] underline-offset-2 hover:underline"
        >
          Open full StatStrike →
        </Link>
      </footer>
    </aside>
  );
}
