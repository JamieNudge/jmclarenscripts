import type { MouseEvent } from 'react';

type BlueskyLinkProps = {
  href: string;
  /** Tooltip (e.g. @statstrikeapp); `href` should be the full bsky.app profile URL. */
  subtitle?: string;
  variant: 'button' | 'pill' | 'inline';
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Bluesky profile: icon from `/icons/bluesky.svg` + “Bluesky” label (see {@link App.blueskyUrl}).
 */
export function BlueskyLink({ href, subtitle, variant, className = '', onClick }: BlueskyLinkProps) {
  const anchorStyles =
    variant === 'button'
      ? 'inline-flex items-center gap-2 rounded-full bg-[#1185FE] hover:bg-[#0d6ecd] px-5 py-3 shadow-lg transition-transform hover:scale-105 font-semibold text-white'
      : variant === 'pill'
        ? 'inline-flex items-center gap-2 rounded-full bg-[#1185FE]/25 border border-[#1185FE]/50 px-3 py-2 text-xs font-semibold text-[#93c5fd] hover:bg-[#1185FE]/35 transition-colors'
        : 'inline-flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-white/10 transition-colors text-sm font-medium text-sky-300 hover:text-sky-200';

  const imgClass =
    variant === 'button'
      ? 'h-6 w-6 shrink-0 brightness-0 invert'
      : 'h-5 w-5 sm:h-6 sm:w-6 shrink-0';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${anchorStyles} ${className}`.trim()}
      onClick={onClick}
      title={subtitle}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from /public/icons */}
      <img
        src="/icons/bluesky.svg"
        alt=""
        width={variant === 'button' ? 24 : 20}
        height={variant === 'button' ? 24 : 20}
        className={imgClass}
      />
      <span className={variant === 'button' ? 'text-white' : ''}>Bluesky</span>
    </a>
  );
}
