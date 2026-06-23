'use client';

import { useEffect, useMemo, useState } from 'react';
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
      className="max-w-[min(100%,220px)] text-xs rounded-md border border-white/20 bg-black/40 text-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-white/30"
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
}) {
  return (
    <section className="rounded-xl border border-white/15 bg-white/[0.06] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-black/20">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-white/90">{title}</h2>
          {summary ? <p className="text-[11px] text-white/55 tabular-nums mt-0.5">{summary}</p> : null}
        </div>
        <HistoryPicker
          value={pickerValue}
          options={pickerOptions}
          onChange={onPickerChange}
          ariaLabel={pickerAriaLabel}
        />
      </div>
      <div className="px-4 py-3">
        <MatchHistoryTable
          matches={matches}
          fixtureHome={fixtureHome}
          fixtureAway={fixtureAway}
          subjectTeam={subjectTeam}
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

  if (!contextHasMatchHistory(context)) {
    return (
      <p className="text-sm text-white/65 leading-relaxed">
        Match history is not available for this fixture yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-100/90">Match history</h2>

      <MatchHistoryBlock
        title="Head to head"
        summary={matchHistorySummary(h2hMatches)}
        pickerValue={h2hFilter}
        pickerOptions={h2hOptions}
        onPickerChange={setH2hFilter}
        pickerAriaLabel="Head to head venue filter"
        matches={h2hMatches}
        fixtureHome={homeTeam}
        fixtureAway={awayTeam}
      />

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
      />
    </div>
  );
}
