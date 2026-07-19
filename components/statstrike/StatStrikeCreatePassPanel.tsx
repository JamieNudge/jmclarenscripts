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
  /** When true, show compact success after claim. */
  autoClaimKey?: string | null;
};

export function StatStrikeCreatePassPanel({ autoClaimKey = null }: Props) {
  const session = useStatStrikePassSession();
  const [amount, setAmount] = useState<StatStrikePassAmountGbp>(3);
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [surveyConsent, setSurveyConsent] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/statstrike/pass/checkout', { cache: 'no-store' });
        const json = (await res.json()) as { configured?: boolean };
        if (!cancelled) setConfigured(Boolean(json.configured));
      } catch {
        if (!cancelled) setConfigured(false);
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
      setClaimStatus('Activating your 24h pass…');
      const result = await session.claim(autoClaimKey);
      if (cancelled) return;
      if (result.ok) {
        setClaimStatus('Pass active — board unlocked for 24 hours.');
        return;
      }
      if (result.retry && attempts < 8) {
        attempts += 1;
        setClaimStatus('Payment received — waiting for pass to activate…');
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
    // Only on mount / claim key change
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
      const json = (await res.json()) as { url?: string; error?: string; configured?: boolean };
      if (!res.ok || !json.url) {
        setError(json.error || 'Checkout unavailable');
        setConfigured(json.configured ?? configured);
        return;
      }
      window.location.href = json.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  }, [amount, email, marketingConsent, surveyConsent, configured]);

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-5 md:p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Create Pass — 24h StatStrike access</h2>
        <p className="mt-2 text-sm text-white/75 leading-relaxed">
          One-time contribution. Every amount includes the same access: full board (Coming Soon blur
          off) plus Your Picks / My Record on this browser for 24 hours.
        </p>
      </div>

      {session.unlocked ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Pass active
          {session.expiresAt ? (
            <>
              {' '}
              until <span className="tabular-nums">{new Date(session.expiresAt).toUTCString()}</span>
            </>
          ) : null}
          .{' '}
          <Link href="/statstrike" className="underline hover:text-white">
            Open board
          </Link>
        </div>
      ) : null}

      {claimStatus ? (
        <p className="text-sm text-amber-200/90" role="status">
          {claimStatus}
        </p>
      ) : null}

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/55 mb-2">Amount</p>
        <div className="flex flex-wrap gap-2">
          {STATSTRIKE_PASS_AMOUNTS_GBP.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setAmount(n)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                amount === n
                  ? 'bg-amber-300 text-black'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              £{n}
            </button>
          ))}
        </div>
      </div>

      <ul className="text-sm text-white/80 space-y-1.5 list-disc list-inside">
        <li>Full StatStrike web board access</li>
        <li>24 hours from purchase</li>
        <li>Helps support future GoalLab development</li>
      </ul>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/55">
          Email (optional for checkout; needed for welcome / survey)
        </span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-amber-300/60"
        />
      </label>

      <div className="space-y-3 text-sm text-white/85">
        <label className="flex gap-3 items-start cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-white/30"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
          <span>
            Email me occasional GoalLab / StatStrike updates. Unsubscribe anytime.
          </span>
        </label>
        <label className="flex gap-3 items-start cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-white/30"
            checked={surveyConsent}
            onChange={(e) => setSurveyConsent(e.target.checked)}
          />
          <span>Email me a short feedback survey when my 24h access ends.</span>
        </label>
        <p className="text-xs text-white/50">
          Both optional and unchecked by default. See{' '}
          <Link href="/privacy/statstrike" className="underline hover:text-white">
            Privacy
          </Link>{' '}
          and{' '}
          <Link href="/terms/statstrike" className="underline hover:text-white">
            Terms
          </Link>
          .
        </p>
      </div>

      {configured === false ? (
        <p className="text-sm text-amber-200/90">
          Checkout is almost ready — Lemon Squeezy products are still being connected. You can still
          use support email below.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="button"
        disabled={busy || configured === false}
        onClick={() => void startCheckout()}
        className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-black hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? 'Starting checkout…' : `Create Pass — £${amount}`}
      </button>
    </section>
  );
}
