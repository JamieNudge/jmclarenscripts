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
  type DgcAppearancePreference,
  type DgcResolvedTheme,
  readStoredDgcAppearance,
  resolveDgcTheme,
  systemPrefersDark,
  writeStoredDgcAppearance,
} from '@/lib/dgc/appearance';

interface DgcAppearanceContextValue {
  preference: DgcAppearancePreference;
  theme: DgcResolvedTheme;
  setPreference: (preference: DgcAppearancePreference) => void;
}

const DgcAppearanceContext = createContext<DgcAppearanceContextValue | null>(null);

export function DgcAppearanceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<DgcAppearancePreference>('system');
  const [systemDark, setSystemDark] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPreferenceState(readStoredDgcAppearance());
    setSystemDark(systemPrefersDark());
    setReady(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setPreference = useCallback((next: DgcAppearancePreference) => {
    setPreferenceState(next);
    writeStoredDgcAppearance(next);
  }, []);

  const theme = resolveDgcTheme(preference, systemDark);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.dgcTheme = theme;
    return () => {
      delete document.documentElement.dataset.dgcTheme;
    };
  }, [ready, theme]);

  const value = useMemo(
    () => ({ preference, theme, setPreference }),
    [preference, theme, setPreference],
  );

  return (
    <DgcAppearanceContext.Provider value={value}>
      <div data-dgc-theme={theme} className="dgc-root min-h-screen">
        {children}
      </div>
    </DgcAppearanceContext.Provider>
  );
}

export function useDgcAppearance(): DgcAppearanceContextValue {
  const ctx = useContext(DgcAppearanceContext);
  if (!ctx) {
    throw new Error('useDgcAppearance must be used within DgcAppearanceProvider');
  }
  return ctx;
}
