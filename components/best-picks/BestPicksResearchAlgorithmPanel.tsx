'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import {
  formatBandAsGoalsPhrase,
  parseDailyConsensusSelections,
  parseGoalBandCascadeSelections,
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
const CONSENSUS_TEASER_VISIBLE_COUNT = 3;
const CONSENSUS_TEASER_BLURRED_COUNT = 3;
const CASCADE_TEASER_VISIBLE_COUNT = 1;

function bandPillClass(band: string): string {
  const b = band.toLowerCase();
  if (b.includes('over')) {
    return 'text-[var(--hub-info)] border-[var(--hub-info-border)] bg-[var(--hub-info-bg)]';
  }
  if (b.includes('under')) {
    return 'text-[var(--hub-under)] border-[var(--hub-under-border)] bg-[var(--hub-under-bg)]';
  }
  return 'text-[var(--hub-text-soft)] border-[var(--hub-border)] bg-[var(--hub-chip)]';
}

function outcomeClass(outcome: string): string {
  switch (outcome) {
    case 'win':
      return 'text-black border-amber-300 bg-amber-300';
    case 'loss':
      return 'text-[var(--hub-danger)] border-[var(--hub-danger-border)] bg-[var(--hub-danger-bg)]';
    case 'void':
      return 'text-[var(--hub-heading-accent)] border-[var(--hub-warn-border)] bg-[var(--hub-warn-bg)]';
    default:
      return 'text-[var(--hub-text-soft)] border-[var(--hub-border)] bg-[var(--hub-chip)]';
  }
}

function outcomeLabel(outcome: string): string {
  return outcome === 'win' ? 'WIN' : outcome;
}

