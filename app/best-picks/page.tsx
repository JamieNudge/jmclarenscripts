import type { Metadata } from 'next';
import Link from 'next/link';
import { BlueskyLink } from '@/components/BlueskyLink';
import { FirebasePicksPanels } from '@/components/best-picks/FirebasePicksPanels';
import { apps } from '@/lib/apps-data';
import { bestPicksGridTileClassName } from '@/lib/best-picks-panel-shell';
import type { App } from '@/types/app';

const bestPicksDescription =
  "Today's Best Picks — selected by filtering the work of four different algorithms toward what each does best. Over / Under 2.5, video, and App Store links. Live picks load from Firebase Realtime Database when configured.";

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
  if (appId === 'stat-strike') return 'text-emerald-300 group-hover:text-emerald-200';
  if (appId === 'goallab') return 'text-cyan-300 group-hover:text-cyan-200';
  return 'text-white/90 group-hover:text-white';
}

function trialNotePillClass(appId: string) {
  if (appId === 'stat-strike') {
    return 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40';
  }
  if (appId === 'goallab') {
    return 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40';
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
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white flex flex-col">
      <div className="flex flex-1 flex-col lg:flex-row lg:min-h-0 w-full min-h-0">
        <div className="flex-1 min-w-0 min-h-0 px-4 py-10 md:py-14 lg:px-6 lg:pr-8">
          <div className="max-w-6xl mx-auto w-full">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-8 md:mb-10 max-w-4xl leading-tight">
              <span className="block">Today&apos;s Best Picks</span>
              <span className="block mt-3 md:mt-4 text-lg md:text-xl lg:text-2xl font-semibold text-white/90 leading-snug">
                Selected by filtering the work of four different algorithms and what each does best!
              </span>
            </h1>

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
                          className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/20 p-3 hover:border-white/25 hover:bg-white/5 transition-all group"
                        >
                          <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/20 group-hover:border-white/50 flex-shrink-0 transition-all duration-300">
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

        <aside className="hidden lg:flex w-[150px] xl:w-[170px] flex-shrink-0 flex-col border-l border-white/10 bg-black/15">
          <AdLayoutPlaceholder
            orientation="vertical"
            className="flex-1 w-full min-h-[min(360px,45vh)] lg:min-h-[min(560px,72vh)] rounded-l-lg border-y-0 border-r-0 border-l-0"
          />
        </aside>
      </div>

      <footer className="w-full border-t border-white/10 bg-black/20 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 space-y-4 pb-[max(6rem,env(safe-area-inset-bottom))]">
          <AdLayoutPlaceholder orientation="horizontal" className="w-full min-h-[90px]" />
          <div className="flex flex-row flex-wrap items-start justify-between gap-x-6 gap-y-2">
            <p
              className="text-left text-[11px] md:text-xs text-white/45 leading-relaxed max-w-[min(100%,42rem)] flex-1 min-w-[12rem]"
              role="note"
            >
              <span className="font-medium text-white/60">Disclaimer.</span>{' '}
              This website does not offer real money gambling, prizes, or simulated gambling. Content
              on this page is for informational purposes only.
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
