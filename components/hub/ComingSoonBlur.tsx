'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { StatStrikeAppStoreCta } from '@/components/statstrike/StatStrikeAppStoreCta';

type Props = {
  children: ReactNode;
  /** Short label on the frost overlay, e.g. Coming Soon! — omit/null to hide */
  badge?: string | null;
  /** Optional CTA under the badge */
  ctaHref?: string;
  ctaLabel?: string;
  /** When true, CTA uses StatStrike icon + App Store styling */
  ctaStatStrike?: boolean;
  /**
   * Same-origin navigation (no new tab). Use for Create Pass and other in-site links.
   */
  ctaInternal?: boolean;
  className?: string;
  /** Min height so empty/loading still looks like a panel */
  minHeightClassName?: string;
  /**
   * Pin overlays to the visible panel; blurred children are clipped.
   */
  centerBadge?: boolean;
  /**
   * Where to place the CTA in centerBadge mode.
   * `center` sits higher in the blur; `bottom` pins to the lower edge.
   */
  ctaPlacement?: 'center' | 'bottom';
};

/**
 * Soft-blur content teaser with optional badge / App Store CTA.
 * Titles and chrome outside this wrapper stay sharp.
 */
export function ComingSoonBlur({
  children,
  badge = 'Coming Soon!',
  ctaHref,
  ctaLabel,
  ctaStatStrike = false,
  ctaInternal = false,
  className = '',
  minHeightClassName = 'min-h-[10rem]',
  centerBadge = false,
  ctaPlacement = 'bottom',
}: Props) {
  const buttonClass =
    'inline-flex max-w-full items-center justify-center rounded-xl bg-[#0b3d5c] px-3 py-2 text-center text-[11px] font-semibold leading-snug text-white shadow-sm hover:opacity-90 sm:text-xs sm:px-4 sm:py-2.5';

  const cta =
    ctaHref && ctaLabel ? (
      ctaStatStrike && !ctaInternal ? (
        <StatStrikeAppStoreCta href={ctaHref} label={ctaLabel} size="sm" />
      ) : ctaInternal ? (
        <Link href={ctaHref} className={buttonClass}>
          {ctaLabel}
        </Link>
      ) : (
        <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          {ctaLabel}
        </a>
      )
    ) : null;

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
            {badge || (cta && ctaPlacement === 'center') ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4">
                {badge ? (
                  <span className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black tracking-wide text-black shadow-sm">
                    {badge}
                  </span>
                ) : null}
                {ctaPlacement === 'center' ? cta : null}
              </div>
            ) : null}
            {cta && ctaPlacement === 'bottom' ? (
              <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-3">{cta}</div>
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
              {cta}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
