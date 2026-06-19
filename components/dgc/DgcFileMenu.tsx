'use client';

import { useRef, useState } from 'react';
import { formatJobSavedAt } from '@/lib/dgc/job-storage';
import type { ExportFormat } from '@/lib/dgc/build-export-artifacts';
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
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  const openDesign = () => {
    if (persistence.supportsNativeFileDialogs) {
      void persistence.open();
      return;
    }
    fileInputRef.current?.click();
  };

  const downloadAs = () => {
    if (persistence.supportsNativeFileDialogs) {
      void persistence.downloadAs();
      return;
    }
    setDownloadMenuOpen((value) => !value);
  };

  const downloadFormat = (format: ExportFormat) => {
    setDownloadMenuOpen(false);
    void persistence.downloadAs(format);
  };

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex w-full max-w-xl flex-col items-end gap-3 sm:flex-row sm:items-start sm:justify-end">
        <div className="flex flex-col items-end gap-1.5">
          <p className="text-xs font-medium text-white/55">Keep editing later (on your Mac)</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => void persistence.save()}
              disabled={persistence.isBusy}
              title="Save an editable design file to your hard drive"
              className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
            >
              Save design
            </button>
            <button
              type="button"
              onClick={() => void persistence.saveDesignAs()}
              disabled={persistence.isBusy}
              title="Save a copy of the design under a new name"
              className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
            >
              Save design as…
            </button>
            <button
              type="button"
              onClick={openDesign}
              disabled={persistence.isBusy}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
            >
              Open…
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <p className="text-xs font-medium text-white/55">Share or print (finished picture)</p>
          <div className="relative flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={downloadAs}
              disabled={persistence.isBusy}
              title="Download as PNG, PDF, or SVG"
              className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Download as…
            </button>
            {downloadMenuOpen ? (
              <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-white/15 bg-[#141416] p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => downloadFormat('png')}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-white hover:bg-white/5"
                >
                  PNG image
                </button>
                <button
                  type="button"
                  onClick={() => downloadFormat('pdf')}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-white hover:bg-white/5"
                >
                  PDF document
                </button>
                <button
                  type="button"
                  onClick={() => downloadFormat('svg')}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-white hover:bg-white/5"
                >
                  SVG image
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={persistence.newDesign}
              disabled={persistence.isBusy}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
            >
              New
            </button>
            {persistence.recentDesigns.length > 0 ? (
              <button
                type="button"
                onClick={() => setRecentOpen((value) => !value)}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5"
              >
                Recent {recentOpen ? '▴' : '▾'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <p className="max-w-xl text-right text-xs text-white/50">
        <span className="font-medium text-white/70">Save design</span> keeps your work
        editable — reopen with Open. <span className="font-medium text-white/70">Download as</span>{' '}
        gives you a PNG, PDF, or SVG to share or print (not for reopening).
      </p>

      <label className="flex w-full max-w-sm flex-col items-end gap-1">
        <span className="w-full text-right text-xs font-medium text-white/60">
          Design name
        </span>
        <input
          className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2 text-sm text-white"
          value={controller.document.name}
          placeholder="e.g. Diana 8% sketch"
          onChange={(event) => controller.updateJobName(event.target.value)}
        />
      </label>

      <p
        className={`max-w-sm text-right text-xs ${persistence.isDirty ? 'text-amber-300' : 'text-white/55'}`}
        aria-live="polite"
      >
        {persistence.saveStatusLabel}
      </p>

      {persistence.status ? (
        <p
          className={`max-w-sm text-right text-sm ${
            persistence.status.type === 'success' ? 'text-green-400' : 'text-red-300'
          }`}
          role="status"
        >
          {persistence.status.message}
        </p>
      ) : null}

      {recentOpen && persistence.recentDesigns.length > 0 ? (
        <ul className="w-full max-w-sm space-y-1 rounded-lg border border-white/10 bg-[#141416] p-2">
          {persistence.recentDesigns.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  persistence.openRecent(item.id);
                  setRecentOpen(false);
                }}
                disabled={persistence.isBusy}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-white/5 disabled:opacity-50"
              >
                <span className="truncate font-medium text-white">{item.name}</span>
                <span className="shrink-0 text-xs text-white/45">
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
