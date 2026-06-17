'use client';

import { useState } from 'react';
import { useDgcDocument } from '@/lib/dgc/use-dgc-document';
import { useDgcPersistence } from '@/lib/dgc/use-dgc-persistence';
import { dgcSiteConfig } from '@/lib/dgc/site-config';
import DgcFileToolbar from './DgcFileToolbar';
import DgcInputForm from './DgcInputForm';
import DgcPreview from './DgcPreview';
import DgcResultExport from './DgcResultExport';

export default function DgcEditor() {
  const controller = useDgcDocument();
  const persistence = useDgcPersistence(controller);
  const [fullscreen, setFullscreen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{dgcSiteConfig.publicProductName}</h1>
            <p className="text-sm text-white/65">Field of Wealth partition designer</p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <DgcFileToolbar persistence={persistence} />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHelpOpen((value) => !value)}
                className="text-sm text-white/70 hover:text-white"
              >
                {helpOpen ? 'Hide help' : 'Saving vs exporting'}
              </button>
              <a
                href={`/privacy/${dgcSiteConfig.policySlug}`}
                className="text-sm text-white/70 hover:text-white"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
        {helpOpen ? (
          <div className="mx-auto mt-4 max-w-[1500px] rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="text-white">Save design</strong> — saves your editable project file (.dgcjson).
              </li>
              <li>
                <strong className="text-white">Export PNG/SVG/PDF</strong> — downloads an image for email, print, or slides.
              </li>
              <li>
                Your work is also backed up automatically in this browser while you edit.
              </li>
            </ul>
          </div>
        ) : null}
      </header>

      {persistence.restoreOffer ? (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 md:px-6">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-100">
              Unsaved work was found in this browser. Restore it?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={persistence.restoreAutosave}
                className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-black"
              >
                Restore unsaved work
              </button>
              <button
                type="button"
                onClick={persistence.dismissRestore}
                className="rounded-lg border border-amber-200/30 px-3 py-2 text-sm text-amber-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
