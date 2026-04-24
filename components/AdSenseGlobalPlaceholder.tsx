'use client';

import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { usePathname } from 'next/navigation';

/**
 * One reserved horizontal Auto ads region for pages that don’t already include placeholders
 * (blog and best-picks define their own). Skips portfolio home, admin, and blog/football-predictions trees.
 */
function showGlobalPlaceholder(pathname: string): boolean {
  if (pathname === '/' || pathname.startsWith('/admin')) return false;
  if (pathname === '/blog' || pathname.startsWith('/blog/')) return false;
  if (pathname.startsWith('/football-predictions')) return false;
  return true;
}

export function AdSenseGlobalPlaceholder() {
  const pathname = usePathname();
  if (!pathname || !showGlobalPlaceholder(pathname)) return null;
  return (
    <div className="w-full border-t border-zinc-800/80 bg-zinc-950/50">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <AdSenseAutoPlaceholder orientation="horizontal" className="w-full min-h-[72px]" />
      </div>
    </div>
  );
}
