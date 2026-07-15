'use client';

import { useState } from 'react';
import { HubFootballLink } from '@/components/hub/HubFootballLink';

const STAGES = [
  {
    title: 'Fixtures',
    body: 'Daily match schedule feeds the pipeline with teams, leagues, and kickoff times.',
  },
  {
    title: 'Historical results',
    body: 'Recent scores and patterns anchor what the models consider credible.',
  },
  {
    title: 'Team strength',
    body: 'Attacking and defensive signals are summarised into comparable team profiles.',
  },
  {
    title: 'Statistical model',
    body: 'Multiple algorithms weight criteria and produce band forecasts with confidence.',
  },
  {
    title: 'Probability forecast',
    body: 'Outputs surface as readable forecasts — then you explore detail on each fixture.',
  },
] as const;

export function GoalLabV2ModelPipeline() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="space-y-6" aria-labelledby="gl-v2-model-heading">
      <div className="max-w-2xl">
        <h2 id="gl-v2-model-heading" className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--gl-text)]">
          How the model works
        </h2>
        <p className="mt-2 text-base text-[var(--gl-text-soft)] leading-relaxed">
          A clear path from fixtures to forecasts — expand a stage for more context.
        </p>
      </div>

      <ol className="grid gap-3 md:grid-cols-5 md:gap-2">
        {STAGES.map((stage, index) => {
          const isOpen = open === index;
          return (
            <li key={stage.title} className="min-w-0">
              <button
                type="button"
                className={`w-full rounded-2xl border text-left transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gl-accent)] ${
                  isOpen
                    ? 'border-[var(--gl-accent)] bg-[var(--gl-accent-soft)]'
                    : 'border-[var(--gl-border)] bg-[var(--gl-surface)] hover:border-[var(--gl-border-strong)]'
                } p-4`}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : index)}
                onMouseEnter={() => {
                  if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                    setOpen(index);
                  }
                }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gl-text-muted)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="mt-2 block text-sm font-semibold text-[var(--gl-text)]">{stage.title}</span>
                <span
                  className={`mt-2 block text-xs leading-relaxed text-[var(--gl-text-soft)] ${
                    isOpen ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden md:opacity-70 md:max-h-none'
                  }`}
                >
                  {stage.body}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="text-sm text-[var(--gl-text-muted)]">
        Full write-up on{' '}
        <HubFootballLink
          href="/football-predictions/methodology"
          className="font-medium text-[var(--gl-accent)] underline-offset-2 hover:underline"
        >
          Methodology
        </HubFootballLink>
        .
      </p>
    </section>
  );
}
