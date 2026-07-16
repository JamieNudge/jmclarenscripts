'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StatStrikeBoard } from '@/components/statstrike/StatStrikeBoard';
import { useStatStrikeBoard } from '@/hooks/useStatStrikeBoard';

export function StatStrikeAppShell() {
  const board = useStatStrikeBoard();

  return (
    <div className="min-h-screen bg-[#eef2f6] text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Image
            src="/images/stat-strike-icon.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl object-cover"
            priority
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold tracking-tight text-[#0b3d5c]">StatStrike</h1>
            <p className="text-xs text-black/50">Web app · football fixtures &amp; forecasts</p>
          </div>
          <nav className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/statstrike/settings" className="text-black/55 hover:text-[#0b3d5c]">
              Settings
            </Link>
            <Link href="/" className="text-[#0b3d5c] underline-offset-2 hover:underline">
              GoalLab
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <StatStrikeBoard
          variant="full"
          loading={board.loading}
          error={board.error}
          configured={board.configured}
          rows={board.rows}
          todayKey={board.todayKey}
          lastReason={board.lastReason}
          onReload={board.reload}
        />
      </main>
    </div>
  );
}
