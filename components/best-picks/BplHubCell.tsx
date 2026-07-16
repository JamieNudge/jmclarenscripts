'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import { apps } from '@/lib/apps-data';
import type { BplHubPublicPayload, BplCompactFixture } from '@/lib/bpl-hub';
import { useBestPicksLondonDateKey } from '@/hooks/useBestPicksLondonDateKey';
import { FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH } from '@/lib/football-predictions-brand';

function resultPillClass(r: BplCompactFixture['result']): string {
  if (r === 'win') return 'text-black border-amber-300 bg-amber-300';
  if (r === 'loss') return 'text-[var(--hub-danger)] border-[var(--hub-danger-border)] bg-[var(--hub-danger-bg)]';
  if (r === 'void' || r === 'push') return 'text-[var(--hub-heading-accent)] border-[var(--hub-warn-border)] bg-[var(--hub-warn-bg)]';
  if (r === 'dropped' || r === 'pending' || r === null) return 'text-[var(--hub-text-soft)] border-[var(--hub-border-soft)] bg-[var(--hub-chip)]';
  return 'text-[var(--hub-text-soft)] border-[var(--hub-border-soft)] bg-[var(--hub-chip)]';
}

function formatYmdForDisplay(ymd: string): string {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return ymd;
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function resultLabel(r: BplCompactFixture['result']): string {
  if (r === 'win') return 'WIN';
  if (r === 'loss') return 'L';
  if (r === 'void') return 'Void';
  if (r === 'push') return 'Push';
  if (r === 'dropped') return '—';
  if (r === 'pending') return 'Pending';
  return '—';
}

const todayBplFixturesHref = `${FOOTBALL_PREDICTIONS_RESEARCH_SELECTIONS_PATH}#bpl-statstrike-fixtures` as const;
const statStrikeAppStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;
const TEASER_VISIBLE_COUNT = 3;
const TEASER_BLURRED_COUNT = 3;
const IN_PLAY_WINDOW_MS = 12 * 60 * 60 * 1000;

function parseFixtureKickoffMs(kickoff: string | null): number | null {
  if (!kickoff) return null;
  const m = kickoff.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s+UTC$/);
  if (!m) return null;
  return Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4]), Number(m[5]));
}

function fixturePendingLabel(fixture: BplCompactFixture): string {
  if (fixture.result !== 'pending') return resultLabel(fixture.result);
  const kickoffMs = parseFixtureKickoffMs(fixture.kickoff);
  if (kickoffMs == null) return 'Pending';
  const elapsed = Date.now() - kickoffMs;
  if (elapsed >= 0 && elapsed <= IN_PLAY_WINDOW_MS) return 'In-play';
  return 'Pending';
}

