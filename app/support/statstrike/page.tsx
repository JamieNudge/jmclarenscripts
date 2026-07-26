import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GoalLabV2SubpageShell } from '@/components/goallab/v2/GoalLabV2SubpageShell';
import { StatStrikeSupportPassSection } from '@/components/statstrike/StatStrikeSupportPassSection';

export const metadata: Metadata = {
  title: 'StatStrike — Support & 24h Pass',
  description:
    'Create a StatStrike 24-hour web pass (£1–£10), or get help with the StatStrike iOS and Android apps.',
};

export default function StatStrikeSupportPage() {
  return (
    <GoalLabV2SubpageShell
      title="Support The GoalLab"
      titleClassName="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--gl-text)]"
      description={
        <>
          StatStrike web · 24-hour pass · {new Date().getFullYear()}
        </>
      }
      descriptionClassName="text-lg md:text-xl leading-relaxed text-[var(--gl-text)]"
      contentClassName="gl-v2-hub-bridge space-y-6 text-base md:text-lg leading-relaxed text-[var(--gl-text)]"
    >
      <Suspense
        fallback={
          <div className="rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-5 text-base text-[var(--gl-text)] shadow-[var(--gl-shadow)]">
            Loading pass options…
          </div>
        }
      >
        <StatStrikeSupportPassSection />
      </Suspense>

      <section className="space-y-4 pt-4 border-t border-[var(--gl-border)]">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--gl-text)]">
          App support (iOS &amp; Android)
        </h2>
        <p className="text-[var(--gl-text)] leading-relaxed">
          If you&apos;re having trouble with the native apps — predictions, subscriptions, ads, or
          crashes — email with device model, OS version, what you expected, and what happened:
        </p>
        <p className="text-[var(--gl-text)]">
          <span className="font-semibold">Email:</span>{' '}
          <a
            href="mailto:jmclarenscripts@gmail.com?subject=StatStrike%20Support"
            className="font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
          >
            jmclarenscripts@gmail.com
          </a>
        </p>
        <p className="text-base text-[var(--gl-text-soft)] leading-relaxed">
          Web pass questions (checkout, unlock, consents) can use the same address with subject
          “StatStrike Web Pass”.
        </p>
      </section>
    </GoalLabV2SubpageShell>
  );
}
