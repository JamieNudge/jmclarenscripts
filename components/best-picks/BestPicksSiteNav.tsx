'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { bestPicksSiteNavFooterExtra, bestPicksSiteNavPrimary } from '@/components/best-picks/best-picks-site-nav-links';
import { pathnameToLongFpPath } from '@/lib/hub-football-routes';

function linkActive(pathname: string, href: string, hostname: string): boolean {
  const longPath = pathnameToLongFpPath(pathname, hostname) ?? pathname;
  if (href === '/football-predictions') return longPath === '/football-predictions';
  if (href === '/blog') return longPath === '/blog' || longPath.startsWith('/blog/');
  if (href === '/football-predictions/privacy') return longPath === '/football-predictions/privacy';
  return longPath === href || longPath.startsWith(`${href}/`);
}

const linkClass =
  'text-xs md:text-sm font-medium text-amber-100/95 hover:text-amber-50/95 underline-offset-4 hover:underline rounded-md px-1.5 py-1 -mx-1.5 transition-colors';
const linkActiveClass = 'text-white underline decoration-amber-200/80';

export function BestPicksSiteNav({ variant }: { variant: 'header' | 'footer' }) {
  const pathname = usePathname() ?? '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  /** Header and footer use the same links so Contact + Privacy appear in the top bar everywhere (not only on /blog). */
  const items = [...bestPicksSiteNavPrimary, ...bestPicksSiteNavFooterExtra];

  return (
    <nav
      aria-label={
        variant === 'header' ? 'Football predictions sections' : 'Football predictions and site links'
      }
      className={
        variant === 'header'
          ? 'flex flex-wrap items-center gap-x-2 gap-y-1.5 pb-2'
          : 'flex flex-wrap items-center gap-x-2 gap-y-2 pt-1'
      }
    >
      {items.map(({ href, label }, i) => {
        const active = linkActive(pathname, href, hostname);
        return (
          <span key={href} className="inline-flex items-center gap-x-2">
            {i > 0 ? (
              <span className="text-white/68 select-none text-[10px] tabular-nums" aria-hidden>
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
