'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGoalLabHubNav } from '@/components/hub/HubNavContext';
import HubAppearanceToggle from '@/components/hub/HubAppearanceToggle';
import { bestPicksSiteNavFooterExtra, bestPicksSiteNavPrimary } from '@/components/best-picks/best-picks-site-nav-links';
import { hubPublicHref, pathnameToLongFpPath } from '@/lib/hub-football-routes';
import { hubNavLink, hubNavLinkActive, hubTextFaint } from '@/lib/hub/ui';

function linkActive(pathname: string, href: string, hostname: string): boolean {
  const longPath = pathnameToLongFpPath(pathname, hostname) ?? pathname;
  if (href === '/football-predictions') return longPath === '/football-predictions';
  if (href === '/blog') return longPath === '/blog' || longPath.startsWith('/blog/');
  if (href === '/football-predictions/privacy') return longPath === '/football-predictions/privacy';
  return longPath === href || longPath.startsWith(`${href}/`);
}

/**
 * Header/footer site nav. Mobile: tidy 2-column grid, no mid-dots, Appearance on its own row.
 * Desktop (md+): unchanged inline wrap with · separators.
 */
export function BestPicksSiteNav({ variant }: { variant: 'header' | 'footer' }) {
  const pathname = usePathname() ?? '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isGoalLabHub = useGoalLabHubNav();

  /** Header and footer use the same links so Contact + Privacy appear in the top bar everywhere (not only on /blog). */
  const items = [...bestPicksSiteNavPrimary, ...bestPicksSiteNavFooterExtra];
  const isHeader = variant === 'header';

  return (
    <nav
      aria-label={
        isHeader ? 'Football predictions sections' : 'Football predictions and site links'
      }
      className={isHeader ? 'pb-2' : 'pt-1'}
    >
      {isHeader ? (
        <div className="mb-3 flex justify-end md:hidden">
          <HubAppearanceToggle />
        </div>
      ) : null}

      {/* Mobile: structured grid without · separators */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3 md:hidden list-none m-0 p-0">
        {items.map(({ href, label }) => {
          const active = linkActive(pathname, href, hostname);
          return (
            <li key={href} className="min-w-0">
              <Link
                href={hubPublicHref(href, isGoalLabHub)}
                className={`${hubNavLink} block w-full py-2 px-1 -mx-1 text-left ${active ? hubNavLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Desktop: existing wrap + mid-dot separators */}
      <div
        className={
          isHeader
            ? 'hidden md:flex md:flex-wrap md:items-center md:gap-x-2 md:gap-y-1.5'
            : 'hidden md:flex md:flex-wrap md:items-center md:gap-x-2 md:gap-y-2'
        }
      >
        {items.map(({ href, label }, i) => {
          const active = linkActive(pathname, href, hostname);
          return (
            <span key={href} className="inline-flex items-center gap-x-2">
              {i > 0 ? (
                <span className={`${hubTextFaint} select-none text-[10px] tabular-nums`} aria-hidden>
                  ·
                </span>
              ) : null}
              <Link
                href={hubPublicHref(href, isGoalLabHub)}
                className={`${hubNavLink} ${active ? hubNavLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </Link>
            </span>
          );
        })}
        {isHeader ? (
          <span className="ml-auto inline-flex items-center pl-2">
            <HubAppearanceToggle />
          </span>
        ) : null}
      </div>
    </nav>
  );
}
