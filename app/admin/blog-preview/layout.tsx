import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog preview (admin)',
  robots: { index: false, follow: false },
};

export default function AdminBlogPreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
