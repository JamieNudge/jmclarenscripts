'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { StatStrikeCreatePassPanel } from '@/components/statstrike/StatStrikeCreatePassPanel';
import type { StatStrikeWouldBuyAgain } from '@/lib/statstrike/pass-store';

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

const WOULD_BUY_OPTIONS: { value: StatStrikeWouldBuyAgain; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: 'No' },
];

function StatStrikePassSurveyPanel({ passId }: { passId: string }) {
  const [rating, setRating] = useState(0);
  const [wouldBuyAgain, setWouldBuyAgain] = useState<StatStrikeWouldBuyAgain | null>(null);
  const [worked, setWorked] = useState('');
  const [improve, setImprove] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = rating >= 1 && wouldBuyAgain !== null;

  const submit = async () => {
    if (!canSubmit || !wouldBuyAgain) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/statstrike/pass/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passId,
          rating,
          wouldBuyAgain,
          worked: worked.trim() || undefined,
          improve: improve.trim() || undefined,
        }),
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
    <section className="rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-5 md:p-6 space-y-5 shadow-[var(--gl-shadow)]">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--gl-text)]">
          How was your StatStrike pass?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--gl-text-soft)]">
          Two quick choices, then optional notes on what worked and what to improve.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-text-muted)]">
          Overall rating <span className="normal-case text-[var(--gl-danger)]">*</span>
        </legend>
        <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label="Overall rating">
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = rating === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${value} out of 5`}
                onClick={() => setRating(value)}
                className={`h-10 w-10 rounded-xl border text-sm font-semibold transition-colors ${
                  selected
                    ? 'border-[var(--gl-accent)] bg-[var(--gl-accent)] text-white'
                    : 'border-[var(--gl-border)] bg-[var(--gl-page)] text-[var(--gl-text)] hover:border-[var(--gl-accent)]'
                }`}
              >
                {value}
              </button>
            );
          })}
          <span className="ml-1 text-xs text-[var(--gl-text-muted)]">1 = poor · 5 = excellent</span>
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-text-muted)]">
          Would you buy another pass?{' '}
          <span className="normal-case text-[var(--gl-danger)]">*</span>
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Would you buy another pass">
          {WOULD_BUY_OPTIONS.map((opt) => {
            const selected = wouldBuyAgain === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setWouldBuyAgain(opt.value)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  selected
                    ? 'border-[var(--gl-accent)] bg-[var(--gl-accent)] text-white'
                    : 'border-[var(--gl-border)] bg-[var(--gl-page)] text-[var(--gl-text)] hover:border-[var(--gl-accent)]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-text-muted)]">
          What worked well? <span className="normal-case font-normal">(optional)</span>
        </span>
        <textarea
          value={worked}
          onChange={(e) => setWorked(e.target.value)}
          maxLength={2_000}
          rows={3}
          placeholder="What you liked about StatStrike…"
          className="w-full resize-y rounded-xl border border-[var(--gl-border)] bg-[var(--gl-page)] px-3 py-2.5 text-sm text-[var(--gl-text)] placeholder:text-[var(--gl-text-muted)] outline-none focus:border-[var(--gl-accent)]"
        />
        <span className="block text-xs tabular-nums text-[var(--gl-text-muted)]">
          {worked.length}/2,000
        </span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-text-muted)]">
          What would you improve? <span className="normal-case font-normal">(optional)</span>
        </span>
        <textarea
          value={improve}
          onChange={(e) => setImprove(e.target.value)}
          maxLength={2_000}
          rows={3}
          placeholder="What should we change next…"
          className="w-full resize-y rounded-xl border border-[var(--gl-border)] bg-[var(--gl-page)] px-3 py-2.5 text-sm text-[var(--gl-text)] placeholder:text-[var(--gl-text-muted)] outline-none focus:border-[var(--gl-accent)]"
        />
        <span className="block text-xs tabular-nums text-[var(--gl-text-muted)]">
          {improve.length}/2,000
        </span>
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={busy || !canSubmit}
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
