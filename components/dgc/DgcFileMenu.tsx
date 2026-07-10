'use client';

import { useRef, useState } from 'react';
import { formatJobSavedAt } from '@/lib/dgc/job-storage';
import type { useDgcPersistence } from '@/lib/dgc/use-dgc-persistence';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';

type Persistence = ReturnType<typeof useDgcPersistence>;

export default function DgcFileMenu({
  controller,
  persistence,
}: {
  controller: DgcDocumentController;
  persistence: Persistence;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentOpen, setRecentOpen] = useState(false);

  const openDesign = () => {
    if (persistence.supportsNativeFileDialogs) {
      void persistence.open();
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-xs font-medium text-[var(--dgc-text-faint)]">
        Save editable design files to your Mac
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void persistence.save()}
          disabled={persistence.isBusy}
          title="Save an editable design file to your hard drive"
          className="rounded-lg border border-[var(--dgc-border-strong)] px-3 py-2 text-sm text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)] disabled:opacity-50"
        >
          Save design
        </button>
        <button
          type="button"
          onClick={() => void persistence.saveDesignAs()}
          disabled={persistence.isBusy}
          title="Save a copy of the design under a new name"
          className="rounded-lg border border-[var(--dgc-border-strong)] px-3 py-2 text-sm text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)] disabled:opacity-50"
        >
          Save design as…
        </button>
        <button
          type="button"
          onClick={openDesign}
          disabled={persistence.isBusy}
          className="rounded-lg border border-[var(--dgc-border-strong)] px-3 py-2 text-sm text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)] disabled:opacity-50"
        >
          Open…
        </button>
        <button
          type="button"
          onClick={persistence.newDesign}
          disabled={persistence.isBusy}
          className="rounded-lg border border-[var(--dgc-border-strong)] px-3 py-2 text-sm text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)] disabled:opacity-50"
        >
          New
        </button>
        {persistence.recentDesigns.length > 0 ? (
          <button
            type="button"
            onClick={() => setRecentOpen((value) => !value)}
            className="rounded-lg border border-[var(--dgc-border-strong)] px-3 py-2 text-sm text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)]"
          >
            Recent {recentOpen ? '▴' : '▾'}
          </button>
        ) : null}
      </div>

      <p className="max-w-md text-xs text-[var(--dgc-text-faint)]">
        <span className="font-medium text-[var(--dgc-text-muted)]">Save design</span> keeps your work
        editable on your Mac and Open brings it back later. Named work is also backed up in this
        browser for convenience. Finished pictures are exported in the panel on the right.
      </p>

      <label className="flex w-full max-w-md flex-col gap-1">
        <span className="text-xs font-medium text-[var(--dgc-text-faint)]">Design name</span>
        <input
          className="w-full rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-3 py-2 text-sm text-[var(--dgc-text)]"
          value={controller.document.name}
          placeholder="e.g. Diana 8% sketch"
          onChange={(event) => controller.updateJobName(event.target.value)}
        />
      </label>

      <p
        className={`max-w-md text-xs ${persistence.isDirty ? 'text-amber-300' : 'text-[var(--dgc-text-faint)]'}`}
        aria-live="polite"
      >
        {persistence.saveStatusLabel}
      </p>

      {persistence.status ? (
        <p
          className={`max-w-md text-sm ${
            persistence.status.type === 'success' ? 'text-green-400' : 'text-red-300'
          }`}
          role="status"
        >
          {persistence.status.message}
        </p>
      ) : null}

      {recentOpen && persistence.recentDesigns.length > 0 ? (
        <ul className="w-full max-w-md space-y-1 rounded-lg border border-[var(--dgc-border-soft)] bg-[var(--dgc-elevated)] p-2">
          {persistence.recentDesigns.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  persistence.openRecent(item.id);
                  setRecentOpen(false);
                }}
                disabled={persistence.isBusy}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-[var(--dgc-hover)] disabled:opacity-50"
              >
                <span className="truncate font-medium text-[var(--dgc-text)]">{item.name}</span>
                <span className="shrink-0 text-xs text-[var(--dgc-text-dim)]">
                  {formatJobSavedAt(item.savedAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept=".dgcjson,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void persistence.openFile(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
