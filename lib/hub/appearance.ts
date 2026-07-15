export type HubAppearancePreference = 'system' | 'light' | 'dark';
export type HubResolvedTheme = 'light' | 'dark';

export const GOAL_LAB_APPEARANCE_STORAGE_KEY = 'goallab.appearance';

export const HUB_APPEARANCE_OPTIONS: {
  value: HubAppearancePreference;
  label: string;
}[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function parseHubAppearance(raw: string | null | undefined): HubAppearancePreference {
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'dark';
}

export function resolveHubTheme(
  preference: HubAppearancePreference,
  systemDark = true,
): HubResolvedTheme {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return systemDark ? 'dark' : 'light';
}

export function readStoredHubAppearance(): HubAppearancePreference {
  if (typeof window === 'undefined') return 'dark';
  try {
    return parseHubAppearance(window.localStorage.getItem(GOAL_LAB_APPEARANCE_STORAGE_KEY));
  } catch {
    return 'dark';
  }
}

export function writeStoredHubAppearance(preference: HubAppearancePreference): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GOAL_LAB_APPEARANCE_STORAGE_KEY, preference);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
