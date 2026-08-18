'use client';

import { useState } from 'react';

const labelClass = 'block text-sm font-semibold text-[var(--hub-text-soft)] mb-1.5';
const inputClass =
  'w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 shadow-sm shadow-black/5 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-500';
const textareaClass = `${inputClass} min-h-[100px] resize-y`;

type Topic = 'question' | 'feedback' | 'bug';

type StatStrikeBetaFeedbackFormProps = {
  /** When true, omit the form title (e.g. title lives in a `<summary>`). */
  collapsibleTrigger?: boolean;
};

export function StatStrikeBetaFeedbackForm({ collapsibleTrigger = false }: StatStrikeBetaFeedbackFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<Topic>('feedback');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');
    try {
      const res = await fetch('/api/statstrike-beta-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: honeypot,
          name,
          email,
          topic,
          message,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again or use email.');
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please try again or email directly.');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-[var(--hub-success-border)] bg-[var(--hub-success-bg)] px-4 py-4 text-sm text-[var(--hub-success)] leading-relaxed">
        <p className="font-semibold text-[var(--hub-success)]">Thanks — your message is submitted.</p>
        <p className="mt-2 text-[var(--hub-success)]">I&apos;ll get back to you by email as soon as I can.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm text-[var(--hub-text-soft)] leading-relaxed">
      {!collapsibleTrigger && (
        <h3 className="text-base font-semibold text-[var(--hub-text-soft)]">Questions or feedback</h3>
      )}
      {collapsibleTrigger && (
        <p className="text-[var(--hub-text-soft)] -mt-1">
          Ask a question, share feedback, or report a bug from the Android app.
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="ss-beta-name" className={labelClass}>
            Name
          </label>
          <input
            id="ss-beta-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="ss-beta-email" className={labelClass}>
            Email
          </label>
          <input
            id="ss-beta-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className={labelClass}>Topic</legend>
        {(
          [
            ['question', 'Question'],
            ['feedback', 'Feedback'],
            ['bug', 'Bug report'],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="topic"
              value={value}
              checked={topic === value}
              onChange={() => setTopic(value)}
              className="border-[var(--hub-border-strong)] text-sky-500 focus:ring-sky-400/50"
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      <div>
        <label htmlFor="ss-beta-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="ss-beta-message"
          name="message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={textareaClass}
          rows={4}
        />
      </div>

      <div className="sr-only" aria-hidden>
        <label htmlFor="ss-beta-website">Website</label>
        <input
          id="ss-beta-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-[var(--hub-danger)]" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full sm:w-auto rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:pointer-events-none text-[var(--hub-text)] font-semibold text-sm px-6 py-3 transition-colors"
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit'}
      </button>

      <p className="text-xs text-[var(--hub-text-soft)]">
        Prefer email?{' '}
        <a
          href="mailto:jmclarenscripts@gmail.com?subject=StatStrike%20Android%20beta"
          className="text-[var(--hub-info)] hover:opacity-90 underline underline-offset-2"
        >
          jmclarenscripts@gmail.com
        </a>
      </p>
    </form>
  );
}
