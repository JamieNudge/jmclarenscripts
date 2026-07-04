'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type StatstrikeBetaFeedbackEntry = {
  id: string;
  read?: unknown;
  readAt?: unknown;
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
  submittedAt?: unknown;
  userAgent?: unknown;
};

const TOPIC_LABELS: Record<string, string> = {
  question: 'Question',
  feedback: 'Feedback',
  bug: 'Bug report',
};

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function topicLabel(v: unknown): string {
  const s = str(v);
  return TOPIC_LABELS[s] ?? s;
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

export function AdminStatstrikeBetaFeedbackSubmissions({
  adminKey,
  onBlockedEmail,
}: {
  adminKey: string;
  onBlockedEmail?: () => void;
}) {
  const [entries, setEntries] = useState<StatstrikeBetaFeedbackEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [actingIds, setActingIds] = useState<Set<string>>(() => new Set());
  const [blockingEmail, setBlockingEmail] = useState<string | null>(null);

  const displayEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const ar = Boolean(a.read) ? 1 : 0;
      const br = Boolean(b.read) ? 1 : 0;
      if (ar !== br) return ar - br;
      return (Number(b.submittedAt) || 0) - (Number(a.submittedAt) || 0);
    });
  }, [entries]);

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
      const res = await fetch('/api/admin/statstrike-beta-feedback', {
        headers: { Authorization: `Bearer ${key}` },
      });
      const json = (await res.json()) as { entries?: StatstrikeBetaFeedbackEntry[]; error?: string };
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

  const withActing = useCallback(
    (id: string, fn: () => Promise<void>) => {
      setActingIds((s) => new Set(s).add(id));
      void (async () => {
        try {
          await fn();
          setError(null);
          await fetchEntries();
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Action failed');
        } finally {
          setActingIds((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
        }
      })();
    },
    [fetchEntries],
  );

  const markRead = useCallback(
    (id: string) => {
      const key = adminKey.trim();
      if (!key) return;
      withActing(id, async () => {
        const res = await fetch(`/api/admin/statstrike-beta-feedback/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${key}` },
        });
        const json = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(json.error || res.statusText);
      });
    },
    [adminKey, withActing],
  );

  const removeSubmission = useCallback(
    (id: string) => {
      const key = adminKey.trim();
      if (!key) return;
      if (!window.confirm('Delete this feedback permanently?')) return;
      withActing(id, async () => {
        const res = await fetch(`/api/admin/statstrike-beta-feedback/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${key}` },
        });
        const json = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(json.error || res.statusText);
      });
    },
    [adminKey, withActing],
  );

  const blockSubmitterEmail = useCallback(
    (addr: string) => {
      const key = adminKey.trim();
      const email = addr.trim();
      if (!key || !email) return;
      if (
        !window.confirm(
          `Block ${email}? They can still submit, but nothing is saved and you get no notification (same as honeypot).`,
        )
      ) {
        return;
      }
      setBlockingEmail(email);
      setError(null);
      void (async () => {
        try {
          const res = await fetch('/api/admin/prediction-blocklist', {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const json = (await res.json()) as { error?: string };
          if (!res.ok) throw new Error(json.error || res.statusText);
          onBlockedEmail?.();
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Block failed');
        } finally {
          setBlockingEmail(null);
        }
      })();
    },
    [adminKey, onBlockedEmail],
  );

  const actionButtons = (e: StatstrikeBetaFeedbackEntry, em: string, blockBusy: boolean) => (
    <>
      {!Boolean(e.read) && (
        <button
          type="button"
          disabled={actingIds.has(e.id) || !adminKey.trim() || blockBusy}
          onClick={() => markRead(e.id)}
          className="rounded-md bg-emerald-700/80 hover:bg-emerald-600/90 px-2 py-0.5 text-[10px] font-medium disabled:opacity-50"
        >
          Mark read
        </button>
      )}
      {em ? (
        <button
          type="button"
          disabled={actingIds.has(e.id) || !adminKey.trim() || blockBusy}
          onClick={() => blockSubmitterEmail(em)}
          className="rounded-md bg-amber-800/70 hover:bg-amber-700/80 px-2 py-0.5 text-[10px] font-medium text-amber-100/90 disabled:opacity-50"
        >
          {blockBusy ? 'Blocking…' : 'Block email'}
        </button>
      ) : null}
      <button
        type="button"
        disabled={actingIds.has(e.id) || !adminKey.trim() || blockBusy}
        onClick={() => removeSubmission(e.id)}
        className="rounded-md bg-red-900/50 hover:bg-red-800/60 px-2 py-0.5 text-[10px] font-medium text-red-200/90 disabled:opacity-50"
      >
        Delete
      </button>
    </>
  );

  return (
    <section className="rounded-2xl border border-emerald-400/25 bg-emerald-950/20 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">StatStrike Android beta feedback</h2>
          <p className="text-xs text-white/45 mt-1 leading-relaxed">
            From the GoalLab home page closed-test form. Data loads from{' '}
            <code className="text-emerald-200/80">statstrikeBetaFeedbackSubmissions</code> (server only). Mark read,
            delete, or block the submitter&apos;s email (shared blocklist with prediction ideas).
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
            className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {!adminKey.trim() && (
        <p className="text-sm text-white/45">Paste your admin key in section 1 to load feedback.</p>
      )}

      {error && (
        <p className="text-sm text-red-300/90 rounded-lg border border-red-400/30 bg-red-950/30 px-3 py-2" role="alert">
          {error}
        </p>
      )}

      {adminKey.trim() && !error && entries.length === 0 && !loading && (
        <p className="text-sm text-white/45">No feedback yet.</p>
      )}

      <ul className="space-y-3 max-h-[min(70vh,36rem)] overflow-y-auto pr-1 -mr-1 [scrollbar-gutter:stable]">
        {displayEntries.map((e) => {
          const em = str(e.email);
          const blockBusy = Boolean(em && blockingEmail === em);
          const topic = topicLabel(e.topic);
          const preview = str(e.message);
          return (
            <li key={e.id} className={Boolean(e.read) ? 'opacity-75' : ''}>
              <details className="rounded-xl border border-white/12 bg-black/30 overflow-hidden group">
                <summary className="cursor-pointer list-none px-3 py-2.5 hover:bg-white/5 [&::-webkit-details-marker]:hidden flex flex-col gap-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="text-sm font-medium text-white min-w-0">
                      {str(e.name) || '(No name)'} <span className="text-white/40 font-normal">·</span>{' '}
                      {em ? (
                        <a
                          href={`mailto:${encodeURIComponent(em)}?subject=Re%3A%20StatStrike%20Android%20beta`}
                          className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2 font-normal"
                          onClick={(ev) => ev.stopPropagation()}
                        >
                          {em}
                        </a>
                      ) : (
                        <span className="text-white/45">no email</span>
                      )}
                      {topic ? (
                        <>
                          {' '}
                          <span className="text-white/40 font-normal">·</span>{' '}
                          <span className="text-emerald-200/80 font-normal">{topic}</span>
                        </>
                      ) : null}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0" onClick={(ev) => ev.stopPropagation()}>
                      {Boolean(e.read) && (
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/55">
                          Read
                        </span>
                      )}
                      {actionButtons(e, em, blockBusy)}
                    </div>
                  </div>
                  <span className="text-[11px] text-white/40 tabular-nums">
                    {formatWhen(e.submittedAt)}
                    {Boolean(e.read) && e.readAt != null && <> · read {formatWhen(e.readAt)}</>} · id {e.id.slice(0, 10)}…
                  </span>
                  {preview && <span className="text-xs text-white/55 line-clamp-2">{preview}</span>}
                  <span className="text-[10px] text-emerald-300/70 group-open:hidden">Tap to expand</span>
                </summary>
                <div className="px-3 pb-3 pt-1 border-t border-white/10 text-xs space-y-2 text-white/70">
                  {topic ? (
                    <div>
                      <p className="font-semibold text-white/55 uppercase tracking-wide text-[10px]">Topic</p>
                      <p className="mt-0.5">{topic}</p>
                    </div>
                  ) : null}
                  {preview ? (
                    <div>
                      <p className="font-semibold text-white/55 uppercase tracking-wide text-[10px]">Message</p>
                      <p className="whitespace-pre-wrap break-words mt-0.5">{preview}</p>
                    </div>
                  ) : null}
                  {str(e.userAgent) ? (
                    <div>
                      <p className="font-semibold text-white/55 uppercase tracking-wide text-[10px]">User agent</p>
                      <p className="whitespace-pre-wrap break-words mt-0.5">{str(e.userAgent)}</p>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10 mt-2">
                    {!Boolean(e.read) && (
                      <button
                        type="button"
                        disabled={actingIds.has(e.id) || !adminKey.trim() || blockBusy}
                        onClick={() => markRead(e.id)}
                        className="rounded-lg bg-emerald-700/80 hover:bg-emerald-600/90 px-3 py-1 text-[11px] font-medium disabled:opacity-50"
                      >
                        Mark read
                      </button>
                    )}
                    {em ? (
                      <button
                        type="button"
                        disabled={actingIds.has(e.id) || !adminKey.trim() || blockBusy}
                        onClick={() => blockSubmitterEmail(em)}
                        className="rounded-lg bg-amber-800/70 hover:bg-amber-700/80 px-3 py-1 text-[11px] font-medium text-amber-100/90 disabled:opacity-50"
                      >
                        {blockBusy ? 'Blocking…' : 'Block email'}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={actingIds.has(e.id) || !adminKey.trim() || blockBusy}
                      onClick={() => removeSubmission(e.id)}
                      className="rounded-lg bg-red-900/50 hover:bg-red-800/60 px-3 py-1 text-[11px] font-medium text-red-200/90 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
