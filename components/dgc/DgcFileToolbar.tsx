'use client';

import { useRef } from 'react';
import type { useDgcPersistence } from '@/lib/dgc/use-dgc-persistence';

type Persistence = ReturnType<typeof useDgcPersistence>;

export default function DgcFileToolbar({ persistence }: { persistence: Persistence }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openClicked = () => {
    if (persistence.supportsNativeOpen) {
      void persistence.openDesign();
      return;
    }
    fileInputRef.current?.click();
  };

  const saveClicked = () => {
    void persistence.saveDesign();
  };

  const saveAsClicked = () => {
    void persistence.saveDesignAs();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={openClicked}
          disabled={persistence.isFileBusy}
          className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
        >
          Open design…
        </button>
        <button
          type="button"
          onClick={saveClicked}
          disabled={persistence.isFileBusy}
          className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50"
        >
          Save design
        </button>
        <button
          type="button"
          onClick={saveAsClicked}
          disabled={persistence.isFileBusy}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          Save As…
        </button>
      </div>
      <p className="text-xs text-white/55">DGC design file (.dgcjson)</p>
      <p
        className={`text-xs ${persistence.isDirty ? 'text-amber-300' : 'text-white/60'}`}
        aria-live="polite"
      >
        {persistence.saveStatusLabel}
      </p>
      {persistence.fileStatus ? (
        <p
          className={`max-w-sm text-right text-sm ${
            persistence.fileStatus.type === 'success' ? 'text-green-400' : 'text-red-300'
          }`}
          role="status"
        >
          {persistence.fileStatus.message}
        </p>
      ) : null}
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
    </div>
  );
}
