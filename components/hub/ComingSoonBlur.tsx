'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Short label on the frost overlay, e.g. Coming Soon! */
  badge?: string;
  /** Optional CTA under the badge */
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
  /** Min height so empty/loading still looks like a panel */
  minHeightClassName?: string;
};

/**
 * Soft-blur content teaser with a centered badge / optional App Store CTA.
 * Titles and chrome outside this wrapper stay sharp.
 */
export function ComingSoonBlur({
  children,
  badge = 'Coming Soon!',
  ctaHref,
  ctaLabel,
  className = '',
  minHeightClassName = 'min-h-[10rem]',
}: Props) {
  return (
    <div className={`relative overflow-hidden ${minHeightClassName} ${className}`}>
      <div
        className="pointer-events-none select-none blur-[6px] opacity-70"
        aria-hidden
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/45 px-4 backdrop-blur-[1px]">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black tracking-wide text-black shadow-sm">
            {badge}
          </span>
          {ctaHref && ctaLabel ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--gl-accent,#0b3d5c)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
