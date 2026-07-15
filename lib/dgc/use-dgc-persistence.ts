'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AUTOSAVE_DEBOUNCE_MS,
  clearAutosave,
  readAutosave,
  shouldOfferRestore,
  writeAutosave,
  type AutosavePayload,
} from './autosave';
import {
  jobNameFromFileName,
  makeNewDocument,
  serializeDocument,
} from './document';
import {
  openDesignFromFile,
  openDesignWithPicker,
  saveDesignWithPicker,
  saveExportWithPicker,
  supportsFileSystemAccess,
} from './file-access';
import type { ExportFormat } from './build-export-artifacts';
import { buildExportArtifacts } from './build-export-artifacts';
import {
  listSavedJobs,
  loadJob,
  saveJob,
  type SavedJobRecord,
} from './job-storage';
import type { DgcDocumentController } from './use-dgc-document';
import type { DGCDesignDocument } from './types';

export type StatusMessage = {
  type: 'success' | 'error';
  message: string;
} | null;

type PersistenceOptions = {
  initialJobId?: string | null;
};

type SaveStateSnapshot = {
  baseline: string;
  browserSavedBaseline: string | null;
  computerFileName: string | null;
  fileSavedBaseline: string | null;
  serializedDocument: string;
};

export function describeSaveState({
  baseline,
  browserSavedBaseline,
  computerFileName,
  fileSavedBaseline,
  serializedDocument,
}: SaveStateSnapshot): { isDirty: boolean; label: string } {
  const matchesFile =
    fileSavedBaseline !== null && serializedDocument === fileSavedBaseline;
  const matchesBrowser =
    browserSavedBaseline !== null && serializedDocument === browserSavedBaseline;
  const hasMacFile = !!computerFileName;

  if (matchesFile && hasMacFile) {
    return { isDirty: false, label: 'Saved to your Mac' };
  }
  if (matchesBrowser && hasMacFile) {
    return {
      isDirty: !matchesFile,
      label: matchesFile
        ? 'Saved to your Mac'
        : 'Backed up in this browser; Mac file needs saving',
    };
  }
  if (matchesBrowser) {
    return { isDirty: false, label: 'Backed up in this browser' };
  }
  if (serializedDocument !== baseline) {
    return { isDirty: true, label: 'Unsaved changes' };
  }
  if (hasMacFile) {
    return { isDirty: false, label: 'Saved to your Mac' };
  }
  return { isDirty: false, label: 'Ready' };
}

function requireJobName(document: DGCDesignDocument): string | null {
  const name = document.name.trim();
  return name || null;
}

function documentWithJobName(
  document: DGCDesignDocument,
  fileName: string,
): DGCDesignDocument {
  if (document.name.trim()) return document;
  const inferred = jobNameFromFileName(fileName);
  return inferred ? { ...document, name: inferred } : document;
}

