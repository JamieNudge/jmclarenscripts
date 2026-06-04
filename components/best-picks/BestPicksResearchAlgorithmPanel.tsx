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
import { apps } from '@/lib/apps-data';
import {
  FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH,
  FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE,
} from '@/lib/football-predictions-brand';

const statStrikeApp = apps.find((a) => a.id === 'stat-strike');
const STAT_STRIKE_APP_STORE_URL = statStrikeApp?.appStoreUrl;

export const bestPicksResearchAlgorithmPanelTitle = FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE;

const scrollArea =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth overscroll-y-contain';
const TEASER_VISIBLE_COUNT = 3;
const TEASER_BLURRED_COUNT = 3;

function bandPillClass(band: string): string {
  const b = band.toLowerCase();
  if (b.includes('over')) {
    return 'text-cyan-200 border-cyan-400/30 bg-cyan-500/15';
  }
  if (b.includes('under')) {
    return 'text-orange-200 border-orange-400/30 bg-orange-500/15';
  }
  return 'text-white/93 border-white/20 bg-white/10';
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
      return 'text-white/92 border-white/20 bg-white/10';
  }
}

function ConsensusPickRow({ pick, className = '' }: { pick: DailyConsensusPickParsed; className?: string }) {
  const score =
    pick.homeScore != null && pick.awayScore != null
      ? `${pick.homeScore}-${pick.awayScore}`
      : null;

  const venueLine = [pick.country?.trim(), pick.league?.trim()].filter(Boolean).join(' · ');
  const kickoffLine = pick.kickoff?.trim() || null;

  return (
    <li className={`rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 shrink-0 ${className}`.trim()}>
      {/* Stacked: full-width fixture + context first; model / outcome chips on a second row (no side-by-side squeeze). */}
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        <div className="w-full min-w-0">
          <p className="text-sm font-medium text-white leading-relaxed text-pretty">
            {pick.home}
            <span className="text-white/93 font-normal mx-1">v</span>
            {pick.away}
          </p>
          {venueLine ? <p className="text-xs text-white/94 mt-1.5 leading-relaxed text-pretty">{venueLine}</p> : null}
          {kickoffLine ? (
            <p className="text-xs text-white/94 leading-relaxed text-pretty">{kickoffLine}</p>
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

function PerModelPickRow({ row, className = '' }: { row: ResearchAlgorithmPerModelStructured; className?: string }) {
  const { home, away } = splitPerModelFixtureLine(row.fixtureLine);

  return (
    <li className={`rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 shrink-0 ${className}`.trim()}>
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        <div className="w-full min-w-0">
          <p className="text-sm font-medium text-white leading-relaxed text-pretty">
            {home}
            {away ? (
              <>
                <span className="text-white/93 font-normal mx-1">v</span>
                {away}
              </>
            ) : null}
          </p>
          {row.metaLine ? (
            <p className="text-xs text-white/94 mt-1.5 leading-relaxed text-pretty">{row.metaLine}</p>
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
              <p key={j} className="text-[11px] text-white/92 leading-relaxed text-pretty">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function DownloadAppTeaser({ hiddenCount, label }: { hiddenCount: number; label: string }) {
  return (
    <div className="rounded-xl border border-amber-200/35 bg-black/72 backdrop-blur-sm px-4 py-3 text-center shadow-lg shadow-black/25">
      <p className="text-sm font-semibold text-amber-100/95">Unlock the full daily list in StatStrike</p>
      <p className="mt-1 text-xs leading-relaxed text-white/90">
        Showing the first {TEASER_VISIBLE_COUNT} {label}
        {hiddenCount > 0 ? ` with ${hiddenCount} more available in the app today.` : '.'}
      </p>
      {STAT_STRIKE_APP_STORE_URL ? (
        <a
          href={STAT_STRIKE_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center justify-center rounded-lg border border-amber-200/45 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100/95 transition-colors hover:bg-amber-500/15 hover:border-amber-200/60"
        >
          Download the iOS app
        </a>
      ) : null}
    </div>
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
  const visibleConsensusPicks = consensusPicks.slice(0, TEASER_VISIBLE_COUNT);
  const blurredConsensusPicks = consensusPicks.slice(
    TEASER_VISIBLE_COUNT,
    TEASER_VISIBLE_COUNT + TEASER_BLURRED_COUNT,
  );
  const hiddenConsensusCount = Math.max(0, consensusPicks.length - visibleConsensusPicks.length);
  const visibleResearchRows = rows.slice(0, TEASER_VISIBLE_COUNT);
  const blurredResearchRows = rows.slice(TEASER_VISIBLE_COUNT, TEASER_VISIBLE_COUNT + TEASER_BLURRED_COUNT);
  const hiddenResearchCount = Math.max(0, rows.length - visibleResearchRows.length);

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
              <p className="text-sm text-white/93 leading-snug">
                {STAT_STRIKE_APP_STORE_URL ? (
                  <a
                    href={STAT_STRIKE_APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-200/93 underline underline-offset-2 hover:text-amber-100/95"
                  >
                    StatStrike - Best Performing - As seen in iOS app
                  </a>
                ) : (
                  <span className="text-amber-200/93">StatStrike - Best Performing - As seen in iOS app</span>
                )}
                <span className="text-white/92"> — </span>
                <Link
                  href={`${FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH}#bpl-statstrike-fixtures`}
                  className="text-amber-200/88 underline underline-offset-2 hover:text-amber-100/95"
                >
                  Best Performing BPL lines
                </Link>
                <span className="text-white/92"> in the hub fixture list.</span>
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
            Firebase is not configured — add keys in <code className="text-xs text-white/94">.env.local</code>.
          </p>
        )}

        {configured && (
          <>
            {hasConsensusContent ? (
              <div className="space-y-2 pb-1">
                <ul className="space-y-2">
                  {visibleConsensusPicks.map((pick) => (
                    <ConsensusPickRow key={`${pick.fixtureID}-${pick.band}`} pick={pick} />
                  ))}
                </ul>
                {blurredConsensusPicks.length > 0 ? (
                  <div className="relative pt-1">
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-10 bg-gradient-to-b from-transparent via-black/35 to-black/80" />
                    <ul
                      aria-hidden
                      className="space-y-2 select-none opacity-55 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.95),rgba(0,0,0,0.18))]"
                    >
                      {blurredConsensusPicks.map((pick) => (
                        <ConsensusPickRow
                          key={`blurred-${pick.fixtureID}-${pick.band}`}
                          pick={pick}
                          className="blur-[3px]"
                        />
                      ))}
                    </ul>
                    <div className="absolute inset-x-3 bottom-3">
                      <DownloadAppTeaser hiddenCount={hiddenConsensusCount} label="consensus picks" />
                    </div>
                  </div>
                ) : null}
              </div>
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
                <div className="space-y-2 pb-0.5 mt-1">
                  <ul className="space-y-2">
                    {visibleResearchRows.map((row, i) =>
                      row.perModel ? (
                        <PerModelPickRow key={`pm-${row.perModel.fixtureLine}-${i}`} row={row.perModel} />
                      ) : (
                        <li
                          key={`${row.primary.slice(0, 80)}-${i}`}
                          className="rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 shrink-0"
                        >
                          <p className="text-sm font-medium text-white leading-snug">{row.primary}</p>
                          {row.secondary ? (
                            <p className="text-xs text-white/94 mt-0.5 leading-snug whitespace-pre-line">
                              {row.secondary}
                            </p>
                          ) : null}
                        </li>
                      ),
                    )}
                  </ul>
                  {blurredResearchRows.length > 0 ? (
                    <div className="relative pt-1">
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-10 bg-gradient-to-b from-transparent via-black/35 to-black/80" />
                      <ul
                        aria-hidden
                        className="space-y-2 select-none opacity-55 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.95),rgba(0,0,0,0.18))]"
                      >
                        {blurredResearchRows.map((row, i) =>
                          row.perModel ? (
                            <PerModelPickRow
                              key={`blurred-pm-${row.perModel.fixtureLine}-${i}`}
                              row={row.perModel}
                              className="blur-[3px]"
                            />
                          ) : (
                            <li
                              key={`blurred-${row.primary.slice(0, 80)}-${i}`}
                              className="rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 shrink-0 blur-[3px]"
                            >
                              <p className="text-sm font-medium text-white leading-snug">{row.primary}</p>
                              {row.secondary ? (
                                <p className="text-xs text-white/94 mt-0.5 leading-snug whitespace-pre-line">
                                  {row.secondary}
                                </p>
                              ) : null}
                            </li>
                          ),
                        )}
                      </ul>
                      <div className="absolute inset-x-3 bottom-3">
                        <DownloadAppTeaser hiddenCount={hiddenResearchCount} label="selections" />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
