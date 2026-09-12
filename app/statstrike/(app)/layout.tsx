import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { goalLabPublicBase } from '@/lib/hub-football-routes';
import { isStatStrikeWebEnabled } from '@/lib/statstrike/enabled';

const title = 'StatStrike';
const description = 'StatStrike web — live football fixtures and forecasts.';
const canonicalUrl = `${goalLabPublicBase()}/statstrike`;

export const metadata: Metadata = {
  metadataBase: new URL(`${goalLabPublicBase()}/`),
  title,
  description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    siteName: 'StatStrike',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  icons: {
    icon: [{ url: '/images/stat-strike-icon.png', type: 'image/png', sizes: 'any' }],
    apple: [{ url: '/images/stat-strike-icon.png', type: 'image/png', sizes: '180x180' }],
  },
};

export default function StatStrikeAppLayout({ children }: { children: ReactNode }) {
  if (!isStatStrikeWebEnabled()) {
    notFound();
  }
  return children;
}
