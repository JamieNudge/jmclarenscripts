import type { ReactNode } from 'react';
import { HubAppearanceProvider } from '@/lib/hub/use-hub-appearance';

/** Client wrapper so server layouts can mount hub appearance without becoming client components. */
export function HubThemeRoot({ children }: { children: ReactNode }) {
  return <HubAppearanceProvider>{children}</HubAppearanceProvider>;
}
