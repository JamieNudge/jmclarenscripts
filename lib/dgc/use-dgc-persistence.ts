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
  listSavedJobs,
  loadJob,
  readLastJobId,
  saveJob,
  type SavedJobRecord,
} from './job-storage';
import { serializeDocument } from './document';
import type { DgcDocumentController } from './use-dgc-document';
import type { DGCDesignDocument } from './types';

export type StatusMessage = {
  type: 'success' | 'error';
  message: string;
} | null;

export function useDgcPersistence(controller: DgcDocumentController) {
  const savedBaselineRef = useRef(serializeDocument(controller.document));
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJobRecord[]>([]);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [restoreOffer, setRestoreOffer] = useState<AutosavePayload | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  const refreshSavedJobs = useCallback(() => {
    setSavedJobs(listSavedJobs());
  }, []);

  const isDirty =
    serializeDocument(controller.document) !== savedBaselineRef.current;

  const markSaved = useCallback((document: DGCDesignDocument, jobId: string) => {
    savedBaselineRef.current = serializeDocument(document);
    setActiveJobId(jobId);
    clearAutosave();
    refreshSavedJobs();
  }, [refreshSavedJobs]);

  const applyLoadedDocument = useCallback(
    (document: DGCDesignDocument, jobId: string, message: string) => {
      controller.replaceDocument(document);
      markSaved(document, jobId);
      setStatus({ type: 'success', message });
      setRestoreOffer(null);
    },
    [controller, markSaved],
  );

  const saveAllSettings = useCallback(() => {
    setIsBusy(true);
    setStatus(null);
    try {
      const record = saveJob(controller.document);
      markSaved(record.document, record.id);
      setStatus({
        type: 'success',
        message: `Saved all settings for ${record.name}`,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : "Couldn't save — try again.",
      });
    } finally {
      setIsBusy(false);
    }
  }, [controller.document, markSaved]);

  const loadSavedJob = useCallback(
    (jobId: string) => {
      setIsBusy(true);
      setStatus(null);
      try {
        const record = loadJob(jobId);
        if (!record) {
          setStatus({ type: 'error', message: "Couldn't find that saved job." });
          refreshSavedJobs();
          return;
        }
        applyLoadedDocument(
          record.document,
          record.id,
          `Loaded ${record.name}`,
        );
      } finally {
        setIsBusy(false);
      }
    },
    [applyLoadedDocument, refreshSavedJobs],
  );

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
    const lastJobId = readLastJobId();
    if (lastJobId) {
      const record = loadJob(lastJobId);
      if (record) {
        controller.replaceDocument(record.document);
        savedBaselineRef.current = serializeDocument(record.document);
        setActiveJobId(record.id);
      }
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
    // Hydrate once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    const timer = window.setTimeout(() => {
      writeAutosave(controller.document);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [controller.document, hasHydrated]);

  const saveStatusLabel = (() => {
    const jobName = controller.document.name.trim();
    if (isDirty) {
      return jobName ? `Unsaved changes to ${jobName}` : 'Unsaved changes';
    }
    if (jobName) return `All settings saved for ${jobName}`;
    return 'Saved in this browser while you work';
  })();

  return {
    isDirty,
    activeJobId,
    savedJobs,
    status,
    saveStatusLabel,
    isBusy,
    restoreOffer,
    saveAllSettings,
    loadSavedJob,
    restoreAutosave,
    dismissRestore,
    refreshSavedJobs,
  };
}
