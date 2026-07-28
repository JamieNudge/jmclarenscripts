'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ComingSoonBlur } from '@/components/hub/ComingSoonBlur';
import { StatStrikeBestPerformingPanel } from '@/components/statstrike/StatStrikeBestPerformingPanel';
import { StatStrikeBoard } from '@/components/statstrike/StatStrikeBoard';
import { StatStrikeBoardFilters } from '@/components/statstrike/StatStrikeBoardFilters';
import { StatStrikeMyRecordPanel } from '@/components/statstrike/StatStrikeMyRecordPanel';
import { StatStrikePremiumGate } from '@/components/statstrike/StatStrikePremiumGate';
import { useStatStrikeBoard } from '@/hooks/useStatStrikeBoard';
import { useStatStrikeHistoryWindow } from '@/hooks/useStatStrikeHistoryWindow';
import { useStatStrikePersonalPicks } from '@/hooks/useStatStrikePersonalPicks';
import { useStatStrikePassSession } from '@/hooks/useStatStrikePassSession';
import { useStatStrikeWebBlur } from '@/hooks/useStatStrikeWebBlur';
import {
  DEFAULT_BOARD_FILTERS,
  boardChipCounts,
  presentBoardRows,
  type BoardFilterState,
} from '@/lib/statstrike/board-filters';
import { passCreatePath } from '@/lib/statstrike/pass-constants';

type TabId = 'fixtures' | 'best' | 'record';

