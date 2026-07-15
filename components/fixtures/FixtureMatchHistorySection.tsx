'use client';

import { useEffect, useMemo, useState } from 'react';
import { FixtureFormComparePanel } from '@/components/fixtures/FixtureFormComparePanel';
import { MatchHistoryTable } from '@/components/fixtures/MatchHistoryTable';
import {
  contextHasMatchHistory,
  defaultH2hFilter,
  defaultTeamFormFilter,
  h2hPickerOptions,
  matchHistorySummary,
  resolveInitialFilter,
  teamFormPickerOptions,
  type H2hFilter,
  type MatchHistoryPickerOption,
  type TeamFormFilter,
} from '@/lib/fixture-match-history';
import type { FixtureContextExport, WebMatchRow } from '@/lib/fixture-key-signals';

function HistoryPicker<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: MatchHistoryPickerOption<T>[];
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      aria-label={ariaLabel}
      className="max-w-[min(100%,220px)] text-xs rounded-md border border-[var(--hub-border)] bg-[var(--hub-inset)] text-[var(--hub-text)] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--hub-border-strong)]"
    >
      {options.map((opt) => (
        <option
          key={opt.id}
          value={opt.id}
          disabled={opt.matches.length === 0}
        >
          {opt.label}
          {opt.matches.length === 0 ? ' (none)' : ''}
        </option>
      ))}
    </select>
  );
}

function MatchHistoryBlock<T extends string>({
  title,
  summary,
  pickerValue,
  pickerOptions,
  onPickerChange,
  pickerAriaLabel,
  matches,
  fixtureHome,
  fixtureAway,
  subjectTeam,
  density = 'default',
}: {
  title: string;
  summary: string | null;
  pickerValue: T;
  pickerOptions: MatchHistoryPickerOption<T>[];
  onPickerChange: (next: T) => void;
  pickerAriaLabel: string;
  matches: WebMatchRow[];
  fixtureHome: string;
  fixtureAway: string;
  subjectTeam?: string;
  density?: 'default' | 'compact';
}) {
  const compact = density === 'compact';

  return (
    <section className="rounded-xl border border-[var(--hub-border-soft)] bg-[var(--hub-chip)] overflow-hidden h-full">
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-b border-[var(--hub-border-soft)] bg-[var(--hub-inset)] ${
          compact ? 'px-3 py-2.5' : 'px-4 py-3 gap-3'
        }`}
      >
        <div className="min-w-0 flex-1">
          <h2 className={`font-semibold uppercase tracking-wide text-[var(--hub-text-soft)] ${compact ? 'text-[11px] leading-snug' : 'text-xs'}`}>
            {title}
          </h2>
          {summary ? (
            <p className={`text-[var(--hub-text-faint)] tabular-nums mt-0.5 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{summary}</p>
          ) : null}
        </div>
        <HistoryPicker
          value={pickerValue}
          options={pickerOptions}
          onChange={onPickerChange}
          ariaLabel={pickerAriaLabel}
        />
      </div>
      <div className={compact ? 'px-3 py-2' : 'px-4 py-3'}>
        <MatchHistoryTable
          matches={matches}
          fixtureHome={fixtureHome}
          fixtureAway={fixtureAway}
          subjectTeam={subjectTeam}
          density={density}
        />
      </div>
    </section>
  );
}

