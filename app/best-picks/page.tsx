import type { Metadata } from 'next';
import Link from 'next/link';
import { BlueskyLink } from '@/components/BlueskyLink';
import { BestPicksIntro } from '@/components/best-picks/BestPicksIntro';
import { FirebasePicksPanels } from '@/components/best-picks/FirebasePicksPanels';
import { apps } from '@/lib/apps-data';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import type { App } from '@/types/app';

const bestPicksDescription =
  "Today's Best Picks — statistical patterns from multiple forecasting pipelines (StatStrike, GoalLab, Firebase). Over / Under 2.5, research strip, video, and App Store links. Live data from Firebase when configured; informational only.";

const bestPicksOgImage = {
  url: '/best-picks/opengraph-image',
  width: 1200,
  height: 630,
  alt: "Today's Best Picks — GoalLab",
} as const;

export const metadata: Metadata = {
  title: "Today's Best Picks",
  description: bestPicksDescription,
  openGraph: {
    title: "Today's Best Picks",
    description: bestPicksDescription,
    type: 'website',
    // Explicit URLs so crawlers (e.g. WhatsApp) don’t fall back to the first on-page <img> (headshot).
    images: [bestPicksOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Today's Best Picks",
    description: bestPicksDescription,
    images: [bestPicksOgImage.url],
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

/** Reserved regions; Google Auto ads may fill these when enabled. */
function AdLayoutPlaceholder({
  orientation,
  className = '',
}: {
  orientation: 'vertical' | 'horizontal';
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-white/25 bg-black/20 flex items-center justify-center text-white/35 text-[10px] md:text-xs font-medium uppercase tracking-wider text-center px-2 ${className}`}
      aria-hidden
    >
      {orientation === 'vertical' ? (
        <span
          className="inline-block [writing-mode:vertical-rl] rotate-180 py-4"
          style={{ letterSpacing: '0.2em' }}
        >
          Auto ads area
        </span>
      ) : (
        <span className="px-4 py-3">Auto ads may also appear in-page via Google</span>
      )}
    </div>
  );
}

export default function BestPicksPage() {
  return (
    <main className="min-h-screen bp-best-picks-surface text-white flex flex-col">
      <div className="flex flex-1 flex-col lg:flex-row lg:min-h-0 w-full min-h-0">
        <div className="flex-1 min-w-0 min-h-0 px-4 py-10 md:py-14 lg:px-6 lg:pr-8">
          <div className="max-w-6xl mx-auto w-full">
            <BestPicksIntro />

            <FirebasePicksPanels>
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
                          className="flex items-center gap-4 rounded-xl border border-amber-200/12 bg-black/25 p-3 hover:border-amber-200/22 hover:bg-white/[0.04] transition-all group"
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
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-sm font-semibold underline underline-offset-2 ${storeLinkAccentClass(app.id)}`}
                              >
                                {app.name}
                              </span>
                              {app.appStoreTrialNote ? (
                                <span
                                  className={`shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${trialNotePillClass(app.id)}`}
                                >
                                  {app.appStoreTrialNote}
                                </span>
                              ) : null}
                            </div>
                            <span className="block text-xs text-white/45 mt-0.5">App Store</span>
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
            </FirebasePicksPanels>
          </div>
        </div>

        <aside className="hidden lg:flex w-[150px] xl:w-[170px] flex-shrink-0 flex-col border-l border-amber-200/12 bg-slate-900/25">
          <AdLayoutPlaceholder
            orientation="vertical"
            className="flex-1 w-full min-h-[min(360px,45vh)] lg:min-h-[min(560px,72vh)] rounded-l-lg border-y-0 border-r-0 border-l-0"
          />
        </aside>
      </div>

      <footer className="w-full border-t border-white/10 bg-slate-900/30 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 space-y-4 pb-[max(6rem,env(safe-area-inset-bottom))]">
          <AdLayoutPlaceholder orientation="horizontal" className="w-full min-h-[90px]" />
          <div className="flex flex-row flex-wrap items-start justify-between gap-x-6 gap-y-2">
            <p
              className="text-left text-[11px] md:text-xs text-white/45 leading-relaxed max-w-[min(100%,42rem)] flex-1 min-w-[12rem]"
              role="note"
            >
              <span className="font-medium text-white/60">Disclaimer.</span>{' '}
              Statistical views of past match patterns are{' '}
              <span className="text-white/55">not</span> guarantees of future results. This website does not offer
              real money gambling, prizes, or simulated gambling. Content on this page is for informational purposes
              only.
            </p>
            <p className="text-right text-[11px] md:text-xs text-white/35 leading-relaxed shrink-0 min-w-[10rem] max-w-sm">
              <Link href="/privacy" className="underline hover:text-white/55 underline-offset-2">
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
