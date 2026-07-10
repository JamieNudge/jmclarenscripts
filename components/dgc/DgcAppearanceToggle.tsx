'use client';

import { DGC_APPEARANCE_OPTIONS } from '@/lib/dgc/appearance';
import { useDgcAppearance } from '@/lib/dgc/use-dgc-appearance';

export default function DgcAppearanceToggle() {
  const { preference, setPreference } = useDgcAppearance();

  return (
    <label className="flex items-center gap-2 text-sm text-[var(--dgc-text-muted)]">
      <span className="whitespace-nowrap">Appearance</span>
      <select
        className="rounded-lg border border-[var(--dgc-border-strong)] bg-[var(--dgc-input)] px-2 py-1.5 text-sm text-[var(--dgc-text)]"
        value={preference}
        onChange={(event) =>
          setPreference(event.target.value as (typeof DGC_APPEARANCE_OPTIONS)[number]['value'])
        }
        aria-label="Appearance"
      >
        {DGC_APPEARANCE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