export function FixtureMatchHistorySection({
  context,
  homeTeam,
  awayTeam,
}: {
  context: FixtureContextExport;
  homeTeam: string;
  awayTeam: string;
}) {
  const h2hOptions = useMemo(
    () => h2hPickerOptions(context, homeTeam, awayTeam),
    [context, homeTeam, awayTeam],
  );
  const homeFormOptions = useMemo(
    () => teamFormPickerOptions(context, 'home'),
    [context],
  );
  const awayFormOptions = useMemo(
    () => teamFormPickerOptions(context, 'away'),
    [context],
  );

  const [h2hFilter, setH2hFilter] = useState<H2hFilter>(defaultH2hFilter);
  const [homeFormFilter, setHomeFormFilter] = useState<TeamFormFilter>(() => defaultTeamFormFilter('home'));
  const [awayFormFilter, setAwayFormFilter] = useState<TeamFormFilter>(() => defaultTeamFormFilter('away'));

  useEffect(() => {
    setH2hFilter((current) => resolveInitialFilter(h2hOptions, current));
  }, [h2hOptions]);

  useEffect(() => {
    setHomeFormFilter((current) => resolveInitialFilter(homeFormOptions, current));
  }, [homeFormOptions]);

  useEffect(() => {
    setAwayFormFilter((current) => resolveInitialFilter(awayFormOptions, current));
  }, [awayFormOptions]);

  const h2hMatches = useMemo(
    () => h2hOptions.find((o) => o.id === h2hFilter)?.matches ?? [],
    [h2hFilter, h2hOptions],
  );
  const homeMatches = useMemo(
    () => homeFormOptions.find((o) => o.id === homeFormFilter)?.matches ?? [],
    [homeFormFilter, homeFormOptions],
  );
  const awayMatches = useMemo(
    () => awayFormOptions.find((o) => o.id === awayFormFilter)?.matches ?? [],
    [awayFormFilter, awayFormOptions],
  );

  const homeCompareLabel = useMemo(() => {
    const filterLabel = homeFormOptions.find((o) => o.id === homeFormFilter)?.label ?? 'Home';
    return `${filterLabel} · ${homeMatches.length} game${homeMatches.length === 1 ? '' : 's'}`;
  }, [homeFormFilter, homeFormOptions, homeMatches.length]);

  const awayCompareLabel = useMemo(() => {
    const filterLabel = awayFormOptions.find((o) => o.id === awayFormFilter)?.label ?? 'Away';
    return `${filterLabel} · ${awayMatches.length} game${awayMatches.length === 1 ? '' : 's'}`;
  }, [awayFormFilter, awayFormOptions, awayMatches.length]);

  if (!contextHasMatchHistory(context)) {
    return (
      <p className="text-sm text-[var(--hub-text-muted)] leading-relaxed">
        Match history is not available for this fixture yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--hub-heading-accent)]">Match history</h2>

      <section className="rounded-xl border border-[var(--hub-border-soft)] bg-[var(--hub-chip)] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[var(--hub-border-soft)] bg-[var(--hub-inset)]">
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--hub-text-soft)]">Head to head</h2>
            {matchHistorySummary(h2hMatches) ? (
              <p className="text-[11px] text-[var(--hub-text-faint)] tabular-nums mt-0.5">{matchHistorySummary(h2hMatches)}</p>
            ) : null}
          </div>
          <HistoryPicker
            value={h2hFilter}
            options={h2hOptions}
            onChange={setH2hFilter}
            ariaLabel="Head to head venue filter"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(220px,280px)] md:items-start">
          <div className="px-4 py-3 md:border-r border-[var(--hub-border-soft)] min-w-0">
            <MatchHistoryTable
              matches={h2hMatches}
              fixtureHome={homeTeam}
              fixtureAway={awayTeam}
            />
          </div>
          <div className="p-3 md:p-3 border-t md:border-t-0 border-[var(--hub-border-soft)]">
            <FixtureFormComparePanel
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              homeMatches={homeMatches}
              awayMatches={awayMatches}
              homeSampleLabel={homeCompareLabel}
              awaySampleLabel={awayCompareLabel}
              embedded
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <MatchHistoryBlock
          title={`${homeTeam} results`}
          summary={matchHistorySummary(homeMatches)}
          pickerValue={homeFormFilter}
          pickerOptions={homeFormOptions}
          onPickerChange={setHomeFormFilter}
          pickerAriaLabel={`${homeTeam} form filter`}
          matches={homeMatches}
          fixtureHome={homeTeam}
          fixtureAway={awayTeam}
          subjectTeam={homeTeam}
          density="compact"
        />

        <MatchHistoryBlock
          title={`${awayTeam} results`}
          summary={matchHistorySummary(awayMatches)}
          pickerValue={awayFormFilter}
          pickerOptions={awayFormOptions}
          onPickerChange={setAwayFormFilter}
          pickerAriaLabel={`${awayTeam} form filter`}
          matches={awayMatches}
          fixtureHome={homeTeam}
          fixtureAway={awayTeam}
          subjectTeam={awayTeam}
          density="compact"
        />
      </div>
    </div>
  );
}
