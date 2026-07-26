'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  STATSTRIKE_PASS_AMOUNTS_GBP,
  STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
  type StatStrikePassAmountGbp,
} from '@/lib/statstrike/pass-constants';
import { useStatStrikePassSession } from '@/hooks/useStatStrikePassSession';

type Props = {
  /** Auto-claim after Stripe success redirect. */
  autoClaimKey?: string | null;
  /** Compact mode for success page. */
  variant?: 'full' | 'status';
};

export function StatStrikeCreatePassPanel({ autoClaimKey = null, variant = 'full' }: Props) {
  const session = useStatStrikePassSession();
  const [amount, setAmount] = useState<StatStrikePassAmountGbp>(3);
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [surveyConsent, setSurveyConsent] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [salesEnabled, setSalesEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/statstrike/pass/checkout', { cache: 'no-store' });
        const json = (await res.json()) as { configured?: boolean; salesEnabled?: boolean };
        if (!cancelled) {
          setConfigured(Boolean(json.configured));
          setSalesEnabled(json.salesEnabled === true);
        }
      } catch {
        if (!cancelled) {
          setConfigured(false);
          setSalesEnabled(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!autoClaimKey) return;
    let cancelled = false;
    let attempts = 0;

    const run = async () => {
      setClaimStatus('Confirming your access…');
      const result = await session.claim(autoClaimKey);
      if (cancelled) return;
      if (result.ok) {
        setClaimStatus('Supporter Pass active — full StatStrike access for 24 hours.');
        await session.refresh();
        return;
      }
      if (result.retry && attempts < 10) {
        attempts += 1;
        setClaimStatus('Payment received — confirming access…');
        window.setTimeout(() => {
          void run();
        }, 1500);
        return;
      }
      setClaimStatus(result.error || 'Could not activate pass. Refresh or contact support.');
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoClaimKey]);

  const startCheckout = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/statstrike/pass/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountGbp: amount,
          email: email.trim() || undefined,
          marketingConsent,
          surveyConsent,
          consentTextVersion: STATSTRIKE_PASS_CONSENT_TEXT_VERSION,
        }),
      });
      const json = (await res.json()) as {
        url?: string;
        error?: string;
        configured?: boolean;
        salesEnabled?: boolean;
      };
      if (!res.ok || !json.url) {
        setError(json.error || 'Checkout unavailable');
        setConfigured(json.configured ?? configured);
        if (typeof json.salesEnabled === 'boolean') setSalesEnabled(json.salesEnabled);
        return;
      }
      window.location.href = json.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  }, [amount, email, marketingConsent, surveyConsent, configured]);

  if (variant === 'status') {
    return (
      <div className="space-y-4 text-sm text-[var(--gl-text-soft)]">
        {claimStatus ? (
          <p className="text-[var(--gl-text)]" role="status">
            {claimStatus}
          </p>
        ) : null}
        {session.unlocked ? (
          <div className="rounded-2xl border border-[color-mix(in_srgb,var(--gl-success)_35%,var(--gl-border))] bg-[color-mix(in_srgb,var(--gl-success)_10%,transparent)] px-5 py-4">
            <p className="font-semibold text-[var(--gl-text)]">Thank you for supporting GoalLab</p>
            <p className="mt-1 text-[var(--gl-text-soft)]">
              Your StatStrike Supporter Pass is active
              {session.expiresAt ? (
                <>
                  {' '}
                  until{' '}
                  <span className="tabular-nums font-medium text-[var(--gl-text)]">
                    {new Date(session.expiresAt).toLocaleString()}
                  </span>
                </>
              ) : null}
              .
            </p>
            <Link
              href="/statstrike"
              className="mt-4 inline-flex rounded-xl bg-[var(--gl-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              Open StatStrike
            </Link>
          </div>
        ) : (
          <p>
            If this takes longer than a minute, refresh this page or email support with your receipt.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-5 md:p-6 space-y-5 shadow-[var(--gl-shadow)]">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--gl-text)]">
          Support GoalLab
        </h2>
        <p className="mt-2 text-sm text-[var(--gl-text-soft)] leading-relaxed">
          GoalLab is an independent football analytics project. Choose an amount to support its
          continued development and receive full StatStrike access for 24 hours.
        </p>
      </div>

      <ul className="text-sm text-[var(--gl-text-soft)] space-y-1.5 list-disc list-inside">
        <li>Every available forecast</li>
        <li>Search, filtering, and full browser board</li>
        <li>Your Picks / My Record on this browser</li>
        <li>From £1 · One-time payment · No subscription</li>
      </ul>

      {session.unlocked ? (
        <div className="rounded-xl border border-[color-mix(in_srgb,var(--gl-success)_35%,var(--gl-border))] bg-[color-mix(in_srgb,var(--gl-success)_10%,transparent)] px-4 py-3 text-sm text-[var(--gl-text)]">
          Supporter Pass active
          {session.expiresAt ? (
            <>
              {' '}
              until{' '}
              <span className="tabular-nums font-medium">
                {new Date(session.expiresAt).toLocaleString()}
              </span>
            </>
          ) : null}
          .{' '}
          <Link
            href="/statstrike"
            className="font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
          >
            Open board
          </Link>
        </div>
      ) : null}

      {claimStatus ? (
        <p className="text-sm text-[var(--gl-warn)]" role="status">
          {claimStatus}
        </p>
      ) : null}

      {salesEnabled !== true ? (
        <div
          className="rounded-xl border border-[var(--gl-border)] bg-[var(--gl-elevated)] px-4 py-3 text-sm text-[var(--gl-text-soft)]"
          role="status"
        >
          {salesEnabled === null
            ? 'Checking whether 24-hour Supporter Pass purchases are available…'
            : '24-hour Supporter Pass purchases are temporarily unavailable. App support below still works — email us if you need help with an existing pass.'}
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-text-muted)] mb-2">
              Amount
            </p>
            <div className="flex flex-wrap gap-2">
              {STATSTRIKE_PASS_AMOUNTS_GBP.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAmount(n)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    amount === n
                      ? 'bg-[var(--gl-accent)] text-white shadow-sm'
                      : 'border border-[var(--gl-border)] bg-[var(--gl-elevated)] text-[var(--gl-text)] hover:border-[var(--gl-border-strong)]'
                  }`}
                >
                  £{n}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--gl-text-muted)]">
              Every amount grants the same 24-hour access. Access begins when payment is confirmed.
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--gl-text-muted)]">
              Email (optional at checkout; needed for welcome / survey)
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--gl-border)] bg-[var(--gl-page)] px-3 py-2.5 text-sm text-[var(--gl-text)] placeholder:text-[var(--gl-text-muted)] outline-none focus:border-[var(--gl-accent)]"
            />
          </label>

          <div className="space-y-3 text-sm text-[var(--gl-text-soft)]">
            <label className="flex gap-3 items-start cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-[var(--gl-border-strong)]"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
              />
              <span>
                Email me occasional GoalLab product updates, research findings and future membership
                offers. I can unsubscribe at any time.
              </span>
            </label>
            <label className="flex gap-3 items-start cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-[var(--gl-border-strong)]"
                checked={surveyConsent}
                onChange={(e) => setSurveyConsent(e.target.checked)}
              />
              <span>Email me a short feedback survey when my 24h access ends.</span>
            </label>
            <p className="text-xs text-[var(--gl-text-muted)]">
              Both optional and unchecked by default. Forecasts are analytical outputs, not
              guarantees.{' '}
              <Link
                href="/privacy/statstrike"
                className="font-medium text-[var(--gl-accent)] underline-offset-2 hover:underline"
              >
                Privacy
              </Link>{' '}
              ·{' '}
              <Link
                href="/terms/statstrike"
                className="font-medium text-[var(--gl-accent)] underline-offset-2 hover:underline"
              >
                Terms
              </Link>
            </p>
          </div>

          {configured === false ? (
            <p className="text-sm text-[var(--gl-warn)]">
              Checkout is almost ready — Stripe keys are still being connected on this environment.
            </p>
          ) : null}

          {error ? <p className="text-sm text-[var(--gl-danger)]">{error}</p> : null}

          <button
            type="button"
            disabled={busy || configured === false}
            onClick={() => void startCheckout()}
            className="w-full rounded-xl bg-[var(--gl-accent)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? 'Starting checkout…' : `Get 24-Hour Access — £${amount}`}
          </button>
        </>
      )}
    </section>
  );
}
