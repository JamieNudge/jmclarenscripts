'use client';

import { useState } from 'react';
import { useDgcDocument } from '@/lib/dgc/use-dgc-document';
import { dgcSiteConfig } from '@/lib/dgc/site-config';
import DgcInputForm from './DgcInputForm';
import DgcPreview from './DgcPreview';
import DgcResultExport from './DgcResultExport';

export default function DgcEditor() {
  const controller = useDgcDocument();
  const [fullscreen, setFullscreen] = useState(false);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0b0b0c] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">
            {dgcSiteConfig.publicProductName} — Full Screen Preview
          </h1>
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white"
          >
            Exit Full Screen
          </button>
        </div>
        <DgcPreview controller={controller} fullscreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101012] text-white">
      <header className="border-b border-white/10 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{dgcSiteConfig.publicProductName}</h1>
            <p className="text-sm text-white/65">Field of Wealth partition designer</p>
          </div>
          <a
            href={`/privacy/${dgcSiteConfig.policySlug}`}
            className="text-sm text-white/70 hover:text-white"
          >
            Privacy
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 lg:grid-cols-[380px_minmax(0,1fr)] md:px-6 md:py-6">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-y-auto rounded-2xl border border-white/15 bg-[#1b1b1d] p-4 shadow-lg max-h-[calc(100dvh-6rem)] lg:h-[calc(100dvh-8.25rem)] lg:max-h-[calc(100dvh-8.25rem)]">
            <DgcInputForm controller={controller} />
          </div>
        </aside>

        <div className="space-y-4">
          <DgcPreview
            controller={controller}
            onRequestFullscreen={() => setFullscreen(true)}
          />
          <DgcResultExport controller={controller} />
        </div>
      </main>
    </div>
  );
}
