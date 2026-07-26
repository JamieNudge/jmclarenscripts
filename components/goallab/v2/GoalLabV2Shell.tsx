import type { ReactNode } from 'react';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { HubThemeRoot } from '@/components/hub/HubThemeRoot';
import { GoalLabV2Nav } from '@/components/goallab/v2/GoalLabV2Nav';
import { goalLabV2NavSecondary } from '@/components/goallab/v2/nav-links';
import { goalLabV2Sans } from '@/lib/fonts';

type Props = { children: ReactNode };

/**
 * Shared GoalLab chrome. Includes {@link HubThemeRoot} so the nav appearance toggle works
 * outside `/football-predictions` (e.g. `/support/statstrike`).
 */
export function GoalLabV2Shell({ children }: Props) {
  return (
    <HubThemeRoot>
      <div className={`gl-v2 min-h-screen flex flex-col ${goalLabV2Sans.variable} ${goalLabV2Sans.className}`}>
        <GoalLabV2Nav />
        <main className="flex-1 w-full">{children}</main>
        <footer className="mt-auto border-t border-[var(--gl-border)] bg-[var(--gl-surface)]">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 space-y-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-tight text-[var(--gl-text)]">GoalLab</p>
                <p className="mt-1 text-sm text-[var(--gl-text-muted)] max-w-sm leading-relaxed">
                  Football forecasting for desktop exploration — calm, data-led, informational.
                </p>
              </div>
              <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
                {goalLabV2NavSecondary.map(({ href, label }) => (
                  <HubFootballLink
                    key={href}
                    href={href}
                    className="text-sm text-[var(--gl-text-soft)] underline-offset-2 hover:text-[var(--gl-text)] hover:underline"
                  >
                    {label}
                  </HubFootballLink>
                ))}
              </nav>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--gl-text-muted)] max-w-2xl" role="note">
              Statistical views of past match patterns are not guarantees of future results. GoalLab does not
              offer gambling. Content is informational only.
            </p>
          </div>
        </footer>
      </div>
    </HubThemeRoot>
  );
}
