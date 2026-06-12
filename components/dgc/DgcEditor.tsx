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
    <div className="flex min-h-screen flex-col bg-[#101012] text-white">
      <header className="shrink-0 border-b border-white/10 px-4 py-4 md:px-6">
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

      <main className="mx-auto grid min-h-0 w-full max-w-[1500px] flex-1 gap-4 px-4 py-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-stretch md:px-6 md:py-6">
        <aside className="min-h-0 overflow-y-auto pr-1 lg:h-full">
          <DgcInputForm controller={controller} />
        </aside>

        <div className="min-h-0 space-y-4">
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
