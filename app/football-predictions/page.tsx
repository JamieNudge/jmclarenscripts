import type { Metadata } from 'next';
import Link from 'next/link';
import { AdSenseAutoPlaceholder } from '@/components/AdSenseAutoPlaceholder';
import { BlueskyLink } from '@/components/BlueskyLink';
import { BestPicksBlogPreviewsRail } from '@/components/best-picks/BestPicksBlogPreviewsRail';
import { BestPicksHeadAndPanels } from '@/components/best-picks/BestPicksHeadAndPanels';
import { BEST_PICKS_EXTENDED_SITE_NAV } from '@/components/best-picks/best-picks-site-nav-config';
import { BestPicksSiteNav } from '@/components/best-picks/BestPicksSiteNav';
import { apps } from '@/lib/apps-data';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import { FOOTBALL_PREDICTIONS_PAGE_TITLE } from '@/lib/football-predictions-brand';
import type { App } from '@/types/app';

const hubDescription =
  'Football Predictions & Data-Driven Picks — how each app works (on the page), App Store links, video, research algorithm picks on a dedicated page, and a coming-soon beta slot. Live data from Firebase when configured; informational only.';

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
    // Explicit URLs so crawlers (e.g. WhatsApp) don’t fall back to the first on-page <img> (headshot).
    images: [hubOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: FOOTBALL_PREDICTIONS_PAGE_TITLE,
    description: hubDescription,
    images: [hubOgImage.url],
  },
};

const statStrike = apps.find((a) => a.id === 'stat-strike');
const goalLab = apps.find((a) => a.id === 'goallab');

const storeAppsWithLinks: App[] = [statStrike, goalLab].filter(
  (a): a is App => a != null && Boolean(a.appStoreUrl)
);

function storeLinkAccentClass(appId: string) {
  if (appId === 'stat-strike') return 'text-teal-200/90 group-hover:text-teal-100';
  if (appId === 'goallab') return 'text-amber-200/95 group-hover:text-amber-100';
  return 'text-white/90 group-hover:text-white';
}

function trialNotePillClass(appId: string) {
  if (appId === 'stat-strike') {
    return 'bg-teal-500/15 text-teal-100/95 border border-teal-400/30';
  }
  if (appId === 'goallab') {
    return 'bg-amber-500/15 text-amber-100/95 border border-amber-400/35';
  }
  return 'bg-white/10 text-white/85 border border-white/20';
}

export default function BestPicksPage() {
  return (
    <main className="min-h-screen bp-best-picks-surface text-white flex flex-col">
      <div className="flex flex-1 flex-col lg:flex-row lg:min-h-0 w-full min-h-0">
        <div className="flex-1 min-w-0 min-h-0 px-4 py-10 md:py-14 lg:px-6 lg:pr-4">
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-[min(100%,calc(72rem+1.5rem+14rem))] 2xl:flex 2xl:flex-row 2xl:items-start 2xl:gap-6">
            <div className="min-w-0 w-full max-w-6xl 2xl:max-w-[72rem] 2xl:shrink-0">
              <BestPicksHeadAndPanels>
              <div className={`${bestPicksGridTileClassName} gap-3`}>
                <h2 className="text-lg md:text-xl font-semibold text-white mb-1 shrink-0">App Store links</h2>
                <p className="text-sm text-white/60 leading-relaxed shrink-0">
                  App Store links and official Bluesky where available.
                </p>
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 -mr-0.5 [scrollbar-gutter:stable]">
                  <ul className="space-y-3">
                    {storeAppsWithLinks.map((app) => (
                      <li key={app.id}>
                        <a
                          href={app.appStoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 rounded-xl border border-amber-200/25 bg-zinc-900/80 p-3 hover:border-amber-200/40 hover:bg-zinc-800/80 transition-all group"
                        >
                          <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-amber-200/15 group-hover:border-amber-200/35 flex-shrink-0 transition-all duration-300">
                            {app.icon ? (
                              <img
                                src={app.icon}
                                alt={`${app.name} icon`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                                style={{ backgroundColor: app.color }}
                              >
                                {app.name[0]}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                            <span
                              className={`text-sm font-semibold underline underline-offset-2 ${storeLinkAccentClass(app.id)}`}
                            >
                              {app.name}
                            </span>
                            {app.appStoreTrialNote ? (
                              <span
                                className={`self-start max-w-full text-[10px] sm:text-xs font-semibold leading-snug normal-case tracking-normal rounded-lg px-2 py-1 ${trialNotePillClass(app.id)}`}
                              >
                                {app.appStoreTrialNote}
                              </span>
                            ) : null}
                            <span className="block text-xs text-white/45">App Store</span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                  {storeAppsWithLinks.some((a) => a.blueskyUrl) ? (
                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-3">
                      {storeAppsWithLinks
                        .filter((a): a is App & { blueskyUrl: string } => Boolean(a.blueskyUrl))
                        .map((app) => (
                          <BlueskyLink
                            key={app.id}
                            href={app.blueskyUrl}
                            subtitle={app.blueskyLabel}
                            variant="inline"
                          />
                        ))}
                    </div>
                  ) : null}
                </div>
              </div>
              </BestPicksHeadAndPanels>
            </div>
            <div className="hidden 2xl:block w-56 shrink-0 pt-0">
              <BestPicksBlogPreviewsRail />
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex w-[150px] xl:w-[170px] flex-shrink-0 flex-col border-l border-zinc-700/70 bg-zinc-950/90">
          <AdSenseAutoPlaceholder
            orientation="vertical"
            className="flex-1 w-full min-h-[min(360px,45vh)] lg:min-h-[min(560px,72vh)] rounded-l-lg border-y-0 border-r-0 border-l-0 !border-dashed !border-white/30 !bg-zinc-900/50 !text-white/50"
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
            className="w-full min-h-[90px] !border-white/30 !bg-zinc-950/70 !text-white/50"
          />
          <div className="flex flex-row flex-wrap items-start justify-between gap-x-6 gap-y-2">
            <p
              className="text-left text-[11px] md:text-xs text-white/55 leading-relaxed max-w-[min(100%,42rem)] flex-1 min-w-[12rem]"
              role="note"
            >
              <span className="font-medium text-white/75">Disclaimer.</span>{' '}
              Statistical views of past match patterns are{' '}
              <span className="text-white/65">not</span> guarantees of future results. This website does not offer
              real money gambling, prizes, or simulated gambling. Content on this page is for informational purposes
              only.
            </p>
            <p className="text-right text-[11px] md:text-xs text-white/50 leading-relaxed shrink-0 min-w-[10rem] max-w-sm">
              <Link href="/football-predictions/privacy" className="underline hover:text-white/70 underline-offset-2">
                Privacy policy
              </Link>
              <span className="text-white/25"> · </span>
              Google ads may appear on this page; the privacy policy covers cookies and how ads work.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
