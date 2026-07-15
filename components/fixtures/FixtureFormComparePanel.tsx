'use client';

import {
  buildFormCompareRows,
  formatCompareValue,
  teamFormCompareStats,
  type FormCompareRow,
} from '@/lib/fixture-form-compare';
import type { WebMatchRow } from '@/lib/fixture-key-signals';

function CompareBar({ homeValue, awayValue }: { homeValue: number; awayValue: number }) {
  const total = homeValue + awayValue;
  const homePct = total > 0 ? (homeValue / total) * 100 : 50;
  const awayPct = total > 0 ? (awayValue / total) * 100 : 50;
  const homeLead = homeValue > awayValue;
  const awayLead = awayValue > homeValue;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="flex justify-end w-[42%] h-2 rounded-sm bg-white/[0.08] overflow-hidden">
        <div
          className={`h-full rounded-sm transition-all ${homeLead ? 'bg-emerald-500/90' : 'bg-white/30'}`}
          style={{ width: `${homePct}%` }}
        />
      </div>
      <div className="flex justify-start w-[42%] h-2 rounded-sm bg-white/[0.08] overflow-hidden">
        <div
          className={`h-full rounded-sm transition-all ${awayLead ? 'bg-emerald-500/90' : 'bg-white/30'}`}
          style={{ width: `${awayPct}%` }}
        />
      </div>
    </div>
  );
}

function CompareRow({ row }: { row: FormCompareRow }) {
  const homeDisplay = formatCompareValue(row.homeValue, row.format);
  const awayDisplay = formatCompareValue(row.awayValue, row.format);

  return (
    <div className="grid grid-cols-[2.5rem_1fr_2.5rem] gap-x-1.5 gap-y-1 items-center">
      <span className="text-xs font-semibold tabular-nums text-[var(--hub-text)] text-right">{homeDisplay}</span>
      <div className="min-w-0 space-y-1">
        <p className="text-[10px] text-center text-[var(--hub-text-muted)] leading-tight truncate">{row.label}</p>
        <CompareBar homeValue={row.homeValue} awayValue={row.awayValue} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-[var(--hub-text)] text-left">{awayDisplay}</span>
    </div>
  );
}

export function FixtureFormComparePanel({
  homeTeam,
  awayTeam,
  homeMatches,
  awayMatches,
  homeSampleLabel,
  awaySampleLabel,
  embedded = false,
}: {
  homeTeam: string;
  awayTeam: string;
  homeMatches: WebMatchRow[];
  awayMatches: WebMatchRow[];
  homeSampleLabel: string;
  awaySampleLabel: string;
  embedded?: boolean;
}) {
  const homeStats = teamFormCompareStats(homeMatches, homeTeam);
  const awayStats = teamFormCompareStats(awayMatches, awayTeam);
  const rows = buildFormCompareRows(homeStats, awayStats);
  const hasData = homeStats.matches > 0 || awayStats.matches > 0;

  return (
    <aside
      className={
        embedded
          ? 'overflow-hidden h-full'
          : 'rounded-xl border border-[var(--hub-border-soft)] bg-[var(--hub-chip)] overflow-hidden h-full'
      }
    >
      <div
        className={`border-b border-[var(--hub-border-soft)] bg-[var(--hub-inset)] ${embedded ? 'px-0 py-2' : 'px-3 py-2.5'}`}
      >
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--hub-text-soft)] text-center">Compare</h3>
        <p className="text-[10px] text-[var(--hub-text-faint)] text-center mt-0.5 leading-snug">Form samples for manual check</p>
      </div>

      <div className={`border-b border-[var(--hub-border-soft)] bg-[var(--hub-hover)] ${embedded ? 'px-0 py-2' : 'px-3 py-2.5'}`}>
        <div className="grid grid-cols-2 gap-2 text-[10px] leading-snug">
          <div className="min-w-0 text-center">
            <p className="font-semibold text-[var(--hub-text)] truncate" title={homeTeam}>
              {homeTeam}
            </p>
            <p className="text-[var(--hub-text-faint)] tabular-nums">{homeSampleLabel}</p>
          </div>
          <div className="min-w-0 text-center">
            <p className="font-semibold text-[var(--hub-text)] truncate" title={awayTeam}>
              {awayTeam}
            </p>
            <p className="text-[var(--hub-text-faint)] tabular-nums">{awaySampleLabel}</p>
          </div>
        </div>
      </div>

      <div className={`space-y-3 ${embedded ? 'px-0 py-2' : 'px-3 py-3'}`}>
        {!hasData ? (
          <p className="text-xs text-[var(--hub-text-muted)] leading-relaxed">No form sample for compare yet.</p>
        ) : (
          rows.map((row) => <CompareRow key={row.id} row={row} />)
        )}
      </div>
    </aside>
  );
}
