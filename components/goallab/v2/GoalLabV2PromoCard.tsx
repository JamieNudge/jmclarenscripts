import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type GoalLabV2PromoCardLink = {
  href: string;
  label: string;
  external?: boolean;
};

/**
 * Compact portrait promo cell under the GoalLab home hero.
 */
export function GoalLabV2PromoCard({
  iconSrc,
  title,
  badge,
  body,
  links,
  featured = false,
  className = '',
}: {
  iconSrc: string;
  title: string;
  badge: string;
  body: ReactNode;
  links: GoalLabV2PromoCardLink[];
  featured?: boolean;
  className?: string;
}) {
  const linkClass = featured
    ? 'inline-flex text-sm font-semibold text-white underline-offset-2 hover:underline'
    : 'inline-flex text-sm font-semibold text-[var(--gl-accent)] underline-offset-2 hover:underline';

  return (
    <div
      className={
        featured
          ? `flex h-full flex-col gap-3 rounded-xl border border-[var(--gl-accent)] bg-[var(--gl-accent)] p-4 text-white shadow-[var(--gl-shadow)] ${className}`
          : `flex h-full flex-col gap-3 rounded-xl border border-[var(--gl-border)] bg-[var(--gl-surface)] p-4 shadow-[var(--gl-shadow)] ${className}`
      }
    >
      <Image
        src={iconSrc}
        alt=""
        width={40}
        height={40}
        className={
          featured
            ? 'h-10 w-10 shrink-0 rounded-lg object-cover ring-2 ring-white/50'
            : 'h-10 w-10 shrink-0 rounded-lg object-cover'
        }
      />
      <div className="flex min-w-0 flex-1 flex-col space-y-1">
        <div className="space-y-1.5">
          <span
            className={
              featured
                ? 'block text-lg font-bold leading-snug tracking-tight text-white'
                : 'text-sm font-semibold text-[var(--gl-text)]'
            }
          >
            {title}
          </span>
          <span
            className={
              featured
                ? 'inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white'
                : 'block text-[11px] font-medium uppercase tracking-wide text-[var(--gl-text-soft)]'
            }
          >
            {badge}
          </span>
        </div>
        <p
          className={
            featured
              ? 'text-sm leading-relaxed text-white/90'
              : 'text-sm leading-relaxed text-[var(--gl-text-soft)]'
          }
        >
          {body}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {link.label} →
              </a>
            ) : (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label} →
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
