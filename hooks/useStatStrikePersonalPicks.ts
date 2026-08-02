'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { StatStrikeBoardRow } from '@/lib/statstrike/models';
import {
  isStatStrikePersonalEnvEnabled,
  listPersonalPicks,
  personalPickKey,
  removePersonalPick,
  upsertPersonalPick,
  type PersonalPickRecord,
} from '@/lib/statstrike/personal-store';
import { decimalOddsForTrackRecord } from '@/lib/statstrike/track-record';
import { useStatStrikePassSession } from '@/hooks/useStatStrikePassSession';

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
    decimalOdds: decimalOddsForTrackRecord(row.prediction),
    selectionDateKey: row.selectionDateKey,
  };
}

/**
 * Personal picks IndexedDB hook.
 * Active when env QA flag is on OR a valid 24h pass session is unlocked.
 */
export function useStatStrikePersonalPicks() {
  const pass = useStatStrikePassSession();
  const enabled = isStatStrikePersonalEnvEnabled() || pass.unlocked;
  const [picks, setPicks] = useState<PersonalPickRecord[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (pass.loading) return;
    void refresh();
  }, [refresh, pass.loading]);

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
    loading: loading || pass.loading,
    error,
    refresh,
    isSaved,
    toggleFromBoardRow,
    savedFixtureIds,
    passUnlocked: pass.unlocked,
    passExpiresAt: pass.expiresAt,
  };
}
