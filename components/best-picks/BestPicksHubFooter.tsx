import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { HubFootballLink } from '@/components/hub/HubFootballLink';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { hubAdPlaceholder, hubTextFaint, hubTextSoft } from '@/lib/hub/ui';

/**
 * Shared full-width, left-aligned footer (nav + ad placeholder + disclaimer) for football-predictions pages.
 */
export function BestPicksHubFooter() {
  return (
    <footer className="w-full border-t border-[var(--hub-border-zinc)] bg-[var(--hub-footer)] mt-auto">
      <div className="w-full px-4 py-6 lg:px-6 space-y-4 pb-[max(6rem,env(safe-area-inset-bottom))]">
        {BEST_PICKS_EXTENDED_SITE_NAV ? (
          <div className="w-full min-w-0 text-left">
            <BestPicksSiteNav variant="footer" />
          </div>
        ) : null}
        <AdSenseAutoPlaceholder
          orientation="horizontal"
          className={`w-full min-h-[90px] !justify-start !text-left ${hubAdPlaceholder} px-4 py-3`}
        />
        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-x-6 md:gap-y-2">
          <p
            className={`w-full min-w-0 break-words text-left text-[11px] leading-relaxed ${hubTextSoft} md:max-w-[min(100%,42rem)] md:flex-1 md:text-xs`}
            role="note"
          >
            <span className={`font-medium ${hubTextSoft}`}>Disclaimer.</span> Statistical views of past match patterns
            are <span className={hubTextSoft}>not</span> guarantees of future results. This website does not
            offer real money gambling, prizes, or simulated gambling. Content on this page is for informational
            purposes only.
          </p>
          <p className={`w-full min-w-0 break-words text-left text-[11px] leading-relaxed ${hubTextSoft} md:max-w-sm md:text-right md:text-xs`}>
            <HubFootballLink href="/football-predictions/privacy" className="underline hover:opacity-90 underline-offset-2">
              Privacy policies
            </HubFootballLink>
            <span className={hubTextFaint}> · </span>
            Google ads may appear on this page; the privacy policies cover cookies, ads, and app-specific links.
          </p>
        </div>
      </div>
    </footer>
  );
}