function ConsensusPickRow({ pick, className = '' }: { pick: DailyConsensusPickParsed; className?: string }) {
  const score =
    pick.homeScore != null && pick.awayScore != null
      ? `${pick.homeScore}-${pick.awayScore}`
      : null;

  const venueLine = [pick.country?.trim(), pick.league?.trim()].filter(Boolean).join(' · ');
  const kickoffLine = pick.kickoff?.trim() || null;

  return (
    <li className={`rounded-xl border border-[var(--hub-border)] bg-[var(--hub-panel)] px-3 py-2.5 shrink-0 ${className}`.trim()}>
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        <div className="w-full min-w-0">
          <p className="text-sm font-medium text-[var(--hub-text)] leading-relaxed text-pretty">
            {pick.home}
            <span className="text-[var(--hub-text-soft)] font-normal mx-1">v</span>
            {pick.away}
          </p>
          {venueLine ? <p className="text-xs text-[var(--hub-text-muted)] mt-1.5 leading-relaxed text-pretty">{venueLine}</p> : null}
          {kickoffLine ? (
            <p className="text-xs text-[var(--hub-text-muted)] leading-relaxed text-pretty">{kickoffLine}</p>
          ) : null}
        </div>
        <div className="flex w-full min-w-0 flex-row flex-wrap items-center gap-1.5">
          <span
            className={`text-[11px] font-semibold leading-snug normal-case tracking-normal px-2 py-1 rounded-md border ${bandPillClass(pick.band)}`}
          >
            {formatBandAsGoalsPhrase(pick.band)}
          </span>
          <span className="text-[10px] font-semibold text-[var(--hub-models)] border border-[var(--hub-models-border)] bg-[var(--hub-models-bg)] px-2 py-0.5 rounded-md whitespace-nowrap">
            {pick.sources} models
          </span>
          {score ? (
            <span className="text-xs font-bold tabular-nums text-[var(--hub-text)] whitespace-nowrap">{score}</span>
          ) : null}
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border whitespace-nowrap ${outcomeClass(pick.outcome)}`}
          >
            {outcomeLabel(pick.outcome)}
          </span>
        </div>
      </div>
    </li>
  );
}

function LockedConsensusPlaceholderRow({ className = '' }: { className?: string }) {
  return (
    <li className={`rounded-xl border border-[var(--hub-border)] bg-[var(--hub-panel)] px-3 py-2.5 shrink-0 ${className}`.trim()}>
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        <div className="w-full min-w-0 space-y-1.5">
          <div className="h-4 w-3/4 rounded bg-[var(--hub-elevated)]" />
          <div className="h-3 w-2/3 rounded bg-[var(--hub-elevated)]" />
          <div className="h-3 w-1/2 rounded bg-[var(--hub-elevated)]" />
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

function DownloadAppTeaser({
  hiddenCount,
  label,
  visibleCount,
}: {
  hiddenCount: number;
  label: string;
  visibleCount: number;
}) {
  return (
    <div className="rounded-xl border border-[var(--hub-border-strong)] bg-[var(--hub-elevated)] px-4 py-3 text-center shadow-md shadow-[var(--hub-shadow)]">
      <p className="text-sm font-semibold text-[var(--hub-text)]">Unlock the full daily list in GoalLab</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--hub-text-muted)]">
        Showing the first {visibleCount} {label}
        {hiddenCount > 0 ? ` with ${hiddenCount} more available in the app today.` : '.'}
      </p>
      {GOALLAB_APP_STORE_URL ? (
        <a
          href={GOALLAB_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-[var(--hub-cta-bg)] px-3 py-2 text-xs font-semibold text-[var(--hub-cta-text)] transition-opacity hover:opacity-90"
        >
          Download GoalLab on iOS
        </a>
      ) : null}
    </div>
  );
}

function TeaserListBlock({
  visiblePicks,
  blurredPicks,
  placeholderCount,
  hiddenCount,
  label,
  visibleCount,
}: {
  visiblePicks: DailyConsensusPickParsed[];
  blurredPicks: DailyConsensusPickParsed[];
  placeholderCount: number;
  hiddenCount: number;
  label: string;
  visibleCount: number;
}) {
  return (
    <div className="space-y-2 pb-1">
      {visiblePicks.length > 0 ? (
        <ul className="space-y-2">
          {visiblePicks.map((pick) => (
            <ConsensusPickRow key={`${pick.fixtureID}-${pick.band}`} pick={pick} />
          ))}
        </ul>
      ) : null}
      {blurredPicks.length > 0 || placeholderCount > 0 ? (
        <div className="space-y-2 pt-1">
          <DownloadAppTeaser hiddenCount={hiddenCount} label={label} visibleCount={visibleCount} />
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/75" />
            <ul
              aria-hidden
              className="space-y-2 select-none opacity-50 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.55),rgba(0,0,0,0.12))]"
            >
              {blurredPicks.map((pick) => (
                <ConsensusPickRow
                  key={`blurred-${pick.fixtureID}-${pick.band}`}
                  pick={pick}
                  className="blur-[3px]"
                />
              ))}
              {Array.from({ length: placeholderCount }).map((_, i) => (
                <LockedConsensusPlaceholderRow key={`placeholder-${i}`} className="blur-[3px]" />
              ))}
            </ul>
          </div>
        </div>
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

  const [cascade, setCascade] = useState<DailyConsensusFeedParsed | null>(null);
  const [cascadeLoading, setCascadeLoading] = useState(true);
  const [cascadeError, setCascadeError] = useState<string | null>(null);

  const { dailyConsensusSelectionsPath, goalBandCascadeSelectionsPath } = statStrikeRtdbPathsFromEnv(dateKey);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setConsensusLoading(false);
      setConsensusError(null);
      setConsensus(null);
      setCascadeLoading(false);
      setCascadeError(null);
      setCascade(null);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setConsensusLoading(false);
      setCascadeLoading(false);
      return;
    }

    setConsensusLoading(true);
    setCascadeLoading(true);

    const unsubConsensus = onValue(
      ref(db, dailyConsensusSelectionsPath),
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

    const unsubCascade = onValue(
      ref(db, goalBandCascadeSelectionsPath),
      (snap) => {
        setCascadeError(null);
        setCascadeLoading(false);
        setCascade(parseGoalBandCascadeSelections(snap.val(), dateKey));
      },
      (err) => {
        setCascadeError(err.message);
        setCascadeLoading(false);
        setCascade(null);
      },
    );

    return () => {
      unsubConsensus();
      unsubCascade();
    };
  }, [dateKey, dailyConsensusSelectionsPath, goalBandCascadeSelectionsPath]);

  const configured = isFirebaseClientConfigured();
  const consensusPicks = consensus?.picks ?? [];
  const hasConsensusContent = consensusPicks.length > 0;
  const visibleConsensusPicks = consensusPicks.slice(0, CONSENSUS_TEASER_VISIBLE_COUNT);
  const blurredConsensusPicks = consensusPicks.slice(
    CONSENSUS_TEASER_VISIBLE_COUNT,
    CONSENSUS_TEASER_VISIBLE_COUNT + CONSENSUS_TEASER_BLURRED_COUNT,
  );
  const hiddenConsensusCount = Math.max(0, consensusPicks.length - visibleConsensusPicks.length);
  const blurredConsensusPlaceholderCount = Math.max(
    0,
    CONSENSUS_TEASER_BLURRED_COUNT - blurredConsensusPicks.length,
  );
  const showConsensusTeaser = !consensusLoading && !consensusError;

  const cascadePicks = cascade?.picks ?? [];
  const hasCascadeContent = cascadePicks.length > 0;
  const visibleCascadePicks = cascadePicks.slice(0, CASCADE_TEASER_VISIBLE_COUNT);
  const blurredCascadePicks = cascadePicks.slice(CASCADE_TEASER_VISIBLE_COUNT);
  const hiddenCascadeCount = Math.max(0, cascadePicks.length - visibleCascadePicks.length);
  const showCascadeTeaser = !cascadeLoading && !cascadeError;

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

  const cascadeRecordLine =
    cascade &&
    `Cascade record: ${cascade.record.wins}W-${cascade.record.losses}L${
      cascade.record.pending > 0 || cascade.record.voids > 0
        ? ` · ${cascade.record.pending} pending · ${cascade.record.voids} void`
        : ''
    }${cascade.record.rate > 0 ? ` (${cascade.record.rate.toFixed(1)}% settled)` : ''}`;

  return (
    <div className={`${bestPicksGridTileClassName} min-h-0 h-full justify-start`}>
      <div className="shrink-0 mb-3">
        {showPanelHeading ? (
          <h2 className="text-lg md:text-xl font-semibold text-[var(--hub-text)]">{bestPicksResearchAlgorithmPanelTitle}</h2>
        ) : null}
        <p
          className={`text-sm text-[var(--hub-text)] leading-relaxed ${showPanelHeading ? 'mt-2' : ''}`}
        >
          Selections are driven by multi-model consensus in an attempt to determine a highly reliable list every day.
        </p>
      </div>

      <div className={scrollArea}>
        {!configured && (
          <p className="text-sm text-[var(--hub-text)] leading-relaxed">
            Firebase is not configured — add keys in <code className="text-xs text-[var(--hub-text-soft)]">.env.local</code>.
          </p>
        )}

        {configured && (
          <div className="space-y-8">
            <section className="space-y-2" aria-label="Goal Band Cascade">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--hub-text)]">
                Goal Band Cascade
              </p>
              {cascadeError ? (
                <p className="text-sm text-[var(--hub-danger)] leading-relaxed" role="alert">
                  {cascadeError}
                </p>
              ) : null}
              {!cascadeError && cascadeLoading ? (
                <p className="text-sm text-[var(--hub-text)] leading-relaxed">Loading Goal Band Cascade…</p>
              ) : null}
              {!cascadeError && !cascadeLoading && cascadeRecordLine ? (
                <p className="text-sm text-[var(--hub-text)] leading-snug">{cascadeRecordLine}</p>
              ) : null}
              {!cascadeError && !cascadeLoading && !hasCascadeContent ? (
                <p className="text-sm text-[var(--hub-text)] leading-relaxed">
                  No Goal Band Cascade picks for <span className="tabular-nums">{dateKey}</span> yet.
                </p>
              ) : null}
              {showCascadeTeaser && hasCascadeContent ? (
                <TeaserListBlock
                  visiblePicks={visibleCascadePicks}
                  blurredPicks={blurredCascadePicks}
                  placeholderCount={0}
                  hiddenCount={hiddenCascadeCount}
                  label="cascade picks"
                  visibleCount={CASCADE_TEASER_VISIBLE_COUNT}
                />
              ) : null}
            </section>

            <section
              className="space-y-2 border-t border-[var(--hub-border-soft)] pt-4"
              aria-label="Daily consensus"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--hub-text)]">Daily consensus</p>
              {consensusError ? (
                <p className="text-sm text-[var(--hub-danger)] leading-relaxed" role="alert">
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
              {showConsensusTeaser ? (
                <TeaserListBlock
                  visiblePicks={visibleConsensusPicks}
                  blurredPicks={blurredConsensusPicks}
                  placeholderCount={blurredConsensusPlaceholderCount}
                  hiddenCount={hiddenConsensusCount}
                  label="consensus picks"
                  visibleCount={CONSENSUS_TEASER_VISIBLE_COUNT}
                />
              ) : null}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
