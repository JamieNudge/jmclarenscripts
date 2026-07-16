import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isStatStrikeWebEnabled } from '@/lib/statstrike/enabled';

export const metadata: Metadata = {
  title: 'StatStrike',
  description: 'StatStrike web — live football fixtures and forecasts.',
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
