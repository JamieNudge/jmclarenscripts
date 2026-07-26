'use client';

import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { useVisitorTimeZone } from '@/hooks/useVisitorTimeZone';
import {
  formatKickoffLocalAndUtc,
  formatKickoffShortLocalAndUtc,
} from '@/lib/best-picks-firebase';
import { fixtureDetailHrefV2 } from '@/components/goallab/v2/paths';
import { fixtureListItemWinResult, pickForecastDetailLines, type FixtureListItem } from '@/lib/fixtures-browser';
import { isLiveStatus } from '@/lib/statstrike/parse-selection';
import { isResultFinishedStatus } from '@/lib/statstrike/correctness';

function pickStatus(fixture: FixtureListItem): string | null {
  const raw = fixture.pick.status ?? fixture.pick.displayStatus ?? fixture.pick.fixtureStatus;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

function pickElapsed(fixture: FixtureListItem): number | null {
  const raw = fixture.pick.elapsed;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) return Math.round(raw);
  if (typeof raw === 'string' && raw.trim() !== '' && !Number.isNaN(Number(raw))) {
    return Math.round(Number(raw));
  }
  return null;
}

type Props = {
  fixture: FixtureListItem;
  dateKey: string;
  featured?: boolean;
  /**
   * When false, render a display cell (fixture + band) with no link to detail.
   * Used on /fixtures — the list page is the Forecasts experience.
   */
  interactive?: boolean;
  /** Override detail href (e.g. StatStrike fixture page for board-backed previews). */
  href?: string;
  /**
   * When true, hide the forecast band behind a 24h pass lock chip and never
   * link to detail. Fixture, league and kickoff stay visible.
   */
  locked?: boolean;
};

export function GoalLabV2FixtureCard({
  fixture,
  dateKey,
  featured = false,
  interactive = true,
  href: hrefOverride,
  locked = false,
}: Props) {
  const visitorTz = useVisitorTimeZone();
  const kickoffShort = formatKickoffShortLocalAndUtc(fixture.kickoffMs, visitorTz);
  const kickoffTitle =
    fixture.kickoffMs != null ? formatKickoffLocalAndUtc(fixture.kickoffMs, visitorTz) : undefined;
  const forecast = pickForecastDetailLines(fixture.pick);
  const won = fixtureListItemWinResult(fixture);
  const status = pickStatus(fixture);
  const live = isLiveStatus(status);
  const finished = isResultFinishedStatus(status);
  const elapsed = pickElapsed(fixture);
  const href = hrefOverride ?? fixtureDetailHrefV2(fixture.fixtureId, dateKey);
  const effectiveInteractive = interactive && !locked;

  const shellClass = `flex flex-col rounded-2xl border border-[var(--gl-border-strong)] bg-[var(--gl-elevated)] shadow-[var(--gl-shadow)] ${
    featured ? 'p-5 md:p-6' : 'p-4'
  } ${
    effectiveInteractive
      ? 'group transition-colors outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gl-accent)] hover:border-[var(--gl-accent)]/40'
      : ''
  }`;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--gl-text-soft)] truncate">
          {fixture.leagueKey}
        </p>
        <p
          className="shrink-0 text-xs tabular-nums text-[var(--gl-text-soft)]"
          title={kickoffTitle}
        >
          {kickoffShort}
        </p>
      </div>

      <p
        className={`mt-3 font-semibold tracking-tight text-[var(--gl-text)] leading-snug ${
          featured ? 'text-xl md:text-2xl' : 'text-base'
        }`}
      >
        {fixture.home}
        <span className="mx-2 font-normal text-[var(--gl-text-muted)]">v</span>
        {fixture.away}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {live ? (
          <span
            className="inline-flex items-center rounded-full bg-teal-600 px-2.5 py-1 text-[11px] font-black tracking-wide text-white"
            aria-label={elapsed != null ? `Live ${elapsed} minutes` : 'Live'}
          >
            LIVE{elapsed != null ? ` ${elapsed}'` : ''}
          </span>
        ) : null}
        {finished && won === true ? (
          <span className="inline-flex items-center rounded-full bg-amber-300 px-2.5 py-1 text-[11px] font-black tracking-wide text-black">
            WIN
          </span>
        ) : null}
        {finished && won !== true ? (
          <span className="inline-flex items-center rounded-full bg-[var(--gl-text-muted)]/25 px-2.5 py-1 text-[11px] font-black tracking-wide text-[var(--gl-text)]">
            FT
          </span>
        ) : null}
        {fixture.scoreDisplay !== '–' ? (
          <span className="inline-flex items-center rounded-lg border border-[var(--gl-border-strong)] bg-[var(--gl-surface)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--gl-text)]">
            {fixture.scoreDisplay}
          </span>
        ) : null}
      </div>

      {locked ? (
        <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-[var(--gl-border)] bg-[var(--gl-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--gl-text-muted)]">
          <span aria-hidden>🔒</span> Forecast in 24h pass
        </p>
      ) : forecast.primary ? (
        <p className="mt-4 text-sm font-semibold text-[var(--gl-accent)]">{forecast.primary}</p>
      ) : null}

      {effectiveInteractive ? (
        <p className="mt-3 text-sm font-medium text-[var(--gl-accent)] group-hover:text-[var(--gl-accent-hover)]">
          View forecast
          <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </p>
      ) : null}
    </>
  );

  if (!effectiveInteractive) {
    return <article className={shellClass}>{body}</article>;
  }

  return (
    <HubFootballLink href={href} className={shellClass}>
      {body}
    </HubFootballLink>
  );
}
