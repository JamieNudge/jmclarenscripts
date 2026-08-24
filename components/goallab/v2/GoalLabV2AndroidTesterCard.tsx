import Image from 'next/image';
import { statstrikeAndroidMeta } from '@/lib/statstrike-android-beta-meta';

/**
 * Compact StatStrike store promo — used in the home hero under primary CTAs.
 */
export function GoalLabV2AndroidTesterCard({ className = '' }: { className?: string }) {
  const meta = statstrikeAndroidMeta;
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
            Now on Google Play & App Store
          </span>
        </div>
        <p className="text-sm text-[var(--gl-text-soft)] leading-relaxed">
          StatStrike is live on Google Play and the App Store. Get daily football forecasts, BTTS
          picks, and the public track record on Android or iPhone.
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a
            href={meta.playStoreInstallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {meta.playStoreInstallLabel} →
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
