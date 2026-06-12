import type { Metadata } from 'next';
import { dgcSiteConfig } from '@/lib/dgc/site-config';

export const metadata: Metadata = {
  title: dgcSiteConfig.pageTitle,
  description: dgcSiteConfig.pageDescription,
  robots: {
    index: false,
    follow: false,
  },
};

export default function DgcLayout({ children }: { children: React.ReactNode }) {
  return children;
}
