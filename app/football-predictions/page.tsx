import type { Metadata } from 'next';
import Link from 'next/link';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { BplHubCell } from '@/components/best-picks/BplHubCell';
import { BestPicksHeadAndPanels } from '@/components/best-picks/BestPicksHeadAndPanels';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';

const hubDescription =
  "Football Predictions & Data-Driven Picks — BPL hub, how each app works, video, Today's Research Selections on a dedicated page, and a coming-soon beta slot. Live data from Firebase when configured; informational only.";

const hubOgImage = {
  url: '/football-predictions/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${FOOTBALL_PREDICTIONS_PAGE_TITLE} — GoalLab`,
} as const;

export const metadata: Metadata = {
  title: FOOTBALL_PREDICTIONS_PAGE_TITLE,
  description: hubDescription,
  openGraph: {
    title: FOOTBALL_PREDICTIONS_PAGE_TITLE,
    description: hubDescription,
    type: 'website',
    images: [hubOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: FOOTBALL_PREDICTIONS_PAGE_TITLE,
    description: hubDescription,
    images: [hubOgImage.url],
  },
};

export default function BestPicksPage() {
  return (
    <main className="min-h-screen bp-best-picks-surface text-white flex flex-col">
      {/*
        Hub: intro + (grid + blog at 2xl) inside one flex-1; then the ad. Blog rail lives next to the grid, not
        the hero, so it lines up with the card row and the ad is immediately right of the hub.
      */}
      <div className="flex flex-1 flex-col lg:flex-row lg:min-h-0 w-full min-h-0">
        <div className="flex-1 min-w-0 min-h-0 px-4 py-10 md:py-14 lg:px-6 lg:pr-4 2xl:pr-0">
          <div className="mx-auto w-full max-w-6xl 2xl:mx-0 2xl:max-w-none">
            <BestPicksHeadAndPanels>
              <BplHubCell />
            </BestPicksHeadAndPanels>
          </div>
        </div>

        <aside className="hidden lg:flex w-[150px] xl:w-[170px] flex-shrink-0 flex-col border-l border-zinc-700/70 bg-zinc-950/90">
          <AdSenseAutoPlaceholder
            orientation="vertical"
            className="flex-1 w-full min-h-[min(360px,45vh)] lg:min-h-[min(560px,72vh)] rounded-l-lg border-y-0 border-r-0 border-l-0 !border-dashed !border-white/30 !bg-zinc-900/50 !text-white/70"
          />
        </aside>
      </div>

      <footer className="w-full border-t border-zinc-700/60 bg-black mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 space-y-4 pb-[max(6rem,env(safe-area-inset-bottom))]">
          {BEST_PICKS_EXTENDED_SITE_NAV ? (
            <div className="w-full min-w-0">
              <BestPicksSiteNav variant="footer" />
            </div>
          ) : null}
          <AdSenseAutoPlaceholder
            orientation="horizontal"
            className="w-full min-h-[90px] !border-white/30 !bg-zinc-950/70 !text-white/70"
          />
          <div className="flex flex-row flex-wrap items-start justify-between gap-x-6 gap-y-2">
            <p
              className="text-left text-[11px] md:text-xs text-white/78 leading-relaxed max-w-[min(100%,42rem)] flex-1 min-w-[12rem]"
              role="note"
            >
              <span className="font-medium text-white/90">Disclaimer.</span>{' '}
              Statistical views of past match patterns are{' '}
              <span className="text-white/85">not</span> guarantees of future results. This website does not offer
              real money gambling, prizes, or simulated gambling. Content on this page is for informational purposes
              only.
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
    </main>
  );
}