export function useDgcPersistence(
  controller: DgcDocumentController,
  options: PersistenceOptions = {},
) {
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const savedBaselineRef = useRef(serializeDocument(controller.document));
  const browserSavedBaselineRef = useRef<string | null>(null);
  const fileSavedBaselineRef = useRef<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(
    options.initialJobId ?? null,
  );
  const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [restoreOffer, setRestoreOffer] = useState<AutosavePayload | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [computerFileName, setComputerFileName] = useState<string | null>(null);

  const refreshSavedJobs = useCallback(() => {
    setSavedJobs(listSavedJobs());
  }, []);

  const setSavedCheckpoint = useCallback((document: DGCDesignDocument) => {
    savedBaselineRef.current = serializeDocument(document);
    clearAutosave();
  }, []);

  const markBrowserSaved = useCallback(
    (document: DGCDesignDocument, jobId: string) => {
      const serialized = serializeDocument(document);
      savedBaselineRef.current = serialized;
      browserSavedBaselineRef.current = serialized;
      setActiveJobId(jobId);
      clearAutosave();
      refreshSavedJobs();
    },
    [refreshSavedJobs],
  );

  const markFileSaved = useCallback(
    (document: DGCDesignDocument, fileName: string) => {
      const serialized = serializeDocument(document);
      savedBaselineRef.current = serialized;
      fileSavedBaselineRef.current = serialized;
      setComputerFileName(fileName);
      clearAutosave();
    },
    [],
  );

  const syncBrowserBackup = useCallback(
    (document: DGCDesignDocument, options: { id?: string | null } = {}) => {
      if (!document.name.trim()) return;
      try {
        const record = saveJob(document, options);
        markBrowserSaved(record.document, record.id);
      } catch {
        // Browser backup is best-effort.
      }
    },
    [markBrowserSaved],
  );

  const applyLoadedDocument = useCallback(
    (
      document: DGCDesignDocument,
      message: string,
      options: {
        computerFileName?: string | null;
        jobId?: string | null;
        source: 'browser' | 'disk';
      },
    ) => {
      controller.replaceDocument(document);
      setSavedCheckpoint(document);
      if (options.source === 'browser') {
        browserSavedBaselineRef.current = serializeDocument(document);
        fileSavedBaselineRef.current = null;
        setActiveJobId(options.jobId ?? null);
        setComputerFileName(null);
      } else {
        fileSavedBaselineRef.current = serializeDocument(document);
        browserSavedBaselineRef.current = null;
        setActiveJobId(null);
      }
      if (options.computerFileName !== undefined) {
        setComputerFileName(options.computerFileName);
      }
      setStatus({ type: 'success', message });
      setRestoreOffer(null);
    },
    [controller, setSavedCheckpoint],
  );

  const save = useCallback(async () => {
    const jobName = requireJobName(controller.document);
    if (!jobName) {
      setStatus({
        type: 'error',
        message: 'Enter a design name first.',
      });
      return;
    }

    setIsBusy(true);
    setStatus(null);
    try {
      const result = await saveDesignWithPicker(controller.document, {
        existingHandle: fileHandleRef.current,
      });
      if (result.ok) {
        if (result.handle) fileHandleRef.current = result.handle;
        markFileSaved(controller.document, result.fileName);
        syncBrowserBackup(controller.document, { id: activeJobId });
        setStatus({ type: 'success', message: 'Design saved to your Mac' });
      } else if (!result.cancelled) {
        setStatus({ type: 'error', message: result.error });
      }
    } finally {
      setIsBusy(false);
    }
  }, [activeJobId, controller.document, markFileSaved, syncBrowserBackup]);

  const saveDesignAs = useCallback(async () => {
    const jobName = requireJobName(controller.document);
    if (!jobName) {
      setStatus({
        type: 'error',
        message: 'Enter a design name first.',
      });
      return;
    }

    setIsBusy(true);
    setStatus(null);
    try {
      const result = await saveDesignWithPicker(controller.document, {
        forcePicker: true,
      });
      if (result.ok) {
        fileHandleRef.current = result.handle ?? null;
        markFileSaved(controller.document, result.fileName);
        syncBrowserBackup(controller.document, { id: activeJobId });
        setStatus({
          type: 'success',
          message: `Saved design to your Mac as ${result.fileName}`,
        });
      } else if (!result.cancelled) {
        setStatus({ type: 'error', message: result.error });
      }
    } finally {
      setIsBusy(false);
    }
  }, [activeJobId, controller.document, markFileSaved, syncBrowserBackup]);

  const downloadAs = useCallback(
    async (format?: ExportFormat) => {
      const jobName = requireJobName(controller.document);
      if (!jobName) {
        setStatus({
          type: 'error',
          message: 'Enter a design name first.',
        });
        return;
      }

      setIsBusy(true);
      setStatus(null);
      try {
        const artifacts = await buildExportArtifacts(controller);
        const result = await saveExportWithPicker(artifacts, jobName, { format });
        if (result.ok) {
          syncBrowserBackup(controller.document, { id: activeJobId });
          setStatus({
            type: 'success',
            message: `Downloaded ${result.fileName}`,
          });
        } else if (!result.cancelled) {
          setStatus({ type: 'error', message: result.error });
        }
      } catch (error) {
        setStatus({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : "Couldn't save the image — try again.",
        });
      } finally {
        setIsBusy(false);
      }
    },
    [activeJobId, controller, syncBrowserBackup],
  );

  const open = useCallback(async () => {
    setIsBusy(true);
    setStatus(null);
    try {
      const result = await openDesignWithPicker();
      if (result.ok) {
        const document = documentWithJobName(result.document, result.fileName);
        fileHandleRef.current = result.handle ?? null;
        applyLoadedDocument(
          document,
          `Opened ${document.name.trim() || result.fileName}`,
          { computerFileName: result.fileName, source: 'disk' },
        );
        syncBrowserBackup(document);
        return;
      }
      if (!result.cancelled) {
        setStatus({ type: 'error', message: result.error });
      }
    } finally {
      setIsBusy(false);
    }
  }, [applyLoadedDocument, syncBrowserBackup]);

  const openFile = useCallback(
    async (file: File) => {
      setIsBusy(true);
      setStatus(null);
      try {
        const result = await openDesignFromFile(file);
        if (result.ok) {
          const document = documentWithJobName(result.document, result.fileName);
          fileHandleRef.current = null;
          applyLoadedDocument(
            document,
            `Opened ${document.name.trim() || result.fileName}`,
            { computerFileName: result.fileName, source: 'disk' },
          );
          syncBrowserBackup(document);
        } else if (!result.cancelled) {
          setStatus({ type: 'error', message: result.error });
        }
      } finally {
        setIsBusy(false);
      }
    },
    [applyLoadedDocument, syncBrowserBackup],
  );

  const openRecent = useCallback(
    (jobId: string) => {
      setIsBusy(true);
      setStatus(null);
      try {
        const record = loadJob(jobId);
        if (!record) {
          setStatus({
            type: 'error',
            message: "Couldn't open that job — try saving it again.",
          });
          refreshSavedJobs();
          return;
        }
        fileHandleRef.current = null;
        setComputerFileName(null);
        applyLoadedDocument(record.document, `Opened ${record.name}`, {
          jobId: record.id,
          source: 'browser',
        });
      } catch (error) {
        setStatus({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : "Couldn't open that job — try saving it again.",
        });
      } finally {
        setIsBusy(false);
      }
    },
    [applyLoadedDocument, refreshSavedJobs],
  );

  const newDesign = useCallback(() => {
    const document = makeNewDocument('');
    controller.replaceDocument(document);
    setSavedCheckpoint(document);
    browserSavedBaselineRef.current = null;
    fileSavedBaselineRef.current = null;
    setActiveJobId(null);
    fileHandleRef.current = null;
    setComputerFileName(null);
    setStatus({ type: 'success', message: 'New design started.' });
  }, [controller, setSavedCheckpoint]);

  const restoreAutosave = useCallback(() => {
    if (!restoreOffer) return;
    const name = restoreOffer.document.name.trim() || 'Recovered job';
    const restored = { ...restoreOffer.document, name };
    controller.replaceDocument(restored);
    setSavedCheckpoint(restored);
    fileSavedBaselineRef.current = null;
    setComputerFileName(null);
    setStatus({ type: 'success', message: `Restored unsaved work for ${name}` });
    setRestoreOffer(null);
    syncBrowserBackup(restored, { id: activeJobId });
  }, [activeJobId, controller, restoreOffer, setSavedCheckpoint, syncBrowserBackup]);

  const dismissRestore = useCallback(() => {
    setRestoreOffer(null);
    clearAutosave();
  }, []);

  useEffect(() => {
    refreshSavedJobs();

    if (options.initialJobId) {
      const serialized = serializeDocument(controller.document);
      savedBaselineRef.current = serialized;
      browserSavedBaselineRef.current = serialized;
      fileSavedBaselineRef.current = null;
      setActiveJobId(options.initialJobId);
    }

    const autosave = readAutosave();
    if (
      autosave &&
      shouldOfferRestore(
        controller.document,
        autosave,
        savedBaselineRef.current,
      )
    ) {
      setRestoreOffer(autosave);
    }

    setHasHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const timer = window.setTimeout(() => {
      writeAutosave(controller.document);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [controller.document, hasHydrated]);

  useEffect(() => {
    const flushAutosave = () => {
      writeAutosave(controller.document);
    };
    window.addEventListener('pagehide', flushAutosave);
    return () => window.removeEventListener('pagehide', flushAutosave);
  }, [controller.document]);

  const serializedDocument = serializeDocument(controller.document);
  const saveState = describeSaveState({
    baseline: savedBaselineRef.current,
    browserSavedBaseline: browserSavedBaselineRef.current,
    computerFileName,
    fileSavedBaseline: fileSavedBaselineRef.current,
    serializedDocument,
  });

  const recentDesigns = savedJobs.slice(0, 10);

  return {
    isDirty: saveState.isDirty,
    activeJobId,
    savedJobs,
    recentDesigns,
    status,
    saveStatusLabel: saveState.label,
    computerFileName,
    isBusy,
    restoreOffer,
    save,
    saveDesignAs,
    downloadAs,
    open,
    openFile,
    openRecent,
    newDesign,
    restoreAutosave,
    dismissRestore,
    supportsNativeFileDialogs: supportsFileSystemAccess(),
  };
}
