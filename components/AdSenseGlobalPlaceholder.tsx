'use client';

import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { usePathname } from 'next/navigation';
import { pathnameToLongFpPath } from '@/lib/hub-football-routes';

/**
 * One reserved horizontal Auto ads region for pages that don’t already include placeholders
 * (blog and best-picks define their own). Skips portfolio home, admin, DGC, and blog/football-predictions trees.
 */
function showGlobalPlaceholder(pathname: string, hostname: string): boolean {
  const longPath = pathnameToLongFpPath(pathname, hostname) ?? pathname;
  if (longPath === '/' || longPath.startsWith('/admin')) return false;
  if (longPath === '/dgc' || longPath.startsWith('/dgc/')) return false;
  if (longPath === '/blog' || longPath.startsWith('/blog/')) return false;
  if (longPath.startsWith('/football-predictions')) return false;
  return true;
}

export function AdSenseGlobalPlaceholder() {
  const pathname = usePathname();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (!pathname || !showGlobalPlaceholder(pathname, hostname)) return null;
  return (
    <div className="w-full border-t border-zinc-800/80 bg-zinc-950/50">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <AdSenseAutoPlaceholder orientation="horizontal" className="w-full min-h-[72px]" />
      </div>
    </div>
  );
}
