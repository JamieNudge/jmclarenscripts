'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StatStrikeAppStoreCta } from '@/components/statstrike/StatStrikeAppStoreCta';
import { useStatStrikeWebBlur } from '@/hooks/useStatStrikeWebBlur';
import { apps } from '@/lib/apps-data';
import { passCreatePath } from '@/lib/statstrike/pass-constants';

const appStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

export default function StatStrikeSettingsPage() {
  const { supporterPassSalesEnabled } = useStatStrikeWebBlur();

  return (
    <div className="min-h-screen bg-[#eef2f6] text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Image
            src="/images/stat-strike-icon.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-[#0b3d5c]">Settings</h1>
            <p className="text-xs text-black/70">StatStrike Web</p>
          </div>
          <Link href="/statstrike" className="text-xs font-semibold text-[#0b3d5c] hover:underline">
            ← Board
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-sm leading-relaxed text-black/80">
        <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-2">
          <h2 className="font-semibold text-black">About</h2>
          <p>
            Browser version of StatStrike. Coming Soon blur is controlled from the GoalLab admin
            page. A one-time 24h web pass unlocks the board and Your Picks / My Record on this
            browser.
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-3">
          <h2 className="font-semibold text-black">24h web pass</h2>
          {supporterPassSalesEnabled ? (
            <>
              <p className="text-black/80">
                Create a pass (£1 / £3 / £5 / £10 — same entitlement) on the support page. Your Picks
                and My Record stay on this device (IndexedDB) while the pass is active.
              </p>
              <Link
                href={passCreatePath()}
                className="inline-flex items-center justify-center rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-200"
              >
                Get 24h access
              </Link>
            </>
          ) : (
            <p className="text-black/80">
              24-hour web pass purchases are temporarily unavailable. Support for the apps (and
              existing passes) is still available on the support page.
            </p>
          )}
          {appStoreUrl ? (
            <StatStrikeAppStoreCta
              href={appStoreUrl}
              label="Also on the App Store"
              size="sm"
            />
          ) : null}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-2">
          <h2 className="font-semibold text-black">Daily selection alerts</h2>
          <p className="text-black/80">
            Push alerts when today’s list publishes are available in the iOS app. Web push is not
            wired yet.
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-2">
          <h2 className="font-semibold text-black">Board</h2>
          <p className="text-black/80">
            Use Refresh on the Fixtures tab to re-publish the live listeners. Clearing a local cache
            is not required — the board reads Firebase Realtime Database directly.
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-2">
          <h2 className="font-semibold text-black">Legal</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Link href="/privacy/statstrike" className="text-[#0b3d5c] underline-offset-2 hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms/statstrike" className="text-[#0b3d5c] underline-offset-2 hover:underline">
                Terms
              </Link>
            </li>
            <li>
              <Link href={passCreatePath()} className="text-[#0b3d5c] underline-offset-2 hover:underline">
                Support
              </Link>
            </li>
          </ul>
        </section>
        <p className="text-xs text-black/80">
          Forecasts are informational and not gambling advice. Past patterns do not guarantee future
          results.
        </p>
      </main>
    </div>
  );
}
