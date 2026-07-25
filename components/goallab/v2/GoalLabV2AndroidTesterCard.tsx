import Image from 'next/image';
import { statstrikeAndroidBetaMeta } from '@/lib/statstrike-android-beta-meta';

/**
 * Compact StatStrike Android closed-test promo — used in the home hero under primary CTAs.
 */
export function GoalLabV2AndroidTesterCard({ className = '' }: { className?: string }) {
  const meta = statstrikeAndroidBetaMeta;
  return (
    <div
      className={`flex gap-3 rounded-xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-4 shadow-[var(--gl-shadow)] ${className}`}
    >
      <Image
        src={meta.iconSrc}
        alt=""
        width={40}
        height={40}
        className="rounded-lg shrink-0 h-10 w-10 object-cover"
      />
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-semibold text-[var(--gl-text)]">{meta.displayName}</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--gl-text-soft)]">
            Android closed test
          </span>
        </div>
        <p className="text-sm text-[var(--gl-text-soft)] leading-relaxed">
          Join the tester group, opt in on Play, then install with the same Google account.
        </p>
        <a
          href={meta.playStoreJoinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline"
        >
          {meta.playStoreJoinLabel} →
        </a>
      </div>
    </div>
  );
}
