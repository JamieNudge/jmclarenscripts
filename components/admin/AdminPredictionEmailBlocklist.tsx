'use client';

import { useCallback, useEffect, useState } from 'react';

type BlockEntry = { email: string; blockedAt: number };

function formatWhen(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ms));
  } catch {
    return String(ms);
  }
}

export function AdminPredictionEmailBlocklist({
  adminKey,
  refreshSignal = 0,
}: {
  adminKey: string;
  /** Increment from parent after a quick-block so this panel refetches. */
  refreshSignal?: number;
}) {
  const [entries, setEntries] = useState<BlockEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [input, setInput] = useState('');

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
      const res = await fetch('/api/admin/prediction-blocklist', {
        headers: { Authorization: `Bearer ${key}` },
      });
      const json = (await res.json()) as { entries?: BlockEntry[]; error?: string };
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
  }, [fetchEntries, refreshSignal]);

  const blockEmail = useCallback(
    async (raw: string) => {
      const key = adminKey.trim();
      const email = raw.trim();
      if (!key || !email) return;
      setStatus(null);
      setError(null);
      setLoading(true);
      try {
        const res = await fetch('/api/admin/prediction-blocklist', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const json = (await res.json()) as { error?: string; email?: string };
        if (!res.ok) {
          setError(json.error || res.statusText);
          return;
        }
        setStatus(`Blocked ${json.email ?? email}. Their submissions are ignored (no save, no email).`);
        setInput('');
        await fetchEntries();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Request failed');
      } finally {
        setLoading(false);
      }
    },
    [adminKey, fetchEntries],
  );

  const unblock = useCallback(
    async (email: string) => {
      const key = adminKey.trim();
      if (!key) return;
      if (!window.confirm(`Remove ${email} from the blocklist?`)) return;
      setStatus(null);
      setError(null);
      setLoading(true);
      try {
        const res = await fetch('/api/admin/prediction-blocklist', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const json = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(json.error || res.statusText);
          return;
        }
        setStatus(`Unblocked ${email}.`);
        await fetchEntries();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Request failed');
      } finally {
        setLoading(false);
      }
    },
    [adminKey, fetchEntries],
  );

  return (
    <section className="rounded-2xl border border-amber-400/20 bg-amber-950/15 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Blocked submitter emails</h2>
          <p className="text-xs text-white/45 mt-1 leading-relaxed">
            Addresses here cannot use the predictions idea form: the API returns success but does{' '}
            <strong className="text-white/55">not</strong> save to Firebase or send you mail. Matching is case-insensitive.
          </p>
        </div>
        <button
          type="button"
          disabled={loading || !adminKey.trim()}
          onClick={() => void fetchEntries()}
          className="rounded-lg bg-amber-700/80 hover:bg-amber-600/90 px-3 py-1.5 text-xs font-medium disabled:opacity-50 shrink-0"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {!adminKey.trim() && (
        <p className="text-sm text-white/45">Paste your admin key in section 1 to manage the blocklist.</p>
      )}

      {error && (
        <p className="text-sm text-red-300/90 rounded-lg border border-red-400/30 bg-red-950/30 px-3 py-2" role="alert">
          {error}
        </p>
      )}

      {status && (
        <p className="text-sm text-amber-100/90 rounded-lg border border-amber-400/25 bg-amber-950/40 px-3 py-2" role="status">
          {status}
        </p>
      )}

      {adminKey.trim() && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            autoComplete="off"
            className="flex-1 rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            placeholder="email@to-block.com"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="button"
            disabled={loading || !input.trim()}
            onClick={() => void blockEmail(input)}
            className="rounded-lg bg-amber-600/90 hover:bg-amber-600 px-4 py-2 text-sm font-medium disabled:opacity-50 shrink-0"
          >
            Block address
          </button>
        </div>
      )}

      {adminKey.trim() && !error && entries.length === 0 && !loading && (
        <p className="text-sm text-white/45">No addresses blocked.</p>
      )}

      <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 -mr-1 [scrollbar-gutter:stable] text-sm">
        {entries.map((e) => (
          <li
            key={e.email}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="font-medium text-white truncate">{e.email}</p>
              <p className="text-[11px] text-white/40 tabular-nums">{formatWhen(e.blockedAt)}</p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => void unblock(e.email)}
              className="rounded-md bg-white/10 hover:bg-white/15 px-2 py-1 text-xs text-amber-100/90 disabled:opacity-50 shrink-0"
            >
              Unblock
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
