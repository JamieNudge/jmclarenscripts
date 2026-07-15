'use client';

import { HUB_APPEARANCE_OPTIONS } from '@/lib/hub/appearance';
import { useHubAppearance } from '@/lib/hub/use-hub-appearance';

export default function HubAppearanceToggle() {
  const { preference, setPreference } = useHubAppearance();

  return (
    <label className="inline-flex items-center gap-2 text-xs md:text-sm text-[var(--hub-text-muted)]">
      <span className="whitespace-nowrap">Appearance</span>
      <select
        className="rounded-lg border border-[var(--hub-border-strong)] bg-[var(--hub-input)] px-2 py-1 text-xs md:text-sm text-[var(--hub-text)]"
        value={preference}
        onChange={(event) =>
          setPreference(event.target.value as (typeof HUB_APPEARANCE_OPTIONS)[number]['value'])
        }
        aria-label="Appearance"
      >
        {HUB_APPEARANCE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
