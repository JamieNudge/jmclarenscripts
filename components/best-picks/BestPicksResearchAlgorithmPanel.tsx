'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onValue, ref } from 'firebase/database';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import {
  formatBandAsGoalsPhrase,
  parseDailyConsensusSelections,
  researchAlgorithmFeedRows,
  statStrikeRtdbPathsFromEnv,
  type DailyConsensusFeedParsed,
  type DailyConsensusPickParsed,
  type ResearchAlgorithmFeedRow,
  type ResearchAlgorithmPerModelStructured,
} from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import {
  FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH,
  FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE,
} from '@/lib/football-predictions-brand';

export const bestPicksResearchAlgorithmPanelTitle = FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE;

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
      return 'text-white/72 border-white/20 bg-white/10';
  }
}

function ConsensusPickRow({ pick }: { pick: DailyConsensusPickParsed }) {
  const score =
    pick.homeScore != null && pick.awayScore != null
      ? `${pick.homeScore}-${pick.awayScore}`
      : null;

  const venue = [pick.country?.trim(), pick.league?.trim()].filter(Boolean).join(' · ');
  const metaLine = [venue, pick.kickoff?.trim()].filter(Boolean).join(' · ');

  return (
    <li className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 shrink-0">
      {/* Stacked: full-width fixture + context first; model / outcome chips on a second row (no side-by-side squeeze). */}
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        <div className="w-full min-w-0">
          <p className="text-sm font-medium text-white leading-relaxed text-pretty">
            {pick.home}
            <span className="text-white/65 font-normal mx-1">v</span>
            {pick.away}
          </p>
          {metaLine ? (
            <p className="text-xs text-white/90 mt-1.5 leading-relaxed text-pretty">{metaLine}</p>
          ) : null}
        </div>
        <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-1.5">
          <span
            className={`text-[11px] font-semibold leading-snug normal-case tracking-normal px-2 py-1 rounded-md border ${bandPillClass(pick.band)}`}
          >
            {formatBandAsGoalsPhrase(pick.band)}
          </span>
          <span className="text-[10px] font-semibold text-purple-200/95 border border-purple-400/25 bg-purple-500/15 px-2 py-0.5 rounded-md whitespace-nowrap">
            {pick.sources} models
          </span>
          {score ? (
            <span className="text-xs font-bold tabular-nums text-white whitespace-nowrap">{score}</span>
          ) : null}
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${outcomeClass(pick.outcome)}`}
          >
            {pick.outcome}
          </span>
        </div>
      </div>
    </li>
  );
}

const PER_MODEL_FIXTURE_SEP = ' v ';

function splitPerModelFixtureLine(fixtureLine: string): { home: string; away: string } {
  const i = fixtureLine.indexOf(PER_MODEL_FIXTURE_SEP);
  if (i < 0) return { home: fixtureLine, away: '' };
  return {
    home: fixtureLine.slice(0, i),
    away: fixtureLine.slice(i + PER_MODEL_FIXTURE_SEP.length),
  };
}

function PerModelPickRow({ row }: { row: ResearchAlgorithmPerModelStructured }) {
  const { home, away } = splitPerModelFixtureLine(row.fixtureLine);

  return (
    <li className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 shrink-0">
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        <div className="w-full min-w-0">
          <p className="text-sm font-medium text-white leading-relaxed text-pretty">
            {home}
            {away ? (
              <>
                <span className="text-white/65 font-normal mx-1">v</span>
                {away}
              </>
            ) : null}
          </p>
          {row.metaLine ? (
            <p className="text-xs text-white/90 mt-1.5 leading-relaxed text-pretty">{row.metaLine}</p>
          ) : null}
        </div>
        <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-1.5">
          {row.bandDisplay ? (
            <span
              className={`text-[11px] font-semibold leading-snug normal-case tracking-normal px-2 py-1 rounded-md border ${bandPillClass(row.bandRaw ?? row.bandDisplay)}`}
            >
              {row.bandDisplay}
            </span>
          ) : null}
          {row.modelTag ? (
            <span className="text-[10px] font-semibold text-purple-200/95 border border-purple-400/25 bg-purple-500/15 px-2 py-0.5 rounded-md max-w-full min-w-0 leading-snug text-pretty break-words">
              {row.modelTag}
            </span>
          ) : null}
          {row.score ? (
            <span className="text-xs font-bold tabular-nums text-white whitespace-nowrap">{row.score}</span>
          ) : null}
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${outcomeClass(row.outcome)}`}
          >
            {row.outcome}
          </span>
        </div>
        {row.mergedDetailLines && row.mergedDetailLines.length > 0 ? (
          <div className="space-y-1 pt-0.5 border-t border-white/12">
            {row.mergedDetailLines.map((line, j) => (
              <p key={j} className="text-[11px] text-white/85 leading-relaxed text-pretty">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function BestPicksResearchAlgorithmPanel({
  dateKey,
  showPanelHeading = true,
}: {
  dateKey: string;
  /** When false (e.g. full subpage with its own `h1`), skip the duplicate `h2` title. */
  showPanelHeading?: boolean;
}) {
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
        setConsensus(parseDailyConsensusSelections(snap.val(), dateKey));
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

  const sourcesCapLine =
    consensus && (consensus.minSources != null || consensus.maxPicksPerDay != null)
      ? [
          consensus.minSources != null ? `≥${consensus.minSources} sources` : null,
          consensus.maxPicksPerDay != null ? `top ${consensus.maxPicksPerDay}/day` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null;

  return (
    <div className={`${bestPicksGridTileClassName} min-h-0 h-full justify-start`}>
      <div className="shrink-0 mb-3 space-y-4">
        <div>
          {showPanelHeading ? (
            <h2 className="text-lg md:text-xl font-semibold text-white">{bestPicksResearchAlgorithmPanelTitle}</h2>
          ) : null}
          <p
            className={`text-sm text-white leading-relaxed ${showPanelHeading ? 'mt-2' : ''}`}
          >
            Selections are driven by multi-model consensus in an attempt to determine a highly reliable list every day.
          </p>
        </div>

        {configured ? (
          <div className="space-y-2 border-t border-white/15 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-white">Daily consensus</p>
            {consensusError ? (
              <p className="text-sm text-red-300 leading-relaxed" role="alert">
                {consensusError}
              </p>
            ) : null}
            {!consensusError && consensusLoading ? (
              <p className="text-sm text-white leading-relaxed">Loading consensus…</p>
            ) : null}
            {!consensusError && !consensusLoading && sourcesCapLine ? (
              <p className="text-sm text-white tabular-nums leading-snug">{sourcesCapLine}</p>
            ) : null}
            {!consensusError && !consensusLoading && recordLine ? (
              <p className="text-sm text-white leading-snug">{recordLine}</p>
            ) : null}
            {!consensusError && !consensusLoading ? (
              <p className="text-sm text-white/80 leading-snug">
                <Link
                  href={`${FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH}#bpl-statstrike-fixtures`}
                  className="text-amber-200/90 underline underline-offset-2 hover:text-amber-100/95"
                >
                  StatStrike - Best Performing - As seen in iOS app
                </Link>
                <span className="text-white/60"> — Best Performing BPL lines in the hub fixture list.</span>
              </p>
            ) : null}
            {!consensusError && !consensusLoading && !hasConsensusContent ? (
              <p className="text-sm text-white leading-relaxed">
                No consensus picks for <span className="tabular-nums">{dateKey}</span> yet.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={scrollArea}>
        {!configured && (
          <p className="text-sm text-white leading-relaxed">
            Firebase is not configured — add keys in <code className="text-xs text-white/90">.env.local</code>.
          </p>
        )}

        {configured && (
          <>
            {hasConsensusContent ? (
              <ul className="space-y-2 pb-1">
                {consensusPicks.map((pick) => (
                  <ConsensusPickRow key={`${pick.fixtureID}-${pick.band}`} pick={pick} />
                ))}
              </ul>
            ) : null}

            {showDivider && <div className="border-t border-white/15 my-3 shrink-0" aria-hidden />}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white mb-2">Per-model selections</p>
              {researchError ? (
                <p className="text-sm text-red-300 leading-relaxed" role="alert">
                  {researchError}
                </p>
              ) : null}
              {!researchError && researchLoading && (
                <p className="text-sm text-white leading-relaxed">Loading…</p>
              )}
              {!researchError && !researchLoading && !hasResearchContent && (
                <p className="text-sm text-white leading-relaxed">
                  No lines for <span className="tabular-nums text-white">{dateKey}</span> after filtering.
                </p>
              )}
              {hasResearchContent && (
                <ul className="space-y-2 pb-0.5 mt-1">
                  {rows.map((row, i) =>
                    row.perModel ? (
                      <PerModelPickRow key={`pm-${row.perModel.fixtureLine}-${i}`} row={row.perModel} />
                    ) : (
                      <li
                        key={`${row.primary.slice(0, 80)}-${i}`}
                        className="rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 shrink-0"
                      >
                        <p className="text-sm font-medium text-white leading-snug">{row.primary}</p>
                        {row.secondary ? (
                          <p className="text-xs text-white/90 mt-0.5 leading-snug whitespace-pre-line">
                            {row.secondary}
                          </p>
                        ) : null}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
