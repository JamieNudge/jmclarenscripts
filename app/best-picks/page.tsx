import type { Metadata } from 'next';
import Link from 'next/link';
import { FirebasePicksPanels } from '@/components/best-picks/FirebasePicksPanels';
import { apps } from '@/lib/apps-data';
import type { App } from '@/types/app';

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

/** Layout-only guides; Google Auto ads inject from the root layout script. */
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
        <div className="flex-1 min-w-0 px-4 py-10 md:py-14 lg:px-6 lg:pr-8">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex justify-end mb-8">
              <Link
                href="/privacy"
                className="text-sm text-white/70 hover:text-white underline-offset-2 hover:underline"
              >
                Privacy policy
              </Link>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8 md:mb-10">
              Today&apos;s Best Picks
            </h1>

            <FirebasePicksPanels>
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
        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 space-y-4">
          <p className="text-center text-[11px] md:text-xs text-white/35 leading-relaxed max-w-md mx-auto">
            <Link href="/privacy" className="underline hover:text-white/55 underline-offset-2">
              Privacy policy
            </Link>
            <span className="text-white/25"> · </span>
            Google ads may appear on this page; the privacy policy covers cookies and how ads work.
          </p>
          <AdLayoutPlaceholder orientation="horizontal" className="w-full min-h-[90px]" />
        </div>
      </footer>
    </main>
  );
}
