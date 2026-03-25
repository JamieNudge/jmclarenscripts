import type { Metadata } from 'next';
import Link from 'next/link';
import { FirebasePicksPanels } from '@/components/best-picks/FirebasePicksPanels';
import { apps } from '@/lib/apps-data';

export const metadata: Metadata = {
  title: "Today's Best Picks",
  description:
    'Goal-line best picks (Over / Under 2.5), video, and App Store links. Live picks load from Firebase Realtime Database when configured.',
};

const statStrike = apps.find((a) => a.id === 'stat-strike');
const goalLab = apps.find((a) => a.id === 'goallab');

function AdPlaceholder({
  orientation,
  className = '',
}: {
  orientation: 'vertical' | 'horizontal';
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-white/25 bg-black/20 flex items-center justify-center text-white/40 text-xs font-medium uppercase tracking-wider ${className}`}
      aria-hidden
    >
      {orientation === 'vertical' ? (
        <span
          className="inline-block [writing-mode:vertical-rl] rotate-180 py-4"
          style={{ letterSpacing: '0.2em' }}
        >
          Ad placeholder
        </span>
      ) : (
        <span className="px-4 py-3">Ad placeholder — AdSense</span>
      )}
    </div>
  );
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4">
              Today&apos;s Best Picks
            </h1>
            <p className="text-sm text-white/55 mb-8 md:mb-10 max-w-2xl">
              This page may show Google ads. See the{' '}
              <Link href="/privacy" className="underline hover:text-white/90">
                privacy policy
              </Link>{' '}
              for cookies and how ads work on this site.
            </p>

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
                <p className="text-sm text-white/60 leading-relaxed mb-2">
                  Get the apps on the App Store.
                </p>
                <ul className="space-y-2">
                  {statStrike?.appStoreUrl && (
                    <li>
                      <a
                        href={statStrike.appStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
                      >
                        StatStrike — App Store
                      </a>
                    </li>
                  )}
                  {goalLab?.appStoreUrl && (
                    <li>
                      <a
                        href={goalLab.appStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                      >
                        GoalLab — App Store
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <aside className="lg:w-36 xl:w-40 flex-shrink-0 lg:pt-2">
            <AdPlaceholder
              orientation="vertical"
              className="min-h-[200px] lg:min-h-[min(360px,45vh)] w-full"
            />
          </aside>
        </div>
      </div>

      <footer className="w-full border-t border-white/10 bg-black/20 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 space-y-4">
          <p className="text-center text-xs text-white/50">
            <Link href="/privacy" className="underline hover:text-white/80">
              Privacy policy
            </Link>
          </p>
          <AdPlaceholder orientation="horizontal" className="w-full min-h-[90px]" />
        </div>
      </footer>
    </main>
  );
}
