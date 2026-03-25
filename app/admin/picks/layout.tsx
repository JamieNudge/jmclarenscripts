import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best picks admin',
  robots: { index: false, follow: false },
};

export default function AdminPicksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
