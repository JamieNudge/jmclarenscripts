'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import {
  parseDailyConsensusSelections,
  researchAlgorithmFeedRows,
  statStrikeRtdbPathsFromEnv,
  type DailyConsensusFeedParsed,
  type DailyConsensusPickParsed,
  type ResearchAlgorithmFeedRow,
} from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

export const bestPicksResearchAlgorithmPanelTitle = "Latest Research Algorithm's Selections";

const scrollArea =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth overscroll-y-contain';

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

function ConsensusPickRow({ pick }: { pick: DailyConsensusPickParsed }) {
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

export function BestPicksResearchAlgorithmPanel({ dateKey }: { dateKey: string }) {
  const [rows, setRows] = useState<ResearchAlgorithmFeedRow[]>([]);
  const [researchLoading, setResearchLoading] = useState(true);
  const [researchError, setResearchError] = useState<string | null>(null);

  const [consensus, setConsensus] = useState<DailyConsensusFeedParsed | null>(null);
  const [consensusLoading, setConsensusLoading] = useState(true);
  const [consensusError, setConsensusError] = useState<string | null>(null);

  const { researchAlgorithmSelectionsPath, dailyConsensusSelectionsPath } = statStrikeRtdbPathsFromEnv(dateKey);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setResearchLoading(false);
      setResearchError(null);
      setRows([]);
      setConsensusLoading(false);
      setConsensusError(null);
      setConsensus(null);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setResearchLoading(false);
      setConsensusLoading(false);
      return;
    }

    setResearchLoading(true);
    const researchRef = ref(db, researchAlgorithmSelectionsPath);
    const unsubResearch = onValue(
      researchRef,
      (snap) => {
        setResearchError(null);
        setResearchLoading(false);
        setRows(researchAlgorithmFeedRows(snap.val(), dateKey));
      },
      (err) => {
        setResearchError(err.message);
        setResearchLoading(false);
        setRows([]);
      },
    );

    setConsensusLoading(true);
    const consensusRef = ref(db, dailyConsensusSelectionsPath);
    const unsubConsensus = onValue(
      consensusRef,
      (snap) => {
        setConsensusError(null);
        setConsensusLoading(false);
        setConsensus(parseDailyConsensusSelections(snap.val()));
      },
      (err) => {
        setConsensusError(err.message);
        setConsensusLoading(false);
        setConsensus(null);
      },
    );

    return () => {
      unsubResearch();
      unsubConsensus();
    };
  }, [dateKey, researchAlgorithmSelectionsPath, dailyConsensusSelectionsPath]);

  const configured = isFirebaseClientConfigured();
  const consensusPicks = consensus?.picks ?? [];
  const hasConsensusContent = consensusPicks.length > 0;
  const hasResearchContent = rows.length > 0;

  const recordLine =
    consensus &&
    `Consensus filter: ${consensus.record.wins}W-${consensus.record.losses}L${
      consensus.record.pending > 0 || consensus.record.voids > 0
        ? ` · ${consensus.record.pending} pending · ${consensus.record.voids} void`
        : ''
    }${consensus.record.rate > 0 ? ` (${consensus.record.rate.toFixed(1)}% settled)` : ''}`;

  const showDivider = hasConsensusContent && hasResearchContent;

  return (
    <div className={`${bestPicksGridTileClassName} justify-start`}>
      <div className="shrink-0 mb-2">
        <h2 className="text-lg md:text-xl font-semibold text-white">{bestPicksResearchAlgorithmPanelTitle}</h2>
        <p className="text-[11px] text-white/45 mt-1 leading-snug">
          Multi-model daily consensus plus per-model lines (All Models Best Forecaster uploads). Both feeds use
          Firebase <code className="text-[10px] text-white/35">onValue</code> — the page updates as soon as RTDB
          changes (no fixed polling interval). FT scores and outcomes only move when those fields are written to{' '}
          <code className="text-[10px] text-white/35">dailyConsensusSelections</code> and{' '}
          <code className="text-[10px] text-white/35">researchAlgorithmSelections</code> for this date.
        </p>
      </div>

      <div className={scrollArea}>
        {!configured && (
          <p className="text-sm text-white/60 leading-relaxed">
            Firebase is not configured — add keys in <code className="text-xs text-white/45">.env.local</code>.
          </p>
        )}

        {configured && (
          <>
            <div className="mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50 mb-2">Daily consensus</p>
              {consensusError ? (
                <p className="text-sm text-red-300/90 leading-relaxed mb-2" role="alert">
                  {consensusError}
                </p>
              ) : null}
              {!consensusError && consensusLoading && (
                <p className="text-sm text-white/60 leading-relaxed">Loading…</p>
              )}
              {!consensusError && !consensusLoading && consensus && (consensus.minSources != null || consensus.maxPicksPerDay != null) && (
                <p className="text-[10px] text-white/40 tabular-nums mb-2">
                  {consensus.minSources != null ? `≥${consensus.minSources} sources` : ''}
                  {consensus.minSources != null && consensus.maxPicksPerDay != null ? ' · ' : ''}
                  {consensus.maxPicksPerDay != null ? `top ${consensus.maxPicksPerDay}/day` : ''}
                </p>
              )}
              {!consensusError && !consensusLoading && recordLine ? (
                <p className="text-[11px] text-white/50 mb-2 leading-relaxed">{recordLine}</p>
              ) : null}
              {!consensusError && !consensusLoading && !hasConsensusContent && (
                <p className="text-sm text-white/55 leading-relaxed">
                  No consensus for <span className="tabular-nums text-white/45">{dateKey}</span> yet.
                </p>
              )}
              {hasConsensusContent && (
                <ul className="space-y-2 pb-1">
                  {consensusPicks.map((pick) => (
                    <ConsensusPickRow key={`${pick.fixtureID}-${pick.band}`} pick={pick} />
                  ))}
                </ul>
              )}
            </div>

            {showDivider && <div className="border-t border-white/10 my-3 shrink-0" aria-hidden />}

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50 mb-2">
                Per-model selections
              </p>
              {researchError ? (
                <p className="text-sm text-red-300/90 leading-relaxed" role="alert">
                  {researchError}
                </p>
              ) : null}
              {!researchError && researchLoading && (
                <p className="text-sm text-white/60 leading-relaxed">Loading…</p>
              )}
              {!researchError && !researchLoading && !hasResearchContent && (
                <p className="text-sm text-white/55 leading-relaxed">
                  No lines for <span className="tabular-nums text-white/45">{dateKey}</span> after filtering.
                </p>
              )}
              {hasResearchContent && (
                <ul className="space-y-2 pb-0.5 mt-1">
                  {rows.map((row, i) => (
                    <li
                      key={`${row.primary.slice(0, 80)}-${i}`}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 shrink-0"
                    >
                      <p className="text-sm font-medium text-white leading-snug">{row.primary}</p>
                      {row.secondary ? (
                        <p className="text-xs text-white/55 mt-0.5 leading-snug whitespace-pre-line">
                          {row.secondary}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
