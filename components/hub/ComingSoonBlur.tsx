'use client';

import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Short label on the frost overlay, e.g. Coming Soon! */
  badge?: string | null;
  /** Optional CTA under the badge */
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
  /** Min height so empty/loading still looks like a panel */
  minHeightClassName?: string;
  /**
   * Pin the badge to the true geometric centre of the *visible* blur panel.
   * Blurred children are clipped to the panel so they cannot push the centre down.
   * CTA (if any) sits along the bottom edge.
   */
  centerBadge?: boolean;
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
  centerBadge = false,
}: Props) {
  return (
    <div
      className={`relative overflow-hidden ${minHeightClassName} ${className} ${
        centerBadge ? 'h-full min-h-0' : ''
      }`}
    >
      {centerBadge ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 select-none overflow-hidden blur-[6px] opacity-70"
            aria-hidden
          >
            {children}
          </div>
          <div className="absolute inset-0 bg-white/50">
            {badge ? (
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <span className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black tracking-wide text-black shadow-sm">
                  {badge}
                </span>
              </div>
            ) : null}
            {ctaHref && ctaLabel ? (
              <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-3">
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center justify-center rounded-xl bg-[#0b3d5c] px-3 py-2 text-center text-[11px] font-semibold leading-snug text-white shadow-sm hover:opacity-90 sm:text-xs"
                >
                  {ctaLabel}
                </a>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <>
          <div className="pointer-events-none select-none blur-[6px] opacity-70" aria-hidden>
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/45 px-4">
            <div className="flex max-w-sm flex-col items-center gap-3 text-center">
              {badge ? (
                <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black tracking-wide text-black shadow-sm">
                  {badge}
                </span>
              ) : null}
              {ctaHref && ctaLabel ? (
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#0b3d5c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                >
                  {ctaLabel}
                </a>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
