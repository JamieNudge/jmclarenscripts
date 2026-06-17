'use client';

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
  return (
    <section className="space-y-3 rounded-xl border border-white/15 bg-[#141416] p-4">
      <h3 className="text-lg font-semibold text-white">Save all settings</h3>
      <label className="block space-y-1">
        <span className="text-base font-semibold text-white">Job (name)</span>
        <input
          className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2 text-white"
          value={controller.document.name}
          placeholder="e.g. Diana 8% sketch"
          onChange={(event) => controller.updateJobName(event.target.value)}
        />
      </label>
      <button
        type="button"
        onClick={persistence.saveAllSettings}
        disabled={persistence.isBusy}
        className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Save all settings
      </button>
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
      <p className="text-xs text-white/55">
        Settings stay in this browser on this device. To share a picture, use Export PNG below.
      </p>

      {persistence.savedJobs.length > 0 ? (
        <div className="space-y-2 border-t border-white/10 pt-3">
          <h4 className="text-sm font-semibold text-white">Saved jobs</h4>
          <ul className="space-y-2">
            {persistence.savedJobs.map((job) => {
              const isActive = persistence.activeJobId === job.id;
              return (
                <li
                  key={job.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                    isActive
                      ? 'border-sky-500/40 bg-sky-500/10'
                      : 'border-white/10 bg-[#111]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{job.name}</p>
                    <p className="text-xs text-white/50">
                      Saved {formatJobSavedAt(job.savedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => persistence.loadSavedJob(job.id)}
                    disabled={persistence.isBusy || isActive}
                    className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white disabled:opacity-40"
                  >
                    {isActive ? 'Open' : 'Load'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
