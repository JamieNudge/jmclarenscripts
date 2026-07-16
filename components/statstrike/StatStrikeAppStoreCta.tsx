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
        className={`inline-flex items-center gap-1.5 font-semibold text-[var(--gl-accent,#0b3d5c)] underline-offset-2 hover:underline ${className}`}
      >
        <Image
          src={ICON}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 rounded-sm object-cover"
        />
        <span>{label}</span>
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
