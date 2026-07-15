'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  type HubAppearancePreference,
  type HubResolvedTheme,
  readStoredHubAppearance,
  resolveHubTheme,
  systemPrefersDark,
  writeStoredHubAppearance,
} from '@/lib/hub/appearance';

interface HubAppearanceContextValue {
  preference: HubAppearancePreference;
  theme: HubResolvedTheme;
  setPreference: (preference: HubAppearancePreference) => void;
}

const HubAppearanceContext = createContext<HubAppearanceContextValue | null>(null);

export function HubAppearanceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<HubAppearancePreference>('light');
  const [systemDark, setSystemDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPreferenceState(readStoredHubAppearance());
    setSystemDark(systemPrefersDark());
    setReady(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setPreference = useCallback((next: HubAppearancePreference) => {
    setPreferenceState(next);
    writeStoredHubAppearance(next);
  }, []);

  const theme = resolveHubTheme(preference, systemDark);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.hubTheme = theme;
    return () => {
      delete document.documentElement.dataset.hubTheme;
    };
  }, [ready, theme]);

  const value = useMemo(
    () => ({ preference, theme, setPreference }),
    [preference, theme, setPreference],
  );

  return (
    <HubAppearanceContext.Provider value={value}>
      <div data-hub-theme={theme} className="hub-root min-h-screen">
        {children}
      </div>
    </HubAppearanceContext.Provider>
  );
}

export function useHubAppearance(): HubAppearanceContextValue {
  const ctx = useContext(HubAppearanceContext);
  if (!ctx) {
    throw new Error('useHubAppearance must be used within HubAppearanceProvider');
  }
  return ctx;
}