export function StatStrikeAppShell() {
  const board = useStatStrikeBoard();
  const { blur: adminBlur, supporterPassSalesEnabled, researchTagsUiEnabled } = useStatStrikeWebBlur();
  const pass = useStatStrikePassSession();
  const personal = useStatStrikePersonalPicks();
  const [filters, setFilters] = useState<BoardFilterState>(DEFAULT_BOARD_FILTERS);
  const [tab, setTab] = useState<TabId>('fixtures');
  const [premiumOpen, setPremiumOpen] = useState(false);
  const history = useStatStrikeHistoryWindow(7, { enabled: tab === 'best' });

  /** Pass holders bypass the board gate on this browser. */
  const blur = adminBlur && !pass.unlocked;

  const dayGroups = useMemo(
    () =>
      presentBoardRows(board.rows, filters, {
        personalFixtureIds: personal.savedFixtureIds,
      }),
    [board.rows, filters, personal.savedFixtureIds],
  );

  const chipCounts = useMemo(
    () =>
      boardChipCounts(board.rows, filters, {
        personalFixtureIds: personal.savedFixtureIds,
      }),
    [board.rows, filters, personal.savedFixtureIds],
  );

  const openPremiumOrToggle = (row?: (typeof board.rows)[number]) => {
    if (personal.enabled && row) {
      void personal.toggleFromBoardRow(row);
      return;
    }
    setPremiumOpen(true);
  };

  const bestPanel = (
    <StatStrikeBestPerformingPanel
      rows={board.rows}
      historyRecords={history.records}
      historyLoading={history.loading}
      historyError={history.error}
      onRefreshHistory={history.refresh}
      onOpenFixturesBest={
        blur
          ? undefined
          : () => {
              setFilters((f) => ({ ...f, league: 'bestPerforming', time: 'all' }));
              setTab('fixtures');
            }
      }
    />
  );

  const boardBody = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black/70 disabled:opacity-40"
          disabled={board.dayOffset <= -7}
          onClick={() => board.setDayOffset(board.dayOffset - 1)}
        >
          ← Prev
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-[#0b3d5c]">{board.selectionDateLabel}</p>
          <p className="text-[11px] tabular-nums text-black/80">{board.todayKey}</p>
        </div>
        <div className="flex gap-1.5">
          {board.dayOffset !== 0 ? (
            <button
              type="button"
              className="rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0b3d5c]"
              onClick={() => board.setDayOffset(0)}
            >
              Today
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-semibold text-black/70 disabled:opacity-40"
            disabled={board.dayOffset >= 2}
            onClick={() => board.setDayOffset(board.dayOffset + 1)}
          >
            Next →
          </button>
        </div>
      </div>

      <StatStrikeBoardFilters
        filters={filters}
        onChange={setFilters}
        yourPicksLocked={!personal.enabled}
        onYourPicksLockedClick={() => setPremiumOpen(true)}
        chipCounts={chipCounts}
        researchTagsUiEnabled={researchTagsUiEnabled}
      />

      <StatStrikeBoard
        variant="full"
        loading={board.loading}
        error={board.error}
        configured={board.configured}
        rows={board.rows}
        dayGroups={dayGroups}
        todayKey={board.todayKey}
        lastReason={board.lastReason}
        onReload={board.reload}
        onStarClick={(row) => openPremiumOrToggle(row)}
        isStarred={(row) =>
          personal.enabled && personal.isSaved(row.selectionDateKey, row.fixture.id)
        }
        researchTagsUiEnabled={researchTagsUiEnabled}
        emptyHint={
          board.rows.length > 0
            ? filters.league === 'yourSelections' && personal.enabled
              ? 'No starred picks yet. Tap the star on a fixture to save it here.'
              : 'No fixtures match these filters.'
            : undefined
        }
      />
    </div>
  );

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
            <h1 className="text-lg font-bold tracking-tight text-[#0b3d5c]">
              StatStrike (Web Version)
            </h1>
            <p className="text-xs text-black/70">
              {pass.unlocked
                ? 'Pass active'
                : blur
                  ? 'Unlock the full board with a supporter pass'
                  : 'Browser preview · interactive'}
            </p>
          </div>
          <nav className="flex items-center gap-3 text-xs font-semibold">
            {!pass.unlocked && supporterPassSalesEnabled ? (
              <Link
                href={passCreatePath()}
                className="rounded-full bg-amber-300 px-2.5 py-1 text-[11px] font-black text-black"
              >
                Get access
              </Link>
            ) : null}
            <Link href="/statstrike/settings" className="text-black/75 hover:text-[#0b3d5c]">
              Settings
            </Link>
            <Link href="/" className="text-[#0b3d5c] underline-offset-2 hover:underline">
              GoalLab
            </Link>
          </nav>
        </div>

        <div className="mx-auto flex max-w-3xl gap-1 px-4 pb-2">
          {(
            [
              { id: 'fixtures' as const, label: 'Fixtures' },
              { id: 'best' as const, label: 'Best Performing' },
              { id: 'record' as const, label: 'My Record' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (t.id === 'record' && !personal.enabled) {
                  setPremiumOpen(true);
                  return;
                }
                setTab(t.id);
              }}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                tab === t.id
                  ? 'bg-[#0b3d5c] text-white'
                  : 'text-black/75 hover:bg-black/[0.04]'
              }`}
            >
              {t.label}
              {t.id === 'record' && !personal.enabled ? ' · lock' : ''}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {blur ? (
          <ComingSoonBlur
            badge={null}
            ctaHref={supporterPassSalesEnabled ? passCreatePath() : undefined}
            ctaLabel={supporterPassSalesEnabled ? 'Get access' : undefined}
            ctaInternal
            ctaPlacement="bottom"
            minHeightClassName="min-h-[22rem]"
            centerBadge
          >
            {tab === 'fixtures' ? boardBody : null}
            {tab === 'best' ? bestPanel : null}
            {tab === 'record' && personal.enabled ? (
              <StatStrikeMyRecordPanel
                picks={personal.picks}
                loading={personal.loading}
                error={personal.error}
              />
            ) : null}
          </ComingSoonBlur>
        ) : (
          <>
            {tab === 'fixtures' ? boardBody : null}
            {tab === 'best' ? bestPanel : null}
            {tab === 'record' && personal.enabled ? (
              <StatStrikeMyRecordPanel
                picks={personal.picks}
                loading={personal.loading}
                error={personal.error}
              />
            ) : null}
          </>
        )}
      </main>

      <StatStrikePremiumGate open={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  );
}
