'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { bestPicksSiteNavFooterExtra, bestPicksSiteNavPrimary } from '@/components/best-picks/best-picks-site-nav-links';

function linkActive(pathname: string, href: string): boolean {
  if (href === '/best-picks') return pathname === '/best-picks';
  if (href === '/blog') return pathname === '/blog' || pathname.startsWith('/blog/');
  return pathname === href || pathname.startsWith(`${href}/`);
}

const linkClass =
  'text-xs md:text-sm font-medium text-amber-100/90 hover:text-amber-50/95 underline-offset-4 hover:underline rounded-md px-1.5 py-1 -mx-1.5 transition-colors';
const linkActiveClass = 'text-white underline decoration-amber-200/80';

export function BestPicksSiteNav({ variant }: { variant: 'header' | 'footer' }) {
  const pathname = usePathname() ?? '';

  const items =
    variant === 'header'
      ? [...bestPicksSiteNavPrimary]
      : [...bestPicksSiteNavPrimary, ...bestPicksSiteNavFooterExtra];

  return (
    <nav
      aria-label={variant === 'header' ? 'Best picks sections' : 'Best picks and site links'}
      className={
        variant === 'header'
          ? 'flex flex-wrap items-center gap-x-2 gap-y-1.5 pb-3 border-b border-amber-200/15'
          : 'flex flex-wrap items-center gap-x-2 gap-y-2 pt-1'
      }
    >
      {items.map(({ href, label }, i) => {
        const active = linkActive(pathname, href);
        return (
          <span key={href} className="inline-flex items-center gap-x-2">
            {i > 0 ? (
              <span className="text-white/25 select-none text-[10px] tabular-nums" aria-hidden>
                ·
              </span>
            ) : null}
            <Link
              href={href}
              className={`${linkClass} ${active ? linkActiveClass : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
