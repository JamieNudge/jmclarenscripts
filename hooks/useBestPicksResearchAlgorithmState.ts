'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import {
  parseDailyConsensusSelections,
  researchAlgorithmFeedRows,
  statStrikeRtdbPathsFromEnv,
  type DailyConsensusFeedParsed,
  type ResearchAlgorithmFeedRow,
} from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

/** Hook result for Latest Research header + scroll body (single Firebase subscription pair). */
export function useBestPicksResearchAlgorithmState(dateKey: string) {
  const [rows, setRows] = useState<ResearchAlgorithmFeedRow[]>([]);
  const [researchLoading, setResearchLoading] = useState(true);
  const [researchError, setResearchError] = useState<string | null>(null);

  const [consensus, setConsensus] = useState<DailyConsensusFeedParsed | null>(null);
  const [consensusLoading, setConsensusLoading] = useState(true);
  const [consensusError, setConsensusError] = useState<string | null>(null);

  const { researchAlgorithmSelectionsPath, dailyConsensusSelectionsPath } = statStrikeRtdbPathsFromEnv(dateKey);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setResearchLoading(false);
      setResearchError(null);
      setRows([]);
      setConsensusLoading(false);
      setConsensusError(null);
      setConsensus(null);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setResearchLoading(false);
      setConsensusLoading(false);
      return;
    }

    setResearchLoading(true);
    const researchRef = ref(db, researchAlgorithmSelectionsPath);
    const unsubResearch = onValue(
      researchRef,
      (snap) => {
        setResearchError(null);
        setResearchLoading(false);
        setRows(researchAlgorithmFeedRows(snap.val(), dateKey));
      },
      (err) => {
        setResearchError(err.message);
        setResearchLoading(false);
        setRows([]);
      },
    );

    setConsensusLoading(true);
    const consensusRef = ref(db, dailyConsensusSelectionsPath);
    const unsubConsensus = onValue(
      consensusRef,
      (snap) => {
        setConsensusError(null);
        setConsensusLoading(false);
        setConsensus(parseDailyConsensusSelections(snap.val()));
      },
      (err) => {
        setConsensusError(err.message);
        setConsensusLoading(false);
        setConsensus(null);
      },
    );

    return () => {
      unsubResearch();
      unsubConsensus();
    };
  }, [dateKey, researchAlgorithmSelectionsPath, dailyConsensusSelectionsPath]);

  const configured = isFirebaseClientConfigured();
  const consensusPicks = consensus?.picks ?? [];
  const hasConsensusContent = consensusPicks.length > 0;
  const hasResearchContent = rows.length > 0;

  const recordLine =
    consensus == null
      ? null
      : `Consensus filter: ${consensus.record.wins}W-${consensus.record.losses}L${
          consensus.record.pending > 0 || consensus.record.voids > 0
            ? ` · ${consensus.record.pending} pending · ${consensus.record.voids} void`
            : ''
        }${consensus.record.rate > 0 ? ` (${consensus.record.rate.toFixed(1)}% settled)` : ''}`;

  const showDivider = hasConsensusContent && hasResearchContent;

  const sourcesCapLine =
    consensus && (consensus.minSources != null || consensus.maxPicksPerDay != null)
      ? [
          consensus.minSources != null ? `≥${consensus.minSources} sources` : null,
          consensus.maxPicksPerDay != null ? `top ${consensus.maxPicksPerDay}/day` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null;

  return {
    rows,
    researchLoading,
    researchError,
    consensus,
    consensusLoading,
    consensusError,
    configured,
    consensusPicks,
    hasConsensusContent,
    hasResearchContent,
    recordLine,
    showDivider,
    sourcesCapLine,
  };
}

export type BestPicksResearchAlgorithmSnapshot = ReturnType<typeof useBestPicksResearchAlgorithmState>;
