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
 * Bluesky profile: anchor + `/icons/bluesky.svg` (see app {@link App.blueskyUrl}).
 */
export function BlueskyLink({ href, subtitle, variant, className = '', onClick }: BlueskyLinkProps) {
  const anchorStyles =
    variant === 'button'
      ? 'inline-flex items-center justify-center rounded-full bg-[#1185FE] hover:bg-[#0d6ecd] p-3.5 shadow-lg transition-transform hover:scale-105'
      : variant === 'pill'
        ? 'inline-flex items-center justify-center rounded-full bg-[#1185FE]/25 border border-[#1185FE]/50 p-2 hover:bg-[#1185FE]/35 transition-colors'
        : 'inline-flex items-center justify-center rounded-full p-1.5 hover:bg-white/10 transition-colors';

  const imgClass =
    variant === 'button'
      ? 'h-7 w-7 shrink-0 brightness-0 invert'
      : 'h-6 w-6 shrink-0';

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
        alt="Bluesky"
        width={variant === 'button' ? 28 : 24}
        height={variant === 'button' ? 28 : 24}
        className={imgClass}
      />
    </a>
  );
}
