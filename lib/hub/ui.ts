/**
 * Shared Tailwind class fragments for GoalLab hub light/dark tokens.
 * Use these instead of hard-coded text-white / bg-black on hub pages.
 */

/** Main column width — keep fixtures / research / blog / subpages aligned. */
export const hubContentWidthClass =
  'w-full min-w-0 max-w-6xl 2xl:max-w-none mx-auto';

export const hubPageClass =
  'min-h-screen bg-[var(--hub-page)] text-[var(--hub-text)]';

export const hubPageGradientClass =
  'min-h-screen flex flex-col bg-[image:var(--hub-page-gradient)] text-[var(--hub-text)]';

/** Prefer this when the gradient var is a full background shorthand is unreliable in Tailwind. */
export const hubPageShellClass =
  'min-h-screen flex flex-col text-[var(--hub-text)] hub-page-shell';

export const hubText = 'text-[var(--hub-text)]';
export const hubTextSoft = 'text-[var(--hub-text-soft)]';
export const hubTextMuted = 'text-[var(--hub-text-muted)]';
export const hubTextFaint = 'text-[var(--hub-text-faint)]';

export const hubPanel =
  'border border-[var(--hub-border)] bg-[var(--hub-panel)]';

export const hubElevated =
  'border border-[var(--hub-border)] bg-[var(--hub-elevated)]';

export const hubHover = 'hover:bg-[var(--hub-hover)]';

export const hubBorderT = 'border-t border-[var(--hub-border-soft)]';

export const hubAdPlaceholder =
  '!border-[var(--hub-border-strong)] !bg-[var(--hub-elevated)] !text-[var(--hub-text-soft)]';

export const hubNavLink =
  'text-xs md:text-sm font-medium text-[var(--hub-nav)] hover:opacity-90 underline-offset-4 hover:underline rounded-md px-1.5 py-1 -mx-1.5 transition-colors';

export const hubNavLinkActive =
  'text-[var(--hub-nav-active)] underline decoration-amber-600/70';
