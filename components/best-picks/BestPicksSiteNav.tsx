'use client';

import { useId, useState } from 'react';
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
 * Header/footer site nav.
 * Mobile: Appearance + Menu button; links open as a single clean list (no mid-dots / no uneven grid).
 * Desktop (md+): unchanged inline wrap with · separators.
 */
export function BestPicksSiteNav({ variant }: { variant: 'header' | 'footer' }) {
  const pathname = usePathname() ?? '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isGoalLabHub = useGoalLabHubNav();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  /** Header and footer use the same links so Contact + Privacy appear in the top bar everywhere (not only on /blog). */
  const items = [...bestPicksSiteNavPrimary, ...bestPicksSiteNavFooterExtra];
  const isHeader = variant === 'header';

  const linkList = (
    <ul className="m-0 list-none space-y-0 p-0">
      {items.map(({ href, label }) => {
        const active = linkActive(pathname, href, hostname);
        return (
          <li key={href} className="border-b border-[var(--hub-border-soft)] last:border-b-0">
            <Link
              href={hubPublicHref(href, isGoalLabHub)}
              className={`${hubNavLink} flex w-full items-center px-1 py-3 text-left text-sm ${active ? hubNavLinkActive : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav
      aria-label={
        isHeader ? 'Football predictions sections' : 'Football predictions and site links'
      }
      className={isHeader ? 'pb-2' : 'pt-1'}
    >
      {/* Mobile header chrome: Appearance + Menu */}
      {isHeader ? (
        <div className="flex items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--hub-border-strong)] bg-[var(--hub-input)] px-3 py-2 text-sm font-medium text-[var(--hub-text)]"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            {menuOpen ? 'Close' : 'Menu'}
          </button>
          <HubAppearanceToggle />
        </div>
      ) : null}

      {/* Mobile: collapse menu in header; always show list in footer */}
      {isHeader ? (
        <div
          id={menuId}
          className={`md:hidden ${menuOpen ? 'mt-3 block' : 'hidden'}`}
          hidden={!menuOpen}
        >
          <div className="rounded-xl border border-[var(--hub-border)] bg-[var(--hub-elevated)] px-3">
            {linkList}
          </div>
        </div>
      ) : (
        <div className="md:hidden">
          <div className="rounded-xl border border-[var(--hub-border)] bg-[var(--hub-elevated)] px-3">
            {linkList}
          </div>
        </div>
      )}

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
