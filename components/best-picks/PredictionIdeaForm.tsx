'use client';

import { useState } from 'react';

const hr = 'border-0 border-t border-white/15 my-5';

const labelClass = 'block text-sm font-semibold text-white/90 mb-1.5';
const hintClass = 'text-xs text-white/45 mb-2';
const inputClass =
  'w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/30';
const textareaClass = `${inputClass} min-h-[100px] resize-y`;

export function PredictionIdeaForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ideaDescribe, setIdeaDescribe] = useState('');
  const [dataRelies, setDataRelies] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'matchByMatch' | 'other'>('daily');
  const [frequencyOther, setFrequencyOther] = useState('');
  const [leaguesFilters, setLeaguesFilters] = useState('');
  const [hasApi, setHasApi] = useState<'yes' | 'no' | 'unsure'>('unsure');
  const [duration, setDuration] = useState<'short' | 'standard' | 'longer'>('standard');
  const [hopingToLearn, setHopingToLearn] = useState('');
  const [testedBefore, setTestedBefore] = useState<'no' | 'informal' | 'yes'>('no');
  const [testedBeforeDescribe, setTestedBeforeDescribe] = useState('');
  const [anythingElse, setAnythingElse] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');
    try {
      const res = await fetch('/api/prediction-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: honeypot,
          name,
          email,
          ideaDescribe,
          dataRelies,
          expectedOutput,
          frequency,
          frequencyOther: frequency === 'other' ? frequencyOther : '',
          leaguesFilters,
          hasApi,
          duration,
          hopingToLearn,
          testedBefore,
          testedBeforeDescribe: testedBefore === 'yes' ? testedBeforeDescribe : '',
          anythingElse,
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
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100/95 leading-relaxed">
        <p className="font-semibold text-emerald-200">Thanks — your idea is submitted.</p>
        <p className="mt-2 text-emerald-100/85">
          I&apos;ll review it and get back to you with next steps and pricing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm text-white/75 leading-relaxed">
      <h3 className="text-base font-semibold text-white/95">Submit Your Idea</h3>
      <p>
        Please provide a clear outline of your approach. The more specific you are, the faster I can assess
        whether it&apos;s suitable for testing.
      </p>

      <hr className={hr} />

      <div>
        <p className="text-sm font-semibold text-white/90 mb-3">Your details</p>
        <div className="space-y-4">
          <div>
            <label htmlFor="pi-name" className={labelClass}>
              Name
            </label>
            <input
              id="pi-name"
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
            <label htmlFor="pi-email" className={labelClass}>
              Email
            </label>
            <input
              id="pi-email"
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
      </div>

      <hr className={hr} />

      <div>
        <p className="text-sm font-semibold text-white/90 mb-3">Your idea</p>
        <div className="space-y-5">
          <div>
            <label htmlFor="pi-idea" className={labelClass}>
              1. Describe your prediction idea
            </label>
            <p className={hintClass}>(What factors determine your prediction? Be as specific as possible.)</p>
            <textarea
              id="pi-idea"
              name="ideaDescribe"
              required
              value={ideaDescribe}
              onChange={(e) => setIdeaDescribe(e.target.value)}
              className={textareaClass}
              rows={5}
            />
          </div>

          <hr className={hr} />

          <div>
            <label htmlFor="pi-data" className={labelClass}>
              2. What data does your idea rely on?
            </label>
            <p className={hintClass}>(e.g. form, odds, player stats, historical results, etc.)</p>
            <input
              id="pi-data"
              name="dataRelies"
              type="text"
              value={dataRelies}
              onChange={(e) => setDataRelies(e.target.value)}
              className={inputClass}
            />
          </div>

          <hr className={hr} />

          <div>
            <label htmlFor="pi-output" className={labelClass}>
              3. What is the expected output?
            </label>
            <p className={hintClass}>(e.g. match winner, over/under, both teams to score, etc.)</p>
            <input
              id="pi-output"
              name="expectedOutput"
              type="text"
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              className={inputClass}
            />
          </div>

          <hr className={hr} />

          <fieldset className="space-y-2">
            <legend className={labelClass}>4. How often should predictions be generated?</legend>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value="daily"
                checked={frequency === 'daily'}
                onChange={() => setFrequency('daily')}
                className="border-white/30 text-sky-500 focus:ring-sky-400/50"
              />
              <span>Daily</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value="matchByMatch"
                checked={frequency === 'matchByMatch'}
                onChange={() => setFrequency('matchByMatch')}
                className="border-white/30 text-sky-500 focus:ring-sky-400/50"
              />
              <span>Match-by-match</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="frequency"
                value="other"
                checked={frequency === 'other'}
                onChange={() => setFrequency('other')}
                className="border-white/30 text-sky-500 focus:ring-sky-400/50"
              />
              <span>Other:</span>
              <input
                type="text"
                name="frequencyOther"
                value={frequencyOther}
                onChange={(e) => setFrequencyOther(e.target.value)}
                disabled={frequency !== 'other'}
                className={`${inputClass} flex-1 max-w-xs disabled:opacity-40`}
                placeholder="describe"
              />
            </label>
          </fieldset>

          <hr className={hr} />

          <div>
            <label htmlFor="pi-leagues" className={labelClass}>
              5. Any specific leagues, competitions, or filters?
            </label>
            <input
              id="pi-leagues"
              name="leaguesFilters"
              type="text"
              value={leaguesFilters}
              onChange={(e) => setLeaguesFilters(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <hr className={hr} />

      <div>
        <p className="text-sm font-semibold text-white/90 mb-3">Practical details</p>
        <fieldset className="space-y-2 mb-5">
          <legend className={labelClass}>6. Do you already have an API for match data?</legend>
          {(
            [
              ['yes', 'Yes'],
              ['no', 'No'],
              ['unsure', 'Not sure'],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasApi"
                value={value}
                checked={hasApi === value}
                onChange={() => setHasApi(value)}
                className="border-white/30 text-sky-500 focus:ring-sky-400/50"
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className={labelClass}>7. Preferred research duration</legend>
          {(
            [
              ['short', 'Short test (e.g. 1–2 weeks)'],
              ['standard', 'Standard test (e.g. 3–4 weeks)'],
              ['longer', 'Longer evaluation'],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="duration"
                value={value}
                checked={duration === value}
                onChange={() => setDuration(value)}
                className="border-white/30 text-sky-500 focus:ring-sky-400/50"
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <hr className={hr} />

      <div>
        <p className="text-sm font-semibold text-white/90 mb-3">Expectations</p>
        <div className="space-y-5">
          <div>
            <label htmlFor="pi-learn" className={labelClass}>
              8. What are you hoping to learn from this test?
            </label>
            <textarea
              id="pi-learn"
              name="hopingToLearn"
              value={hopingToLearn}
              onChange={(e) => setHopingToLearn(e.target.value)}
              className={textareaClass}
              rows={4}
            />
          </div>

          <hr className={hr} />

          <fieldset className="space-y-2">
            <legend className={labelClass}>9. Have you tested this idea before?</legend>
            {(
              [
                ['no', 'No'],
                ['informal', 'Informally'],
                ['yes', 'Yes (please describe briefly)'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="testedBefore"
                  value={value}
                  checked={testedBefore === value}
                  onChange={() => setTestedBefore(value)}
                  className="border-white/30 text-sky-500 focus:ring-sky-400/50"
                />
                <span>{label}</span>
              </label>
            ))}
            {testedBefore === 'yes' && (
              <input
                type="text"
                name="testedBeforeDescribe"
                value={testedBeforeDescribe}
                onChange={(e) => setTestedBeforeDescribe(e.target.value)}
                className={`${inputClass} mt-2`}
                placeholder="Brief description"
              />
            )}
          </fieldset>
        </div>
      </div>

      <hr className={hr} />

      <div>
        <p className="text-sm font-semibold text-white/90 mb-3">Final step</p>
        <div>
          <label htmlFor="pi-extra" className={labelClass}>
            Anything else to add?
          </label>
          <p className={hintClass}>Optional</p>
          <textarea
            id="pi-extra"
            name="anythingElse"
            value={anythingElse}
            onChange={(e) => setAnythingElse(e.target.value)}
            className={textareaClass}
            rows={3}
          />
        </div>
      </div>

      {/* Honeypot — visually hidden */}
      <div className="sr-only" aria-hidden>
        <label htmlFor="pi-website">Website</label>
        <input
          id="pi-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-300/90" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full sm:w-auto rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm px-6 py-3 transition-colors"
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit'}
      </button>

      <hr className={hr} />

      <p className="text-xs text-white/50 italic leading-relaxed">
        I will review your submission and confirm whether your idea is suitable for implementation, along with
        next steps and pricing.
      </p>

      <p className="text-xs text-white/45">
        Prefer email?{' '}
        <a
          href="mailto:jmclarenscripts@gmail.com?subject=Prediction%20model%20idea"
          className="text-sky-300 hover:text-sky-200 underline underline-offset-2"
        >
          jmclarenscripts@gmail.com
        </a>
      </p>
    </form>
  );
}
