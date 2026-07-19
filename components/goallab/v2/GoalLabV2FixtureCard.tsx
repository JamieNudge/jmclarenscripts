'use client';

import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { useVisitorTimeZone } from '@/hooks/useVisitorTimeZone';
import {
  formatKickoffLocalAndUtc,
  formatKickoffShortLocalAndUtc,
} from '@/lib/best-picks-firebase';
import { fixtureDetailHrefV2 } from '@/components/goallab/v2/paths';
import { fixtureListItemWinResult, pickForecastDetailLines, type FixtureListItem } from '@/lib/fixtures-browser';

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
};

export function GoalLabV2FixtureCard({
  fixture,
  dateKey,
  featured = false,
  interactive = true,
  href: hrefOverride,
}: Props) {
  const visitorTz = useVisitorTimeZone();
  const kickoffShort = formatKickoffShortLocalAndUtc(fixture.kickoffMs, visitorTz);
  const kickoffTitle =
    fixture.kickoffMs != null ? formatKickoffLocalAndUtc(fixture.kickoffMs, visitorTz) : undefined;
  const forecast = pickForecastDetailLines(fixture.pick);
  const won = fixtureListItemWinResult(fixture);
  const href = hrefOverride ?? fixtureDetailHrefV2(fixture.fixtureId, dateKey);

  const shellClass = `flex flex-col rounded-2xl border border-[var(--gl-border-strong)] bg-[var(--gl-elevated)] shadow-[var(--gl-shadow)] ${
    featured ? 'p-5 md:p-6' : 'p-4'
  } ${
    interactive
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
        {won === true ? (
          <span className="inline-flex items-center rounded-full bg-amber-300 px-2.5 py-1 text-[11px] font-black tracking-wide text-black">
            WIN
          </span>
        ) : null}
        {fixture.scoreDisplay !== '–' ? (
          <span className="inline-flex items-center rounded-lg border border-[var(--gl-border-strong)] bg-[var(--gl-surface)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--gl-text)]">
            {fixture.scoreDisplay}
          </span>
        ) : null}
      </div>

      {/* Tip band sits where the old confidence chip/bar was — clearer for visitors. */}
      {forecast.primary ? (
        <p className="mt-4 text-sm font-semibold text-[var(--gl-accent)]">{forecast.primary}</p>
      ) : null}

      {interactive ? (
        <p className="mt-3 text-sm font-medium text-[var(--gl-accent)] group-hover:text-[var(--gl-accent-hover)]">
          View forecast
          <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </p>
      ) : null}
    </>
  );

  if (!interactive) {
    return <article className={shellClass}>{body}</article>;
  }

  return (
    <HubFootballLink href={href} className={shellClass}>
      {body}
    </HubFootballLink>
  );
}
