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
  jobIdFromName,
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

  const isDirty =
    serializeDocument(controller.document) !== savedBaselineRef.current;

  const markSaved = useCallback(
    (document: DGCDesignDocument, jobId: string) => {
      savedBaselineRef.current = serializeDocument(document);
      setActiveJobId(jobId);
      clearAutosave();
      refreshSavedJobs();
    },
    [refreshSavedJobs],
  );

  const syncBrowserBackup = useCallback(
    (document: DGCDesignDocument) => {
      if (!document.name.trim()) return;
      try {
        const record = saveJob(document);
        markSaved(record.document, record.id);
      } catch {
        // Browser backup is best-effort.
      }
    },
    [markSaved],
  );

  const applyLoadedDocument = useCallback(
    (
      document: DGCDesignDocument,
      jobId: string,
      message: string,
      options: { computerFileName?: string | null } = {},
    ) => {
      controller.replaceDocument(document);
      markSaved(document, jobId);
      if (options.computerFileName !== undefined) {
        setComputerFileName(options.computerFileName);
      }
      setStatus({ type: 'success', message });
      setRestoreOffer(null);
    },
    [controller, markSaved],
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
        setComputerFileName(result.fileName);
        syncBrowserBackup(controller.document);
        setStatus({ type: 'success', message: 'Design saved to edit later' });
      } else if (!result.cancelled) {
        setStatus({ type: 'error', message: result.error });
      }
    } finally {
      setIsBusy(false);
    }
  }, [controller.document, syncBrowserBackup]);

  const saveAs = useCallback(
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
          syncBrowserBackup(controller.document);
          setStatus({
            type: 'success',
            message: `Saved as ${result.fileName}`,
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
    [controller, syncBrowserBackup],
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
          jobIdFromName(document.name),
          `Opened ${document.name.trim() || result.fileName}`,
          { computerFileName: result.fileName },
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
            jobIdFromName(document.name),
            `Opened ${document.name.trim() || result.fileName}`,
            { computerFileName: result.fileName },
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
        applyLoadedDocument(record.document, record.id, `Opened ${record.name}`);
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
    savedBaselineRef.current = serializeDocument(document);
    setActiveJobId(null);
    fileHandleRef.current = null;
    setComputerFileName(null);
    clearAutosave();
    setStatus({ type: 'success', message: 'New design started.' });
  }, [controller]);

  const restoreAutosave = useCallback(() => {
    if (!restoreOffer) return;
    const name = restoreOffer.document.name.trim() || 'Recovered job';
    applyLoadedDocument(
      { ...restoreOffer.document, name },
      activeJobId ?? 'recovered',
      `Restored unsaved work for ${name}`,
    );
    setRestoreOffer(null);
  }, [activeJobId, applyLoadedDocument, restoreOffer]);

  const dismissRestore = useCallback(() => {
    setRestoreOffer(null);
    clearAutosave();
  }, []);

  useEffect(() => {
    refreshSavedJobs();

    if (options.initialJobId) {
      savedBaselineRef.current = serializeDocument(controller.document);
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

  const saveStatusLabel = (() => {
    if (isDirty) return 'Unsaved changes';
    if (computerFileName) return 'All changes saved';
    if (controller.document.name.trim()) return 'All changes saved';
    return 'Ready';
  })();

  const recentDesigns = savedJobs.slice(0, 10);

  return {
    isDirty,
    activeJobId,
    savedJobs,
    recentDesigns,
    status,
    saveStatusLabel,
    computerFileName,
    isBusy,
    restoreOffer,
    save,
    saveAs,
    open,
    openFile,
    openRecent,
    newDesign,
    restoreAutosave,
    dismissRestore,
    supportsNativeFileDialogs: supportsFileSystemAccess(),
  };
}
