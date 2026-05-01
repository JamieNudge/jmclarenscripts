import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
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
          className="w-full min-h-[90px] !justify-start !text-left !text-white/94 !border-white/30 !bg-zinc-950/70 px-4 py-3"
        />
        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-x-6 md:gap-y-2">
          <p
            className="w-full min-w-0 break-words text-left text-[11px] leading-relaxed text-white/93 md:max-w-[min(100%,42rem)] md:flex-1 md:text-xs"
            role="note"
          >
            <span className="font-medium text-white/94">Disclaimer.</span> Statistical views of past match patterns
            are <span className="text-white/92">not</span> guarantees of future results. This website does not
            offer real money gambling, prizes, or simulated gambling. Content on this page is for informational
            purposes only.
          </p>
          <p className="w-full min-w-0 break-words text-left text-[11px] leading-relaxed text-white/91 md:max-w-sm md:text-right md:text-xs">
            <HubFootballLink href="/football-predictions/privacy" className="underline hover:text-white/94 underline-offset-2">
              Privacy policy
            </HubFootballLink>
            <span className="text-white/68"> · </span>
            Google ads may appear on this page; the privacy policy covers cookies and how ads work.
          </p>
        </div>
      </div>
    </footer>
  );
}
