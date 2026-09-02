import Image from 'next/image';
import { goallabAndroidMeta } from '@/lib/goallab-android-beta-meta';

/**
 * Compact GoalLab store promo — App Store live, Android closed test.
 */
export function GoalLabV2StorePromoCard({ className = '' }: { className?: string }) {
  const meta = goallabAndroidMeta;
  const linkClass =
    'inline-flex text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline';
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
            {meta.badge}
          </span>
        </div>
        <p className="text-sm text-[var(--gl-text-soft)] leading-relaxed">{meta.body}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a
            href={meta.closedTestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {meta.closedTestLabel} →
          </a>
          <a
            href={meta.appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {meta.appStoreInstallLabel} →
          </a>
        </div>
      </div>
    </div>
  );
}
