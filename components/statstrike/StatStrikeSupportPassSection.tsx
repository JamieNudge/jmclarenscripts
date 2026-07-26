'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { StatStrikeCreatePassPanel } from '@/components/statstrike/StatStrikeCreatePassPanel';

export function StatStrikeSupportPassSection() {
  const params = useSearchParams();
  const survey = params.get('survey') === '1';
  const passId = params.get('pass');
  if (survey && passId) {
    return <StatStrikePassSurveyPanel passId={passId} />;
  }
  return <StatStrikeCreatePassPanel />;
}

export function StatStrikePassSuccessSection() {
  const params = useSearchParams();
  const claim = params.get('claim');
  return <StatStrikeCreatePassPanel autoClaimKey={claim} variant="status" />;
}

function StatStrikePassSurveyPanel({ passId }: { passId: string }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/statstrike/pass/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passId, message }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || 'Could not send feedback');
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send feedback');
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <section className="rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-5 md:p-6 shadow-[var(--gl-shadow)]">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--gl-text)]">
          Thank you
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--gl-text-soft)]">
          Your feedback has been received and will help shape StatStrike.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-5 md:p-6 space-y-4 shadow-[var(--gl-shadow)]">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--gl-text)]">
          How was your StatStrike pass?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--gl-text-soft)]">
          A short note on what worked, what did not, or what you would like next is useful.
        </p>
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-text-muted)]">
          Feedback
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2_000}
          rows={6}
          placeholder="Your experience with StatStrike…"
          className="w-full resize-y rounded-xl border border-[var(--gl-border)] bg-[var(--gl-page)] px-3 py-2.5 text-sm text-[var(--gl-text)] placeholder:text-[var(--gl-text-muted)] outline-none focus:border-[var(--gl-accent)]"
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs tabular-nums text-[var(--gl-text-muted)]">
          {message.length}/2,000
        </span>
        <button
          type="button"
          disabled={busy || message.trim().length < 3}
          onClick={() => void submit()}
          className="rounded-xl bg-[var(--gl-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Sending…' : 'Send feedback'}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-[var(--gl-danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-[var(--gl-text-muted)]">
        Feedback is linked to your pass so we can understand the experience. Do not include
        sensitive personal information.
      </p>
    </section>
  );
}
