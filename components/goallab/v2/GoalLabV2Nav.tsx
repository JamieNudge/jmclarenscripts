'use client';

import Image from 'next/image';
import { useId, useState } from 'react';
import { usePathname } from 'next/navigation';
import HubAppearanceToggle from '@/components/hub/HubAppearanceToggle';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { GOAL_LAB_V2_HOME_PATH, goalLabV2NavPrimary } from '@/components/goallab/v2/nav-links';
import { pathnameToLongFpPath } from '@/lib/hub-football-routes';

function linkActive(pathname: string, href: string, hostname: string): boolean {
  const longPath = pathnameToLongFpPath(pathname, hostname) ?? pathname;
  if (href === GOAL_LAB_V2_HOME_PATH) {
    return longPath === '/football-predictions' || longPath === '/';
  }
  if (href === '/blog') {
    return longPath === '/blog' || Boolean(longPath?.startsWith('/blog/'));
  }
  return longPath === href || Boolean(longPath?.startsWith(`${href}/`));
}

export function GoalLabV2Nav() {
  const pathname = usePathname() ?? '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--gl-border)] bg-[color-mix(in_srgb,var(--gl-surface)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-[var(--gl-nav-h)] max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <HubFootballLink
          href={GOAL_LAB_V2_HOME_PATH}
          className="flex items-center gap-2.5 shrink-0 rounded-md outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gl-accent)]"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/images/goallab-icon.png"
            alt=""
            width={28}
            height={28}
            className="rounded-md"
            priority
          />
          <span className="text-base font-semibold tracking-tight text-[var(--gl-text)]">GoalLab</span>
        </HubFootballLink>

        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {goalLabV2NavPrimary.map(({ href, label }) => {
            const active = linkActive(pathname, href, hostname);
            return (
              <HubFootballLink
                key={href}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gl-accent)] ${
                  active
                    ? 'bg-[var(--gl-accent-soft)] text-[var(--gl-accent)]'
                    : 'text-[var(--gl-text-soft)] hover:bg-[var(--gl-elevated)] hover:text-[var(--gl-text)]'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {label}
              </HubFootballLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block [&_label]:text-[var(--gl-text-muted)] [&_select]:border-[var(--gl-border-strong)] [&_select]:bg-[var(--gl-surface)] [&_select]:text-[var(--gl-text)]">
            <HubAppearanceToggle />
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg border border-[var(--gl-border-strong)] bg-[var(--gl-surface)] px-3 py-1.5 text-sm font-medium text-[var(--gl-text)]"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((o) => !o)}
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id={menuId} className="md:hidden border-t border-[var(--gl-border)] bg-[var(--gl-surface)] px-4 py-2">
          <ul className="m-0 list-none space-y-0 p-0">
            {goalLabV2NavPrimary.map(({ href, label }) => {
              const active = linkActive(pathname, href, hostname);
              return (
                <li key={href} className="border-b border-[var(--gl-border)] last:border-b-0">
                  <HubFootballLink
                    href={href}
                    className={`flex w-full items-center px-1 py-3 text-sm font-medium ${
                      active ? 'text-[var(--gl-accent)]' : 'text-[var(--gl-text)]'
                    }`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </HubFootballLink>
                </li>
              );
            })}
          </ul>
          <div className="py-3 [&_label]:text-[var(--gl-text-muted)] [&_select]:border-[var(--gl-border-strong)] [&_select]:bg-[var(--gl-surface)] [&_select]:text-[var(--gl-text)]">
            <HubAppearanceToggle />
          </div>
        </div>
      ) : null}
    </header>
  );
}
