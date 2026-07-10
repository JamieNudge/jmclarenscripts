'use client';

import type { ReactNode } from 'react';
import { DgcAppearanceProvider } from '@/lib/dgc/use-dgc-appearance';

export default function DgcThemeRoot({ children }: { children: ReactNode }) {
  return <DgcAppearanceProvider>{children}</DgcAppearanceProvider>;
}
