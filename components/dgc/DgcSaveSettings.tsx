'use client';

import { useRef } from 'react';
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

  const loadClicked = () => {
    if (persistence.supportsNativeOpen) {
      void persistence.openDesign();
      return;
    }
    fileInputRef.current?.click();
  };

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
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void persistence.saveDesign()}
          disabled={persistence.isFileBusy}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Save all settings
        </button>
        <button
          type="button"
          onClick={loadClicked}
          disabled={persistence.isFileBusy}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          Load settings
        </button>
      </div>
      <p
        className={`text-xs ${persistence.isDirty ? 'text-amber-300' : 'text-white/60'}`}
        aria-live="polite"
      >
        {persistence.saveStatusLabel}
      </p>
      {persistence.fileStatus ? (
        <p
          className={`text-sm ${
            persistence.fileStatus.type === 'success' ? 'text-green-400' : 'text-red-300'
          }`}
          role="status"
        >
          {persistence.fileStatus.message}
        </p>
      ) : null}
      <p className="text-xs text-white/55">
        Saves your job name, canvas sizes, layers, and targets so you can reopen and keep editing.
        To get a picture file, use Export PNG below.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".dgcjson,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void persistence.openDesignFromInput(file);
          event.target.value = '';
        }}
      />
    </section>
  );
}
