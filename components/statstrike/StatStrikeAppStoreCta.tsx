'use client';

import Image from 'next/image';

const ICON = '/images/stat-strike-icon.png';

type Props = {
  href: string;
  label?: string;
  /** Compact for overlays; default for page-level buttons */
  size?: 'sm' | 'md';
  className?: string;
  /** Text link style (home / fixtures “More in the app”) */
  variant?: 'button' | 'inline';
};

/** StatStrike App Store CTA with app icon. */
export function StatStrikeAppStoreCta({
  href,
  label = 'Get StatStrike on the App Store',
  size = 'md',
  className = '',
  variant = 'button',
}: Props) {
  if (variant === 'inline') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 align-baseline leading-none font-semibold text-[var(--gl-accent,#0b3d5c)] underline-offset-2 hover:underline ${className}`}
      >
        <Image
          src={ICON}
          alt=""
          width={14}
          height={14}
          className="h-3.5 w-3.5 shrink-0 translate-y-[0.1em] rounded-sm object-cover"
        />
        <span className="leading-normal">{label}</span>
      </a>
    );
  }

  const pad = size === 'sm' ? 'px-3 py-2 text-[11px] sm:text-xs' : 'px-4 py-2.5 text-sm';
  const icon = size === 'sm' ? 18 : 22;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-[#0b3d5c] ${pad} text-center font-semibold leading-snug text-white shadow-sm hover:opacity-90 ${className}`}
    >
      <Image
        src={ICON}
        alt=""
        width={icon}
        height={icon}
        className="shrink-0 rounded-md object-cover"
      />
      <span>{label}</span>
    </a>
  );
}
