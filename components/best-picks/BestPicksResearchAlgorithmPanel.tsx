'use client';

import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import type { DailyConsensusPickParsed } from '@/lib/best-picks-firebase';
import type { BestPicksResearchAlgorithmSnapshot } from '@/hooks/useBestPicksResearchAlgorithmState';
import { useBestPicksResearchAlgorithmState } from '@/hooks/useBestPicksResearchAlgorithmState';

export const bestPicksResearchAlgorithmPanelTitle = "Latest Research Algorithm's Selections";

/** Full-width band above the picks grid (matches tile chrome). */
const researchHeaderBandClassName =
  'rounded-2xl border border-amber-200/16 bg-white/[0.055] shadow-sm shadow-black/20 px-6 py-5 md:px-8 md:py-6';

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

  const venue = [pick.country?.trim(), pick.league?.trim()].filter(Boolean).join(' · ');
  const metaLine = [venue, pick.kickoff?.trim()].filter(Boolean).join(' · ');

  return (
    <li className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 shrink-0">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3 sm:items-center">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white leading-snug">
            <span className="break-words">{pick.home}</span>
            <span className="text-white/50 font-normal mx-1">v</span>
            <span className="break-words">{pick.away}</span>
          </p>
          {metaLine ? (
            <p className="text-xs text-white/90 mt-1 leading-snug line-clamp-2">{metaLine}</p>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-shrink-0 flex-row flex-wrap items-center gap-1.5 sm:flex-nowrap sm:justify-end">
          <span
            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border ${bandPillClass(pick.band)}`}
          >
            {pick.band.includes('2.5') ? (pick.band.toLowerCase().includes('under') ? 'U2.5' : 'O2.5') : pick.band}
          </span>
          <span className="text-[10px] font-semibold text-purple-200/95 border border-purple-400/25 bg-purple-500/15 px-2 py-0.5 rounded-md whitespace-nowrap">
            {pick.sources} models
          </span>
          {pick.confidence > 0 ? (
            <span className="text-[10px] tabular-nums text-white whitespace-nowrap">
              {Math.round(pick.confidence)}%
            </span>
          ) : null}
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

export function BestPicksResearchAlgorithmHeader({
  dateKey,
  research,
  layout = 'fullWidth',
}: {
  dateKey: string;
  research: BestPicksResearchAlgorithmSnapshot;
  /** `embedded`: no outer band — use inside an existing tile (see BestPicksResearchAlgorithmPanel). */
  layout?: 'fullWidth' | 'embedded';
}) {
  const {
    configured,
    consensusError,
    consensusLoading,
    hasConsensusContent,
    recordLine,
    sourcesCapLine,
  } = research;

  const inner = (
    <div className="space-y-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-white">{bestPicksResearchAlgorithmPanelTitle}</h2>
          <p className="text-sm text-white mt-2 leading-relaxed">
            Selections are driven by multi-model consensus in an attempt to determine a highly reliable list every day.
          </p>
        </div>

        {configured ? (
          <div className="space-y-2 border-t border-white/10 pt-3">
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
            {!consensusError && !consensusLoading && !hasConsensusContent ? (
              <p className="text-sm text-white leading-relaxed">
                No consensus picks for <span className="tabular-nums">{dateKey}</span> yet.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
  );

  if (layout === 'embedded') {
    return <div className="shrink-0">{inner}</div>;
  }

  return <div className={`${researchHeaderBandClassName} shrink-0`}>{inner}</div>;
}

export function BestPicksResearchAlgorithmScrollBody({
  dateKey,
  research,
}: {
  dateKey: string;
  research: BestPicksResearchAlgorithmSnapshot;
}) {
  const {
    configured,
    consensusPicks,
    hasConsensusContent,
    hasResearchContent,
    researchError,
    researchLoading,
    rows,
    showDivider,
  } = research;

  return (
    <div className="flex min-h-0 h-full flex-col justify-start">
      <div className={`${scrollArea} flex-1 min-h-0`}>
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

            {showDivider && <div className="border-t border-white/10 my-3 shrink-0" aria-hidden />}

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
                  {rows.map((row, i) => (
                    <li
                      key={`${row.primary.slice(0, 80)}-${i}`}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 shrink-0"
                    >
                      <p className="text-sm font-medium text-white leading-snug">{row.primary}</p>
                      {row.secondary ? (
                        <p className="text-xs text-white/90 mt-0.5 leading-snug whitespace-pre-line">
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

/** Single-tile composition (header + body) for reuse or legacy layout. */
export function BestPicksResearchAlgorithmPanel({ dateKey }: { dateKey: string }) {
  const research = useBestPicksResearchAlgorithmState(dateKey);
  return (
    <div className={`${bestPicksGridTileClassName} min-h-0 flex flex-col justify-start`}>
      <div className="shrink-0 mb-3">
        <BestPicksResearchAlgorithmHeader dateKey={dateKey} research={research} layout="embedded" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <BestPicksResearchAlgorithmScrollBody dateKey={dateKey} research={research} />
      </div>
    </div>
  );
}
