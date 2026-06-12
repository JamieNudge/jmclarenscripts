import type { Metadata } from 'next';
import { dgcSiteConfig } from '@/lib/dgc/site-config';

export const metadata: Metadata = {
  title: `${dgcSiteConfig.publicProductName} — Privacy`,
  description: `Privacy information for the ${dgcSiteConfig.publicProductName} web tool.`,
  robots: { index: false, follow: false },
};

export default function DgcPrivacyPage() {
  return (
    <main className="min-h-screen bg-[#101012] text-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">{dgcSiteConfig.publicProductName} — Privacy</h1>
        <p className="mt-4 text-white/80">
          This web tool runs primarily in your browser. Design files (.dgcjson) are opened and
          saved locally on your device unless you choose to upload or share them elsewhere.
        </p>
        <p className="mt-4 text-white/80">
          During the private beta, this app is not indexed by search engines and is not listed on
          the public portfolio homepage.
        </p>
      </div>
    </main>
  );
}
