'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import {
  formatBandAsGoalsPhrase,
  parseDailyConsensusSelections,
  statStrikeRtdbPathsFromEnv,
  type DailyConsensusFeedParsed,
  type DailyConsensusPickParsed,
} from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';
import { apps } from '@/lib/apps-data';
import { FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_TITLE } from '@/lib/football-predictions-brand';

const goalLabApp = apps.find((a) => a.id === 'goallab');
const GOALLAB_APP_STORE_URL = goalLabApp?.appStoreUrl;

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
  return 'text-[var(--hub-text-soft)] border-[var(--hub-border)] bg-[var(--hub-chip)]';
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
      return 'text-[var(--hub-text-soft)] border-[var(--hub-border)] bg-[var(--hub-chip)]';
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
    <li className={`rounded-xl border border-[var(--hub-border-soft)] bg-white/[0.06] px-3 py-2.5 shrink-0 ${className}`.trim()}>
      {/* Stacked: full-width fixture + context first; model / outcome chips on a second row (no side-by-side squeeze). */}
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        <div className="w-full min-w-0">
          <p className="text-sm font-medium text-[var(--hub-text)] leading-relaxed text-pretty">
            {pick.home}
            <span className="text-[var(--hub-text-soft)] font-normal mx-1">v</span>
            {pick.away}
          </p>
          {venueLine ? <p className="text-xs text-[var(--hub-text-soft)] mt-1.5 leading-relaxed text-pretty">{venueLine}</p> : null}
          {kickoffLine ? (
            <p className="text-xs text-[var(--hub-text-soft)] leading-relaxed text-pretty">{kickoffLine}</p>
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
            <span className="text-xs font-bold tabular-nums text-[var(--hub-text)] whitespace-nowrap">{score}</span>
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

function LockedConsensusPlaceholderRow({ className = '' }: { className?: string }) {
  return (
    <li className={`rounded-xl border border-[var(--hub-border-soft)] bg-white/[0.06] px-3 py-2.5 shrink-0 ${className}`.trim()}>
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        <div className="w-full min-w-0 space-y-1.5">
          <div className="h-4 w-3/4 rounded bg-white/16" />
          <div className="h-3 w-2/3 rounded bg-[var(--hub-chip)]" />
          <div className="h-3 w-1/2 rounded bg-[var(--hub-chip)]" />
        </div>
        <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-1.5">
          <span className="h-6 w-20 rounded-md border border-[var(--hub-border-soft)] bg-[var(--hub-chip)]" />
          <span className="h-5 w-24 rounded-md border border-[var(--hub-border-soft)] bg-[var(--hub-chip)]" />
          <span className="h-4 w-10 rounded bg-[var(--hub-chip)]" />
          <span className="h-5 w-14 rounded-md border border-[var(--hub-border-soft)] bg-[var(--hub-chip)]" />
        </div>
      </div>
    </li>
  );
}

function DownloadAppTeaser({ hiddenCount, label }: { hiddenCount: number; label: string }) {
  return (
    <div className="rounded-xl border border-amber-200/35 bg-[var(--hub-inset)] backdrop-blur-sm px-4 py-3 text-center shadow-lg shadow-black/25">
      <p className="text-sm font-semibold text-[var(--hub-accent-link)]">Unlock the full daily list in GoalLab</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--hub-text-soft)]">
        Showing the first {TEASER_VISIBLE_COUNT} {label}
        {hiddenCount > 0 ? ` with ${hiddenCount} more available in the app today.` : '.'}
      </p>
      {GOALLAB_APP_STORE_URL ? (
        <a
          href={GOALLAB_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center justify-center rounded-lg border border-amber-200/45 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-[var(--hub-accent-link)] transition-colors hover:bg-amber-500/15 hover:border-amber-200/60"
        >
          Download GoalLab on iOS
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
  const [consensus, setConsensus] = useState<DailyConsensusFeedParsed | null>(null);
  const [consensusLoading, setConsensusLoading] = useState(true);
  const [consensusError, setConsensusError] = useState<string | null>(null);

  const { dailyConsensusSelectionsPath } = statStrikeRtdbPathsFromEnv(dateKey);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setConsensusLoading(false);
      setConsensusError(null);
      setConsensus(null);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setConsensusLoading(false);
      return;
    }

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
      unsubConsensus();
    };
  }, [dateKey, dailyConsensusSelectionsPath]);

  const configured = isFirebaseClientConfigured();
  const consensusPicks = consensus?.picks ?? [];
  const hasConsensusContent = consensusPicks.length > 0;
  const visibleConsensusPicks = consensusPicks.slice(0, TEASER_VISIBLE_COUNT);
  const blurredConsensusPicks = consensusPicks.slice(
    TEASER_VISIBLE_COUNT,
    TEASER_VISIBLE_COUNT + TEASER_BLURRED_COUNT,
  );
  const hiddenConsensusCount = Math.max(0, consensusPicks.length - visibleConsensusPicks.length);
  const blurredPlaceholderCount = Math.max(0, TEASER_BLURRED_COUNT - blurredConsensusPicks.length);
  const showConsensusTeaser = !consensusLoading && !consensusError;

  const recordLine =
    consensus &&
    `Consensus filter: ${consensus.record.wins}W-${consensus.record.losses}L${
      consensus.record.pending > 0 || consensus.record.voids > 0
        ? ` · ${consensus.record.pending} pending · ${consensus.record.voids} void`
        : ''
    }${consensus.record.rate > 0 ? ` (${consensus.record.rate.toFixed(1)}% settled)` : ''}`;

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
            <h2 className="text-lg md:text-xl font-semibold text-[var(--hub-text)]">{bestPicksResearchAlgorithmPanelTitle}</h2>
          ) : null}
          <p
            className={`text-sm text-[var(--hub-text)] leading-relaxed ${showPanelHeading ? 'mt-2' : ''}`}
          >
            Selections are driven by multi-model consensus in an attempt to determine a highly reliable list every day.
          </p>
        </div>

        {configured ? (
          <div className="space-y-2 border-t border-[var(--hub-border-soft)] pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--hub-text)]">Daily consensus</p>
            {consensusError ? (
              <p className="text-sm text-red-300 leading-relaxed" role="alert">
                {consensusError}
              </p>
            ) : null}
            {!consensusError && consensusLoading ? (
              <p className="text-sm text-[var(--hub-text)] leading-relaxed">Loading consensus…</p>
            ) : null}
            {!consensusError && !consensusLoading && sourcesCapLine ? (
              <p className="text-sm text-[var(--hub-text)] tabular-nums leading-snug">{sourcesCapLine}</p>
            ) : null}
            {!consensusError && !consensusLoading && recordLine ? (
              <p className="text-sm text-[var(--hub-text)] leading-snug">{recordLine}</p>
            ) : null}
            {!consensusError && !consensusLoading && !hasConsensusContent ? (
              <p className="text-sm text-[var(--hub-text)] leading-relaxed">
                No consensus picks for <span className="tabular-nums">{dateKey}</span> yet.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className={scrollArea}>
        {!configured && (
          <p className="text-sm text-[var(--hub-text)] leading-relaxed">
            Firebase is not configured — add keys in <code className="text-xs text-[var(--hub-text-soft)]">.env.local</code>.
          </p>
        )}

        {configured && (
          <>
            {showConsensusTeaser ? (
              <div className="space-y-2 pb-1">
                {visibleConsensusPicks.length > 0 ? (
                  <ul className="space-y-2">
                    {visibleConsensusPicks.map((pick) => (
                      <ConsensusPickRow key={`${pick.fixtureID}-${pick.band}`} pick={pick} />
                    ))}
                  </ul>
                ) : null}
                {blurredConsensusPicks.length > 0 || blurredPlaceholderCount > 0 ? (
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
                      {Array.from({ length: blurredPlaceholderCount }).map((_, i) => (
                        <LockedConsensusPlaceholderRow key={`placeholder-${i}`} className="blur-[3px]" />
                      ))}
                    </ul>
                    <div className="absolute inset-x-3 bottom-3">
                      <DownloadAppTeaser hiddenCount={hiddenConsensusCount} label="consensus picks" />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