function BplFixtureRow({ fixture, className = '' }: { fixture: BplCompactFixture; className?: string }) {
  return (
    <li
      className={`rounded-lg border border-[var(--hub-border)] bg-[var(--hub-panel)] px-3 py-2 flex items-start justify-between gap-2 ${className}`.trim()}
    >
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium text-[var(--hub-text)] leading-snug line-clamp-2">{fixture.title}</p>
        {fixture.league?.trim() || fixture.kickoff?.trim() ? (
          <p className="text-[10px] text-[var(--hub-text-muted)] leading-snug line-clamp-2">
            {[fixture.league, fixture.kickoff]
              .map((x) => (x == null ? '' : x.trim()))
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
        {fixture.forecast ? (
          <p className="text-[10px] text-[var(--hub-info)] font-semibold leading-snug line-clamp-2">{fixture.forecast}</p>
        ) : null}
      </div>
      <div className="shrink-0 flex flex-col items-end gap-0.5">
        <span
          className={
            fixture.odds != null
              ? 'text-xs font-semibold tabular-nums text-[var(--hub-text)]'
              : 'text-[10px] font-medium text-[var(--hub-text-muted)] tabular-nums'
          }
        >
          {fixture.odds != null ? `@${fixture.odds.toFixed(2)}` : '—'}
        </span>
        {fixture.result != null && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${resultPillClass(fixture.result)}`}>
            {fixturePendingLabel(fixture)}
          </span>
        )}
      </div>
    </li>
  );
}

function DownloadAppTeaser({ hiddenCount }: { hiddenCount: number }) {
  return (
    <div className="rounded-xl border border-[var(--hub-border-strong)] bg-[var(--hub-elevated)] px-4 py-3 text-center shadow-md shadow-[var(--hub-shadow)]">
      <p className="text-sm font-semibold text-[var(--hub-text)]">Unlock the full daily list in StatStrike</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--hub-text-muted)]">
        Showing the first {TEASER_VISIBLE_COUNT} best-performing lines
        {hiddenCount > 0 ? ` with ${hiddenCount} more available in the app today.` : '.'}
      </p>
      {statStrikeAppStoreUrl ? (
        <a
          href={statStrikeAppStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center justify-center rounded-lg bg-[var(--hub-cta-bg)] px-3 py-2 text-xs font-semibold text-[var(--hub-cta-text)] transition-opacity hover:opacity-90"
        >
          Download StatStrike on iOS
        </a>
      ) : null}
    </div>
  );
}

/**
 * @param showTodayFixtures - When `false` (hub home tile), all-time stats stay but the in-cell fixture list is
 *   replaced by a CTA to the research page, where the full BPL / StatStrike block lives.
 */
export function BplHubCell({ showTodayFixtures = true }: { showTodayFixtures?: boolean } = {}) {
  const [data, setData] = useState<BplHubPublicPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const londonDateKey = useBestPicksLondonDateKey();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(
          `/api/football-predictions/bpl-payload?${new URLSearchParams({ day: londonDateKey })}`,
          { method: 'GET' },
        );
        if (!res.ok) {
          setErr('Could not load BPL panel.');
          setData(null);
          return;
        }
        const j = (await res.json()) as BplHubPublicPayload;
        if (!cancelled) {
          setData(j);
        }
      } catch {
        if (!cancelled) {
          setErr('Could not load BPL panel.');
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [londonDateKey]);

  const allBplLines =
    data == null
      ? null
      : (data.allTimeBplAllLines ?? {
          wins: data.allTime.wins,
          losses: data.allTime.losses,
          voids: data.allTime.voids,
          settledLineCount: data.settledPickCount,
        });
  const visibleFixtures = data?.current.fixtures.slice(0, TEASER_VISIBLE_COUNT) ?? [];
  const blurredFixtures =
    data?.current.fixtures.slice(TEASER_VISIBLE_COUNT, TEASER_VISIBLE_COUNT + TEASER_BLURRED_COUNT) ?? [];
  const hiddenFixtureCount = Math.max(0, (data?.current.fixtures.length ?? 0) - visibleFixtures.length);

  return (
    <div id="bpl-statstrike" className={`${bestPicksGridTileClassName} gap-3`}>
      <div className="shrink-0 space-y-1.5">
        <h2 className="text-lg md:text-xl font-semibold text-[var(--hub-text)] tracking-tight">
          {statStrikeAppStoreUrl ? (
            <a
              href={statStrikeAppStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--hub-heading-accent)] underline underline-offset-2 hover:text-[var(--hub-accent-link)]"
            >
              StatStrike - Best Performing - As seen in iOS app
            </a>
          ) : (
            'StatStrike - Best Performing - As seen in iOS app'
          )}
        </h2>
        {data?.allTimeDateRange && (
          <p className="text-xs text-[var(--hub-text-soft)] tabular-nums">
            All Time: {formatYmdForDisplay(data.allTimeDateRange.startYyyyMmDd)} –{' '}
            {formatYmdForDisplay(data.allTimeDateRange.endYyyyMmDd)} (London)
          </p>
        )}
        {loading && <p className="text-sm text-[var(--hub-text-soft)]">Loading…</p>}
        {err && (
          <p className="text-sm text-[var(--hub-heading-accent)]" role="alert">
            {err}
          </p>
        )}
        {data?.serverMessage ? (
          <p className="text-xs text-[var(--hub-accent-link)]" role="status">
            {data.serverMessage}
          </p>
        ) : null}
      </div>

      {data && allBplLines && (
        <>
          <div className="shrink-0 rounded-xl border border-amber-200/25 bg-[var(--hub-elevated)] p-3 space-y-2">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--hub-heading-accent)]">
                All time · BPL, every best line (incl. no on-file odds)
              </p>
              <p className="text-sm tabular-nums text-[var(--hub-text-soft)]">
                <span className="text-[var(--hub-success)]">{allBplLines.wins}W</span>
                <span className="text-[var(--hub-text-muted)]"> — </span>
                <span className="text-[var(--hub-danger)]">{allBplLines.losses}L</span>
                {allBplLines.voids > 0 ? (
                  <span className="text-[var(--hub-text-soft)]">
                    {' '}
                    · {allBplLines.voids} void/push
                  </span>
                ) : null}
              </p>
              <p className="text-[10px] text-[var(--hub-text-soft)]">
                {allBplLines.settledLineCount} settled line
                {allBplLines.settledLineCount === 1 ? '' : 's'} in BPL (all) ledger
              </p>
            </div>
            <div className="pt-1 border-t border-[var(--hub-border-soft)]">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--hub-text-soft)]">
                All time · BPL, bookmaker odds on the hub (FT)
              </p>
              {/* W/L, ROI, and settled count hidden pending manual check; API still returns allTime + settledPickCount. */}
            </div>
            {data.allTimeWithPreKoOdds ? (
              <div className="pt-2 mt-2 border-t border-[var(--hub-border-soft)] space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--hub-text-soft)]">
                  All time · pre-KO odds (provable on the row)
                </p>
                <p className="text-sm tabular-nums text-[var(--hub-text-soft)]">
                  <span className="text-[var(--hub-success)]">{data.allTimeWithPreKoOdds.wins}W</span>
                  <span className="text-[var(--hub-text-muted)]"> — </span>
                  <span className="text-[var(--hub-danger)]">{data.allTimeWithPreKoOdds.losses}L</span>
                </p>
                <p className="text-lg font-semibold text-[var(--hub-info)] tabular-nums">
                  ROI{' '}
                  {data.allTimeWithPreKoOdds.roiPercent == null
                    ? '—'
                    : `${data.allTimeWithPreKoOdds.roiPercent >= 0 ? '+' : ''}${data.allTimeWithPreKoOdds.roiPercent.toFixed(1)}%`}
                </p>
              </div>
            ) : null}
          </div>

          {showTodayFixtures ? (
            <div
              id="bpl-statstrike-fixtures"
              className="flex-1 min-h-0 min-w-0 flex flex-col overflow-y-auto [scrollbar-gutter:stable] scroll-mt-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--hub-text-soft)] mb-1">
                Selection day (London){' '}
                <span className="tabular-nums text-[var(--hub-accent-link)]">{data.current.dateKey}</span>
              </p>
              <p className="text-[10px] text-[var(--hub-text-soft)] mb-2">
                {data.current.bestPerformingFixtureCount} best (BPL) line
                {data.current.bestPerformingFixtureCount === 1 ? '' : 's'}
                {data.current.withBookmakerOddsFixtureCount < data.current.bestPerformingFixtureCount
                  ? ` · ${data.current.withBookmakerOddsFixtureCount} with bookmaker odds on the hub`
                  : data.current.withBookmakerOddsFixtureCount > 0
                    ? ' · all lines include bookmaker odds on the hub'
                    : ' · no bookmaker odds on the hub for these lines yet'}
              </p>
              {data.current.fixtures.length === 0 ? (
                <p className="text-sm text-[var(--hub-text-soft)]">No BPL lines for this date (or not uploaded yet).</p>
              ) : (
                <div className="space-y-2 pb-1">
                  <ul className="space-y-2">
                    {visibleFixtures.map((f) => (
                      <BplFixtureRow key={f.id} fixture={f} />
                    ))}
                  </ul>
                  {blurredFixtures.length > 0 ? (
                    <div className="relative pt-1">
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-10 bg-gradient-to-b from-transparent via-black/35 to-black/80" />
                      <ul
                        aria-hidden
                        className="space-y-2 select-none opacity-55 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.95),rgba(0,0,0,0.18))]"
                      >
                        {blurredFixtures.map((f) => (
                          <BplFixtureRow key={`blurred-${f.id}`} fixture={f} className="blur-[3px]" />
                        ))}
                      </ul>
                      <div className="absolute inset-x-3 bottom-3">
                        <DownloadAppTeaser hiddenCount={hiddenFixtureCount} />
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <div className="shrink-0 pt-1">
              <Link
                href={todayBplFixturesHref}
                className="block w-full text-center rounded-xl border border-amber-200/40 bg-[var(--hub-warn-bg)] px-4 py-3 text-sm font-semibold text-[var(--hub-accent-link)] tracking-tight shadow-sm shadow-black/20 transition-colors hover:bg-[var(--hub-warn-bg)] hover:border-amber-200/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
              >
                Click for today&apos;s BPL fixtures preview
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
