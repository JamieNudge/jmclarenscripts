export type DgcAppearancePreference = 'system' | 'light' | 'dark';
export type DgcResolvedTheme = 'light' | 'dark';

export const DGC_APPEARANCE_STORAGE_KEY = 'dgc.appearance';

export const DGC_APPEARANCE_OPTIONS: {
  value: DgcAppearancePreference;
  label: string;
}[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function parseDgcAppearance(raw: string | null | undefined): DgcAppearancePreference {
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

export function resolveDgcTheme(
  preference: DgcAppearancePreference,
  systemDark = false,
): DgcResolvedTheme {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  return systemDark ? 'dark' : 'light';
}

export function readStoredDgcAppearance(): DgcAppearancePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    return parseDgcAppearance(window.localStorage.getItem(DGC_APPEARANCE_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

export function writeStoredDgcAppearance(preference: DgcAppearancePreference): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DGC_APPEARANCE_STORAGE_KEY, preference);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
