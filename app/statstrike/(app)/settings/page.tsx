import Link from 'next/link';
import Image from 'next/image';
import { StatStrikeAppStoreCta } from '@/components/statstrike/StatStrikeAppStoreCta';
import { apps } from '@/lib/apps-data';

const appStoreUrl = apps.find((a) => a.id === 'stat-strike')?.appStoreUrl;

export default function StatStrikeSettingsPage() {
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
            page. Web subscriptions are not enabled yet.
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-3">
          <h2 className="font-semibold text-black">Premium (iOS for now)</h2>
          <p className="text-black/80">
            Your Picks, personal track record, export/import, and league-change digests ship on iOS
            first. Stripe on web comes later.
          </p>
          {appStoreUrl ? <StatStrikeAppStoreCta href={appStoreUrl} size="sm" /> : null}
          <ul className="space-y-2 text-black/75">
            <li className="rounded-lg border border-black/8 bg-black/[0.02] px-3 py-2">
              Export / Import track record — locked
            </li>
            <li className="rounded-lg border border-black/8 bg-black/[0.02] px-3 py-2">
              Clear track record — locked
            </li>
          </ul>
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
              <Link href="/support/statstrike" className="text-[#0b3d5c] underline-offset-2 hover:underline">
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
