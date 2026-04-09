'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import {
  parseDailyConsensusSelections,
  statStrikeRtdbPathsFromEnv,
  type DailyConsensusFeedParsed,
  type DailyConsensusPickParsed,
} from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

export const bestPicksDailyConsensusPanelTitle = 'Daily consensus (All Models Best Forecaster)';

function bandPillClass(band: string): string {
  const b = band.toLowerCase();
  if (b.includes('over')) {
    return 'text-cyan-200 border-cyan-400/30 bg-cyan-500/15';
  }
  if (b.includes('under')) {
    return 'text-orange-200 border-orange-400/30 bg-orange-500/15';
  }
  return 'text-white/80 border-white/20 bg-white/10';
}

function outcomeClass(outcome: string): string {
  switch (outcome) {
    case 'win':
      return 'text-emerald-300 border-emerald-400/35 bg-emerald-500/15';
    case 'loss':
      return 'text-red-300 border-red-400/35 bg-red-500/15';
    case 'void':
      return 'text-amber-200 border-amber-400/35 bg-amber-500/15';
    default:
      return 'text-white/55 border-white/20 bg-white/10';
  }
}

function PickRow({ pick }: { pick: DailyConsensusPickParsed }) {
  const score =
    pick.homeScore != null && pick.awayScore != null
      ? `${pick.homeScore}-${pick.awayScore}`
      : null;
  return (
    <li className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 shrink-0">
      <div className="flex flex-wrap items-start gap-2 justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white leading-snug">
            {pick.home} <span className="text-white/40 font-normal">vs</span> {pick.away}
          </p>
          <p className="text-xs text-white/50 mt-0.5 leading-snug">
            {pick.country}
            {pick.league ? ` · ${pick.league}` : ''}
            {pick.kickoff ? ` · ${pick.kickoff}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 justify-end shrink-0">
          <span
            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${bandPillClass(pick.band)}`}
          >
            {pick.band.includes('2.5') ? (pick.band.toLowerCase().includes('under') ? 'U2.5' : 'O2.5') : pick.band}
          </span>
          <span className="text-[10px] font-semibold text-purple-200/95 border border-purple-400/25 bg-purple-500/15 px-2 py-0.5 rounded-md">
            {pick.sources} models
          </span>
          {pick.confidence > 0 ? (
            <span className="text-[10px] tabular-nums text-white/45">{Math.round(pick.confidence)}%</span>
          ) : null}
          {score ? (
            <span className="text-xs font-bold tabular-nums text-white/90">{score}</span>
          ) : null}
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${outcomeClass(pick.outcome)}`}
          >
            {pick.outcome}
          </span>
        </div>
      </div>
    </li>
  );
}

export function BestPicksDailyConsensusPanel({ dateKey }: { dateKey: string }) {
  const [data, setData] = useState<DailyConsensusFeedParsed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { dailyConsensusSelectionsPath } = statStrikeRtdbPathsFromEnv(dateKey);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setLoading(false);
      setError(null);
      setData(null);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setLoading(false);
      return;
    }
    const r = ref(db, dailyConsensusSelectionsPath);
    setLoading(true);
    return onValue(
      r,
      (snap) => {
        setError(null);
        setLoading(false);
        setData(parseDailyConsensusSelections(snap.val()));
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        setData(null);
      },
    );
  }, [dateKey, dailyConsensusSelectionsPath]);

  const configured = isFirebaseClientConfigured();

  const recordLine =
    data &&
    `Filter backtest: ${data.record.wins}W-${data.record.losses}L${
      data.record.pending > 0 || data.record.voids > 0
        ? ` · ${data.record.pending} pending · ${data.record.voids} void`
        : ''
    }${data.record.rate > 0 ? ` (${data.record.rate.toFixed(1)}% settled)` : ''}`;

  return (
    <div
      className={`${bestPicksGridTileClassName} md:col-span-3 justify-start border border-violet-400/20 bg-violet-950/20`}
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2 shrink-0">
        <h2 className="text-lg md:text-xl font-semibold text-white">{bestPicksDailyConsensusPanelTitle}</h2>
        {data && (data.minSources != null || data.maxPicksPerDay != null) ? (
          <p className="text-[11px] text-white/45 tabular-nums">
            {data.minSources != null ? `≥${data.minSources} sources` : ''}
            {data.minSources != null && data.maxPicksPerDay != null ? ' · ' : ''}
            {data.maxPicksPerDay != null ? `top ${data.maxPicksPerDay}/day` : ''}
          </p>
        ) : null}
      </div>
      {recordLine ? (
        <p className="text-xs text-white/55 mb-3 leading-relaxed shrink-0">{recordLine}</p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth overscroll-y-contain">
        {!configured && (
          <p className="text-sm text-white/60 leading-relaxed">
            Firebase is not configured — add keys in <code className="text-xs text-white/45">.env.local</code>.
          </p>
        )}
        {configured && error && (
          <p className="text-sm text-red-300/90 leading-relaxed" role="alert">
            {error}
          </p>
        )}
        {configured && !error && loading && (
          <p className="text-sm text-white/60 leading-relaxed">Loading daily consensus…</p>
        )}
        {configured && !error && !loading && (!data || data.picks.length === 0) && (
          <p className="text-sm text-white/60 leading-relaxed">
            No daily consensus payload for <span className="tabular-nums text-white/50">{dateKey}</span> yet. Upload
            from All Models Best Forecaster (same action as research selections) or check RTDB read rules for{' '}
            <code className="text-xs text-white/45 break-all">{dailyConsensusSelectionsPath}</code>.
          </p>
        )}
        {data && data.picks.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pb-0.5">
            {data.picks.map((pick) => (
              <PickRow key={`${pick.fixtureID}-${pick.band}`} pick={pick} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
