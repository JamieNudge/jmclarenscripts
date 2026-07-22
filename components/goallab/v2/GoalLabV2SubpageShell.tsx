import type { ReactNode } from 'react';
import { GoalLabV2Shell } from '@/components/goallab/v2/GoalLabV2Shell';
import { GOAL_LAB_V2_HOME_PATH } from '@/components/goallab/v2/paths';
import { HubFootballLink } from '@/components/hub/HubFootballLink';

type Props = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  showBackToHub?: boolean;
  /** Wider content for long privacy / blog pages. */
  wide?: boolean;
};

/**
 * Shared chrome for GoalLab informational pages (methodology, about, blog, etc.).
 */
export function GoalLabV2SubpageShell({
  title,
  description,
  children,
  showBackToHub = true,
  wide = false,
}: Props) {
  return (
    <GoalLabV2Shell>
      <div
        className={`mx-auto px-4 py-10 md:px-6 md:py-14 space-y-8 ${
          wide ? 'max-w-6xl' : 'max-w-3xl'
        }`}
      >
        {showBackToHub ? (
          <div>
            <HubFootballLink
              href={GOAL_LAB_V2_HOME_PATH}
              className="inline-flex items-center gap-2 text-sm text-[var(--gl-text-muted)] hover:text-[var(--gl-text)] transition-colors"
            >
              <span aria-hidden>←</span> Back to Home
            </HubFootballLink>
          </div>
        ) : null}

        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--gl-text)]">{title}</h1>
          {description ? (
            <div className="text-base text-[var(--gl-text-soft)] leading-relaxed">{description}</div>
          ) : null}
        </header>

        <div className="gl-v2-hub-bridge space-y-6 text-sm md:text-base leading-relaxed text-[var(--hub-text-soft)]">
          {children}
        </div>
      </div>
    </GoalLabV2Shell>
  );
}
