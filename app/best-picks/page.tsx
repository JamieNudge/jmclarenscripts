import type { Metadata } from 'next';
import Link from 'next/link';
import { AdSenseOrPlaceholder } from '@/components/AdSenseOrPlaceholder';
import { FirebasePicksPanels } from '@/components/best-picks/FirebasePicksPanels';
import { apps } from '@/lib/apps-data';
import type { App } from '@/types/app';

const bestPicksSidebarAdSlot =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_BEST_PICKS_SIDEBAR ?? '';
const bestPicksFooterAdSlot =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_BEST_PICKS_FOOTER ?? '';

export const metadata: Metadata = {
  title: "Today's Best Picks",
  description:
    'Goal-line best picks (Over / Under 2.5), video, and App Store links. Live picks load from Firebase Realtime Database when configured.',
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

export default function BestPicksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white flex flex-col">
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-10 md:py-14 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to portfolio
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-white/70 hover:text-white underline-offset-2 hover:underline sm:text-right"
          >
            Privacy policy
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8 md:mb-10">
              Today&apos;s Best Picks
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <FirebasePicksPanels />

              <div className="rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 min-h-[160px] flex flex-col justify-center">
                <h2 className="text-lg md:text-xl font-semibold text-white mb-2">Video</h2>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  Match preview or explainer video will go here.
                </p>
                <div className="aspect-video rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-white/35 text-sm">
                  Video placeholder
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8 min-h-[160px] flex flex-col justify-center gap-3">
                <h2 className="text-lg md:text-xl font-semibold text-white mb-1">App Store links</h2>
                <p className="text-sm text-white/60 leading-relaxed mb-3">
                  Get the apps on the App Store.
                </p>
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
                          <span
                            className={`text-sm font-semibold underline underline-offset-2 ${storeLinkAccentClass(app.id)}`}
                          >
                            {app.name}
                          </span>
                          <span className="block text-xs text-white/45 mt-0.5">App Store</span>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <aside className="lg:w-36 xl:w-40 flex-shrink-0 lg:pt-2">
            <AdSenseOrPlaceholder
              slot={bestPicksSidebarAdSlot}
              orientation="vertical"
              className="min-h-[200px] lg:min-h-[min(360px,45vh)] w-full"
            />
          </aside>
        </div>
      </div>

      <footer className="w-full border-t border-white/10 bg-black/20 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 space-y-4">
          <p className="text-center text-[11px] md:text-xs text-white/35 leading-relaxed max-w-md mx-auto">
            <Link href="/privacy" className="underline hover:text-white/55 underline-offset-2">
              Privacy policy
            </Link>
            <span className="text-white/25"> · </span>
            Google ads may appear on this page; the privacy policy covers cookies and how ads work.
          </p>
          <AdSenseOrPlaceholder
            slot={bestPicksFooterAdSlot}
            orientation="horizontal"
            className="w-full min-h-[90px]"
            minHeight="90px"
          />
        </div>
      </footer>
    </main>
  );
}
