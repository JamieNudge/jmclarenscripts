'use client';

import { useState } from 'react';
import { useDgcDocument } from '@/lib/dgc/use-dgc-document';
import { useDgcPersistence } from '@/lib/dgc/use-dgc-persistence';
import { readInitialSavedJob } from '@/lib/dgc/job-storage';
import { dgcSiteConfig } from '@/lib/dgc/site-config';
import DgcInputForm from './DgcInputForm';
import DgcPreview from './DgcPreview';
import DgcResultExport from './DgcResultExport';
import DgcAppearanceToggle from './DgcAppearanceToggle';
import DgcTimelinePanel from './DgcTimelinePanel';

export default function DgcEditor() {
  const [boot] = useState(() => readInitialSavedJob());
  const controller = useDgcDocument(boot?.document);
  const persistence = useDgcPersistence(controller, {
    initialJobId: boot?.id ?? null,
  });
  const [fullscreen, setFullscreen] = useState(false);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--dgc-page-fullscreen)] p-4 text-[var(--dgc-text)]">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[var(--dgc-text)]">
            {dgcSiteConfig.publicProductName} — Full Screen Preview
          </h1>
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="rounded-lg border border-[var(--dgc-border-strong)] px-3 py-2 text-sm text-[var(--dgc-text)]"
          >
            Exit Full Screen
          </button>
        </div>
        <DgcPreview controller={controller} fullscreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--dgc-page)] text-[var(--dgc-text)]">
      <header className="border-b border-[var(--dgc-border-soft)] px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{dgcSiteConfig.publicProductName}</h1>
            <p className="text-sm text-[var(--dgc-text-muted)]">Field of Wealth partition designer</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <DgcAppearanceToggle />
            <a
              href="/dgc/data"
              className="text-sm text-[var(--dgc-text-muted)] hover:text-[var(--dgc-text)]"
            >
              Historical data
            </a>
            <a
              href={`/privacy/${dgcSiteConfig.policySlug}`}
              className="text-sm text-[var(--dgc-text-muted)] hover:text-[var(--dgc-text)]"
            >
              Privacy
            </a>
          </div>
        </div>
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
          <div className="overflow-y-auto rounded-2xl border border-[var(--dgc-border)] bg-[var(--dgc-panel)] p-4 shadow-lg max-h-[calc(100dvh-6rem)] lg:h-[calc(100dvh-8.25rem)] lg:max-h-[calc(100dvh-8.25rem)]">
            <div className="space-y-4">
              <DgcInputForm controller={controller} />
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <DgcPreview
            controller={controller}
            onRequestFullscreen={() => setFullscreen(true)}
          />
          <DgcTimelinePanel controller={controller} />
          <DgcResultExport controller={controller} persistence={persistence} />
        </div>
      </main>
    </div>
  );
}
