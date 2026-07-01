import type { Metadata } from 'next';
import WealthDataBrowser from '@/components/dgc/WealthDataBrowser';
import { dgcSiteConfig } from '@/lib/dgc/site-config';

export const metadata: Metadata = {
  title: `US Household Wealth Data — ${dgcSiteConfig.publicProductName}`,
  description:
    'Historical US household wealth statistics every fifth year from 1920 to 2025, with verified sources.',
  robots: { index: false, follow: false },
};

export default function DgcDataPage() {
  return <WealthDataBrowser />;
}
