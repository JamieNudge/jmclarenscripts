import Link from 'next/link';
import Image from 'next/image';

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
            <p className="text-xs text-black/50">StatStrike Web</p>
          </div>
          <Link href="/statstrike" className="text-xs font-semibold text-[#0b3d5c] hover:underline">
            ← Board
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-sm leading-relaxed text-black/80">
        <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-2">
          <h2 className="font-semibold text-black">About this preview</h2>
          <p>
            This is an early browser version of StatStrike. Billing, push alerts, and login are not
            enabled yet — the focus is proving the live fixtures board.
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
        <p className="text-xs text-black/45">
          Forecasts are informational and not gambling advice. Past patterns do not guarantee future
          results.
        </p>
      </main>
    </div>
  );
}
