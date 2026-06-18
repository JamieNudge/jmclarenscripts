'use client';

import { useRef } from 'react';
import { formatJobSavedAt } from '@/lib/dgc/job-storage';
import type { useDgcPersistence } from '@/lib/dgc/use-dgc-persistence';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';

type Persistence = ReturnType<typeof useDgcPersistence>;

export default function DgcSaveSettings({
  controller,
  persistence,
}: {
  controller: DgcDocumentController;
  persistence: Persistence;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFromComputer = () => {
    if (persistence.supportsNativeFileDialogs) {
      void persistence.openFromComputer();
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <section className="space-y-4 rounded-xl border border-white/15 bg-[#141416] p-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">Your job</h3>
        <p className="text-xs text-white/55">
          Give each design a name. Use it for filenames when you save to your computer.
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-base font-semibold text-white">Job (name)</span>
        <input
          className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2 text-white"
          value={controller.document.name}
          placeholder="e.g. Diana 8% sketch"
          onChange={(event) => controller.updateJobName(event.target.value)}
        />
      </label>

      <div className="space-y-3 rounded-lg border border-sky-500/25 bg-sky-500/5 p-3">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-white">Save on your computer</h4>
          <p className="text-xs text-white/60">
            Keeps a project file on your hard drive. Open it later to keep editing, or
            use Save as… for a copy under a new name.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void persistence.saveToComputer()}
            disabled={persistence.isBusy}
            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Save to computer
          </button>
          <button
            type="button"
            onClick={() => void persistence.saveToComputerAs()}
            disabled={persistence.isBusy}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Save as…
          </button>
          <button
            type="button"
            onClick={openFromComputer}
            disabled={persistence.isBusy}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Open from computer
          </button>
        </div>
        <p className="text-xs text-white/45">
          Project files use the extension .dgcjson. They work in this web app and the Mac
          app. They are not pictures — use Export below for PDF/PNG/SVG.
        </p>
      </div>

      <div className="space-y-3 border-t border-white/10 pt-3">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-white">Quick save in this browser</h4>
          <p className="text-xs text-white/55">
            Handy on this computer only. Does not replace saving a file to your hard drive.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={persistence.saveAllSettings}
            disabled={persistence.isBusy}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Save here
          </button>
          <button
            type="button"
            onClick={persistence.startNewJob}
            disabled={persistence.isBusy}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            New job
          </button>
        </div>

        {persistence.savedJobs.length > 0 ? (
          <ul className="space-y-2">
            {persistence.savedJobs.map((job) => {
              const isActive = persistence.activeJobId === job.id;
              return (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => persistence.loadSavedJob(job.id)}
                    disabled={persistence.isBusy}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-50 ${
                      isActive
                        ? 'border-white/25 bg-white/5'
                        : 'border-white/10 bg-[#111] hover:border-white/25'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{job.name}</p>
                      <p className="text-xs text-white/50">
                        In this browser · {formatJobSavedAt(job.savedAt)}
                        {isActive ? ' · current' : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-white/70">
                      {isActive ? 'Reload' : 'Open'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <p
        className={`text-xs ${persistence.isDirty ? 'text-amber-300' : 'text-white/60'}`}
        aria-live="polite"
      >
        {persistence.saveStatusLabel}
      </p>
      {persistence.status ? (
        <p
          className={`text-sm ${
            persistence.status.type === 'success' ? 'text-green-400' : 'text-red-300'
          }`}
          role="status"
        >
          {persistence.status.message}
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept=".dgcjson,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void persistence.openFromComputerFile(file);
          event.target.value = '';
        }}
      />
    </section>
  );
}
