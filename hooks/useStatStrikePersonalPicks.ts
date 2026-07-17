'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StatStrikeBoardRow } from '@/lib/statstrike/models';
import {
  isStatStrikePersonalEnabled,
  listPersonalPicks,
  personalPickKey,
  removePersonalPick,
  upsertPersonalPick,
  type PersonalPickRecord,
} from '@/lib/statstrike/personal-store';

function rowToPersonalPick(row: StatStrikeBoardRow): Omit<PersonalPickRecord, 'id' | 'savedAt'> {
  const tipBand = row.prediction?.recommendedLevel || row.prediction?.level || 'Over 2.5 Goals';
  return {
    fixtureId: row.fixture.id,
    homeTeam: row.fixture.homeTeam.name,
    awayTeam: row.fixture.awayTeam.name,
    league: row.fixture.league.name,
    country: row.fixture.league.country,
    kickoffMs: row.fixture.kickoffMs,
    tipBand,
    homeScore: row.fixture.homeScore ?? null,
    awayScore: row.fixture.awayScore ?? null,
    isCorrect: null,
    bestPerformingLeague: row.bestPerformingLeague,
    hasGoalBandCascade: row.prediction?.goalBandCascade != null,
    decimalOdds: row.prediction?.bookmakerOdds ?? null,
    selectionDateKey: row.selectionDateKey,
  };
}

/**
 * Personal picks IndexedDB hook. Active only when `NEXT_PUBLIC_STATSTRIKE_PERSONAL_ENABLED=1`.
 * Production UX stays behind PremiumGate until accounts/Stripe.
 */
export function useStatStrikePersonalPicks() {
  const enabled = isStatStrikePersonalEnabled();
  const [picks, setPicks] = useState<PersonalPickRecord[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setPicks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await listPersonalPicks();
      setPicks(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load personal picks');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isSaved = useCallback(
    (selectionDateKey: string, fixtureId: number) =>
      picks.some((p) => p.id === personalPickKey(selectionDateKey, fixtureId)),
    [picks],
  );

  const toggleFromBoardRow = useCallback(
    async (row: StatStrikeBoardRow) => {
      if (!enabled) return;
      const key = personalPickKey(row.selectionDateKey, row.fixture.id);
      const exists = picks.some((p) => p.id === key);
      if (exists) {
        await removePersonalPick(row.selectionDateKey, row.fixture.id);
      } else {
        await upsertPersonalPick(rowToPersonalPick(row));
      }
      await refresh();
    },
    [enabled, picks, refresh],
  );

  const savedFixtureIds = useMemo(() => new Set(picks.map((p) => p.fixtureId)), [picks]);

  return {
    enabled,
    picks,
    loading,
    error,
    refresh,
    isSaved,
    toggleFromBoardRow,
    savedFixtureIds,
  };
}
