import type { MouseEvent } from 'react';

type BlueskyLinkProps = {
  href: string;
  /** Shown next to the logo, e.g. @statstrikeapp */
  subtitle?: string;
  variant: 'button' | 'pill' | 'inline';
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

const logo = (
  // eslint-disable-next-line @next/next/no-img-element -- static SVG from /public
  <img src="/images/bluesky-logo.svg" alt="" width={20} height={20} className="shrink-0" />
);

/**
 * Bluesky profile link with logo (Stat Strike / other apps that set {@link App.blueskyUrl}).
 */
export function BlueskyLink({ href, subtitle, variant, className = '', onClick }: BlueskyLinkProps) {
  const styles =
    variant === 'button'
      ? 'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white bg-[#1185FE] hover:bg-[#0d6ecd] transition-transform hover:scale-105 shadow-lg'
      : variant === 'pill'
        ? 'inline-flex items-center gap-2 rounded-full bg-[#1185FE]/25 text-[#93c5fd] border border-[#1185FE]/50 px-3 py-1.5 text-xs font-semibold shadow-lg hover:bg-[#1185FE]/35 transition-colors'
        : 'inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-sky-200 underline-offset-2 hover:underline';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles} ${className}`.trim()}
      onClick={onClick}
    >
      {logo}
      <span>Bluesky</span>
      {subtitle ? <span className={variant === 'button' ? 'text-white/90' : 'opacity-90'}>{subtitle}</span> : null}
    </a>
  );
}
