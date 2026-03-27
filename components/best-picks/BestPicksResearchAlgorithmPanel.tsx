'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import {
  researchAlgorithmFeedRows,
  statStrikeRtdbPathsFromEnv,
  type ResearchAlgorithmFeedRow,
} from '@/lib/best-picks-firebase';
import { getFirebaseRealtimeDb, isFirebaseClientConfigured } from '@/lib/firebase-client';

export const bestPicksResearchAlgorithmPanelTitle = "Latest Research Algorithm's Selections";

const scrollArea =
  'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable] scroll-smooth overscroll-y-contain';

export function BestPicksResearchAlgorithmPanel({ dateKey }: { dateKey: string }) {
  const [rows, setRows] = useState<ResearchAlgorithmFeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { researchAlgorithmSelectionsPath } = statStrikeRtdbPathsFromEnv(dateKey);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) {
      setLoading(false);
      setError(null);
      setRows([]);
      return;
    }
    const db = getFirebaseRealtimeDb();
    if (!db) {
      setLoading(false);
      return;
    }
    const path = statStrikeRtdbPathsFromEnv(dateKey).researchAlgorithmSelectionsPath;
    const r = ref(db, path);
    setLoading(true);
    return onValue(
      r,
      (snap) => {
        setError(null);
        setLoading(false);
        setRows(researchAlgorithmFeedRows(snap.val()));
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        setRows([]);
      },
    );
  }, [dateKey]);

  const configured = isFirebaseClientConfigured();

  return (
    <div className={`${bestPicksGridTileClassName} justify-start`}>
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2 shrink-0">
        {bestPicksResearchAlgorithmPanelTitle}
      </h2>
      <div className={scrollArea}>
        {!configured && (
          <p className="text-sm text-white/60 leading-relaxed">
            Firebase is not configured — add keys in <code className="text-xs text-white/45">.env.local</code>.
          </p>
        )}
        {configured && error && (
          <p className="text-sm text-red-300/90 leading-relaxed" role="alert">
            {error}
          </p>
        )}
        {configured && !error && loading && (
          <p className="text-sm text-white/60 leading-relaxed">Loading research selections…</p>
        )}
        {configured && !error && !loading && rows.length === 0 && (
          <p className="text-sm text-white/60 leading-relaxed">
            No entries for <span className="tabular-nums text-white/50">{dateKey}</span> yet. Write to{' '}
            <code className="text-xs text-white/45 break-all">{researchAlgorithmSelectionsPath}</code>
            {' — '}e.g. <code className="text-xs text-white/45">groups[].selections[]</code> (All Models
            app), array of strings, pick objects, or <code className="text-xs text-white/45">lines</code>.
          </p>
        )}
        {rows.length > 0 && (
          <ul className="space-y-2 pb-0.5 mt-1">
            {rows.map((row, i) => (
              <li
                key={`${row.primary.slice(0, 80)}-${i}`}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 shrink-0"
              >
                <p className="text-sm font-medium text-white leading-snug">{row.primary}</p>
                {row.secondary ? (
                  <p className="text-xs text-white/55 mt-0.5 leading-snug">{row.secondary}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
