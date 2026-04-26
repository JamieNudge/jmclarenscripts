import Link from 'next/link';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';

/**
 * Shared full-width, left-aligned footer (nav + ad placeholder + disclaimer) for football-predictions pages.
 */
export function BestPicksHubFooter() {
  return (
    <footer className="w-full border-t border-zinc-700/60 bg-black mt-auto">
      <div className="w-full px-4 py-6 lg:px-6 space-y-4 pb-[max(6rem,env(safe-area-inset-bottom))]">
        {BEST_PICKS_EXTENDED_SITE_NAV ? (
          <div className="w-full min-w-0 text-left">
            <BestPicksSiteNav variant="footer" />
          </div>
        ) : null}
        <AdSenseAutoPlaceholder
          orientation="horizontal"
          className="w-full min-h-[90px] !justify-start !text-left !text-white/70 !border-white/30 !bg-zinc-950/70 px-4 py-3"
        />
        <div className="flex flex-row flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <p
            className="text-left text-[11px] md:text-xs text-white/78 leading-relaxed max-w-[min(100%,42rem)] flex-1 min-w-[12rem]"
            role="note"
          >
            <span className="font-medium text-white/90">Disclaimer.</span> Statistical views of past match patterns
            are <span className="text-white/85">not</span> guarantees of future results. This website does not
            offer real money gambling, prizes, or simulated gambling. Content on this page is for informational
            purposes only.
          </p>
          <p className="text-right text-[11px] md:text-xs text-white/75 leading-relaxed shrink-0 min-w-[10rem] max-w-sm">
            <Link href="/football-predictions/privacy" className="underline hover:text-white/90 underline-offset-2">
              Privacy policy
            </Link>
            <span className="text-white/45"> · </span>
            Google ads may appear on this page; the privacy policy covers cookies and how ads work.
          </p>
        </div>
      </div>
    </footer>
  );
}
