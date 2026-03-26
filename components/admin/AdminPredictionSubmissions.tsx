'use client';

import { useCallback, useEffect, useState } from 'react';

export type PredictionSubmissionEntry = {
  id: string;
  name?: unknown;
  email?: unknown;
  ideaDescribe?: unknown;
  dataRelies?: unknown;
  expectedOutput?: unknown;
  frequency?: unknown;
  frequencyOther?: unknown;
  leaguesFilters?: unknown;
  hasApi?: unknown;
  duration?: unknown;
  hopingToLearn?: unknown;
  testedBefore?: unknown;
  testedBeforeDescribe?: unknown;
  anythingElse?: unknown;
  submittedAt?: unknown;
  userAgent?: unknown;
};

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function formatWhen(ms: unknown): string {
  const n = typeof ms === 'number' && Number.isFinite(ms) ? ms : null;
  if (n == null) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(n));
  } catch {
    return String(n);
  }
}

const detailRows: { key: keyof PredictionSubmissionEntry; label: string }[] = [
  { key: 'ideaDescribe', label: 'Idea' },
  { key: 'dataRelies', label: 'Data' },
  { key: 'expectedOutput', label: 'Output' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'frequencyOther', label: 'Frequency (other)' },
  { key: 'leaguesFilters', label: 'Leagues / filters' },
  { key: 'hasApi', label: 'Has API' },
  { key: 'duration', label: 'Duration' },
  { key: 'hopingToLearn', label: 'Hoping to learn' },
  { key: 'testedBefore', label: 'Tested before' },
  { key: 'testedBeforeDescribe', label: 'Tested (detail)' },
  { key: 'anythingElse', label: 'Anything else' },
  { key: 'userAgent', label: 'User agent' },
];

export function AdminPredictionSubmissions({ adminKey }: { adminKey: string }) {
  const [entries, setEntries] = useState<PredictionSubmissionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchEntries = useCallback(async () => {
    const key = adminKey.trim();
    if (!key) {
      setEntries([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/prediction-submissions', {
        headers: { Authorization: `Bearer ${key}` },
      });
      const json = (await res.json()) as { entries?: PredictionSubmissionEntry[]; error?: string };
      if (!res.ok) {
        setError(json.error || res.statusText);
        setEntries([]);
        return;
      }
      setEntries(Array.isArray(json.entries) ? json.entries : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (!autoRefresh || !adminKey.trim()) return;
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      void fetchEntries();
    }, 5000);
    return () => clearInterval(id);
  }, [autoRefresh, adminKey, fetchEntries]);

  return (
    <section className="rounded-2xl border border-violet-400/25 bg-violet-950/20 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Prediction idea submissions</h2>
          <p className="text-xs text-white/45 mt-1 leading-relaxed">
            Same admin key as picks. Data loads from{' '}
            <code className="text-violet-200/80">predictionIdeaSubmissions</code> (server only — not public read).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-white/30"
            />
            Auto-refresh (5s)
          </label>
          <button
            type="button"
            disabled={loading || !adminKey.trim()}
            onClick={() => void fetchEntries()}
            className="rounded-lg bg-violet-600/90 hover:bg-violet-600 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {!adminKey.trim() && (
        <p className="text-sm text-white/45">Paste your admin key in section 1 to load submissions.</p>
      )}

      {error && (
        <p className="text-sm text-red-300/90 rounded-lg border border-red-400/30 bg-red-950/30 px-3 py-2" role="alert">
          {error}
        </p>
      )}

      {adminKey.trim() && !error && entries.length === 0 && !loading && (
        <p className="text-sm text-white/45">No submissions yet.</p>
      )}

      <ul className="space-y-3 max-h-[min(70vh,36rem)] overflow-y-auto pr-1 -mr-1 [scrollbar-gutter:stable]">
        {entries.map((e) => (
          <li key={e.id}>
            <details className="rounded-xl border border-white/12 bg-black/30 overflow-hidden group">
              <summary className="cursor-pointer list-none px-3 py-2.5 hover:bg-white/5 [&::-webkit-details-marker]:hidden flex flex-col gap-1">
                <span className="text-sm font-medium text-white">
                  {str(e.name) || '(No name)'} <span className="text-white/40 font-normal">·</span>{' '}
                  {str(e.email) ? (
                    <a
                      href={`mailto:${encodeURIComponent(str(e.email))}`}
                      className="text-violet-300 hover:text-violet-200 underline underline-offset-2 font-normal"
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      {str(e.email)}
                    </a>
                  ) : (
                    <span className="text-white/45">no email</span>
                  )}
                </span>
                <span className="text-[11px] text-white/40 tabular-nums">
                  {formatWhen(e.submittedAt)} · id {e.id.slice(0, 10)}…
                </span>
                {str(e.ideaDescribe) && (
                  <span className="text-xs text-white/55 line-clamp-2">{str(e.ideaDescribe)}</span>
                )}
                <span className="text-[10px] text-violet-300/70 group-open:hidden">Tap to expand</span>
              </summary>
              <div className="px-3 pb-3 pt-1 border-t border-white/10 text-xs space-y-2 text-white/70">
                {detailRows.map(({ key, label }) => {
                  const v = str(e[key]);
                  if (!v) return null;
                  return (
                    <div key={key}>
                      <p className="font-semibold text-white/55 uppercase tracking-wide text-[10px]">{label}</p>
                      <p className="whitespace-pre-wrap break-words mt-0.5">{v}</p>
                    </div>
                  );
                })}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
