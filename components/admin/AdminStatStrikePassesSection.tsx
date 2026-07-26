'use client';

import { useCallback, useEffect, useState } from 'react';

type PassFilter = 'all' | 'email' | 'marketing' | 'survey';

type AdminPassEntry = {
  passId: string;
  amountGbp: number;
  createdAt: string;
  expiresAt: string;
  email?: string | null;
  marketingConsent: boolean;
  surveyConsent: boolean;
  consentAt: string;
  consentTextVersion: string;
  welcomeEmailSentAt?: string | null;
  surveyEmailSentAt?: string | null;
  claimedAt?: string | null;
  piiRedactedAt?: string | null;
};

type SurveyEntry = {
  id: string;
  passId: string;
  message: string;
  createdAt: string;
};

function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-GB');
}

function csvCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function AdminStatStrikePassesSection({ adminKey }: { adminKey: string }) {
  const [filter, setFilter] = useState<PassFilter>('all');
  const [passes, setPasses] = useState<AdminPassEntry[]>([]);
  const [surveys, setSurveys] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const key = adminKey.trim();
    if (!key) {
      setPasses([]);
      setSurveys([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${key}` };
      const [passRes, surveyRes] = await Promise.all([
        fetch(`/api/admin/statstrike-passes?filter=${filter}`, { headers, cache: 'no-store' }),
        fetch('/api/admin/statstrike-pass-surveys', { headers, cache: 'no-store' }),
      ]);
      const passJson = (await passRes.json()) as {
        entries?: AdminPassEntry[];
        error?: string;
      };
      const surveyJson = (await surveyRes.json()) as {
        entries?: SurveyEntry[];
        error?: string;
      };
      if (!passRes.ok) throw new Error(passJson.error || 'Could not load passes');
      if (!surveyRes.ok) throw new Error(surveyJson.error || 'Could not load surveys');
      setPasses(Array.isArray(passJson.entries) ? passJson.entries : []);
      setSurveys(Array.isArray(surveyJson.entries) ? surveyJson.entries : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [adminKey, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (
    pass: AdminPassEntry,
    action: 'withdraw_marketing' | 'redact_pii',
  ) => {
    if (
      action === 'redact_pii' &&
      !window.confirm(
        `Remove the stored email and both consent flags for ${pass.email || pass.passId}? Entitlement records remain.`,
      )
    ) {
      return;
    }
    setActingId(pass.passId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/statstrike-passes/${encodeURIComponent(pass.passId)}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Action failed');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActingId(null);
    }
  };

  const exportMarketingCsv = () => {
    const rows = passes.filter((p) => p.email && p.marketingConsent);
    const csv = [
      ['email', 'consentAt', 'consentTextVersion', 'passId'].map(csvCell).join(','),
      ...rows.map((p) =>
        [p.email, p.consentAt, p.consentTextVersion, p.passId].map(csvCell).join(','),
      ),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `statstrike-marketing-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">StatStrike Supporter Pass contacts</h2>
        <p className="mt-1 text-xs leading-relaxed text-white/50">
          Owner-only pass emails, consent choices, email delivery status and end-of-pass feedback.
          Access tokens are never returned by this API.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as PassFilter)}
          className="rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-xs text-white"
          aria-label="Filter passes"
        >
          <option value="all">All passes</option>
          <option value="email">Has email</option>
          <option value="marketing">Marketing opt-in</option>
          <option value="survey">Survey opt-in</option>
        </select>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || !adminKey.trim()}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        <button
          type="button"
          onClick={exportMarketingCsv}
          disabled={!passes.some((p) => p.email && p.marketingConsent)}
          className="rounded-lg bg-cyan-600/90 px-3 py-2 text-xs font-semibold hover:bg-cyan-600 disabled:opacity-50"
        >
          Export marketing CSV
        </button>
      </div>

      {!adminKey.trim() ? (
        <p className="text-xs text-amber-100/90">Paste your admin key above to load pass data.</p>
      ) : null}
      {error ? <p className="text-sm text-amber-100">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="min-w-[950px] w-full text-left text-xs">
          <thead className="text-white/50">
            <tr className="border-b border-white/15">
              <th className="px-2 py-2">Created / pass</th>
              <th className="px-2 py-2">Amount</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2">Consents</th>
              <th className="px-2 py-2">Expires</th>
              <th className="px-2 py-2">Emails</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {passes.map((pass) => (
              <tr key={pass.passId} className="border-b border-white/10 align-top">
                <td className="px-2 py-3">
                  <div>{formatDate(pass.createdAt)}</div>
                  <code className="text-[10px] text-white/45">{pass.passId}</code>
                </td>
                <td className="px-2 py-3">£{pass.amountGbp}</td>
                <td className="max-w-[15rem] break-all px-2 py-3">
                  {pass.email || (pass.piiRedactedAt ? 'Redacted' : '—')}
                </td>
                <td className="px-2 py-3">
                  <div>Marketing: {pass.marketingConsent ? 'Yes' : 'No'}</div>
                  <div>Survey: {pass.surveyConsent ? 'Yes' : 'No'}</div>
                </td>
                <td className="px-2 py-3">{formatDate(pass.expiresAt)}</td>
                <td className="px-2 py-3">
                  <div>Welcome: {pass.welcomeEmailSentAt ? 'Sent' : '—'}</div>
                  <div>Survey: {pass.surveyEmailSentAt ? 'Sent' : '—'}</div>
                </td>
                <td className="px-2 py-3">
                  <div className="flex flex-col items-start gap-2">
                    <button
                      type="button"
                      disabled={
                        actingId === pass.passId ||
                        !pass.marketingConsent ||
                        Boolean(pass.piiRedactedAt)
                      }
                      onClick={() => void runAction(pass, 'withdraw_marketing')}
                      className="text-cyan-200 underline disabled:opacity-40"
                    >
                      Withdraw marketing
                    </button>
                    <button
                      type="button"
                      disabled={
                        actingId === pass.passId ||
                        !pass.email ||
                        Boolean(pass.piiRedactedAt)
                      }
                      onClick={() => void runAction(pass, 'redact_pii')}
                      className="text-rose-200 underline disabled:opacity-40"
                    >
                      Redact PII
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && passes.length === 0 ? (
          <p className="py-4 text-xs text-white/45">No matching passes.</p>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-white/15 pt-5">
        <h3 className="text-sm font-semibold">End-of-pass survey responses</h3>
        {surveys.length === 0 ? (
          <p className="text-xs text-white/45">No survey responses yet.</p>
        ) : (
          <div className="space-y-3">
            {surveys.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-white/15 bg-white/[0.03] p-4"
              >
                <div className="flex flex-wrap justify-between gap-2 text-[11px] text-white/45">
                  <code>{entry.passId}</code>
                  <time>{formatDate(entry.createdAt)}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-white/85">
                  {entry.message}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
