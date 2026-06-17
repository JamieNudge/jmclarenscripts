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
import { serializeDocument } from './document';
import {
  downloadDesignFallback,
  openDesignFromFile,
  openDesignWithPicker,
  saveDesignWithPicker,
  type FileAccessResult,
} from './file-access';
import type { DgcDocumentController } from './use-dgc-document';
import type { DGCDesignDocument } from './types';

export type StatusMessage = {
  type: 'success' | 'error';
  message: string;
} | null;

export function useDgcPersistence(controller: DgcDocumentController) {
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const savedBaselineRef = useRef(serializeDocument(controller.document));
  const [savedFileName, setSavedFileName] = useState<string | null>(null);
  const [fileStatus, setFileStatus] = useState<StatusMessage>(null);
  const [restoreOffer, setRestoreOffer] = useState<AutosavePayload | null>(null);
  const [isFileBusy, setIsFileBusy] = useState(false);

  const isDirty =
    serializeDocument(controller.document) !== savedBaselineRef.current;

  const markSaved = useCallback((document: DGCDesignDocument, fileName: string) => {
    savedBaselineRef.current = serializeDocument(document);
    setSavedFileName(fileName);
    clearAutosave();
  }, []);

  const applyOpenResult = useCallback(
    (
      document: DGCDesignDocument,
      fileName: string,
      handle?: FileSystemFileHandle,
    ) => {
      controller.replaceDocument(document);
      fileHandleRef.current = handle ?? null;
      markSaved(document, fileName);
      setFileStatus({
        type: 'success',
        message: `Loaded settings for ${document.name.trim() || 'job'}`,
      });
      setRestoreOffer(null);
    },
    [controller, markSaved],
  );

  const openDesign = useCallback(async () => {
    setIsFileBusy(true);
    setFileStatus(null);
    try {
      const pickerResult = await openDesignWithPicker();
      if (pickerResult.ok) {
        applyOpenResult(
          pickerResult.document,
          pickerResult.fileName,
          pickerResult.handle,
        );
        return;
      }
      if (!pickerResult.cancelled) {
        setFileStatus({ type: 'error', message: pickerResult.error });
      }
    } finally {
      setIsFileBusy(false);
    }
  }, [applyOpenResult]);

  const openDesignFromInput = useCallback(
    async (file: File) => {
      setIsFileBusy(true);
      setFileStatus(null);
      try {
        const result = await openDesignFromFile(file);
        if (result.ok) {
          applyOpenResult(result.document, result.fileName);
        } else if (!result.cancelled) {
          setFileStatus({ type: 'error', message: result.error });
        }
      } finally {
        setIsFileBusy(false);
      }
    },
    [applyOpenResult],
  );

  const runSave = useCallback(
    async (
      saver: () => Promise<FileAccessResult>,
    ): Promise<FileAccessResult> => {
      setIsFileBusy(true);
      setFileStatus(null);
      try {
        const result = await saver();
        if (result.ok) {
          markSaved(controller.document, result.fileName);
          if (result.handle) {
            fileHandleRef.current = result.handle;
          }
          setFileStatus({
            type: 'success',
            message: `Saved all settings for ${controller.document.name.trim() || 'job'}`,
          });
        } else if (!result.cancelled) {
          setFileStatus({ type: 'error', message: result.error });
        }
        return result;
      } finally {
        setIsFileBusy(false);
      }
    },
    [controller.document, markSaved],
  );

  const saveDesign = useCallback(async () => {
    if (fileHandleRef.current) {
      return runSave(() =>
        saveDesignWithPicker(controller.document, {
          existingHandle: fileHandleRef.current,
        }),
      );
    }
    return runSave(() => saveDesignWithPicker(controller.document));
  }, [controller.document, runSave]);

  const saveDesignAs = useCallback(async () => {
    return runSave(() =>
      saveDesignWithPicker(controller.document, { forcePicker: true }),
    );
  }, [controller.document, runSave]);

  const saveDesignFallback = useCallback(async () => {
    return runSave(async () => downloadDesignFallback(controller.document));
  }, [controller.document, runSave]);

  const restoreAutosave = useCallback(() => {
    if (!restoreOffer) return;
    applyOpenResult(restoreOffer.document, 'restored design');
    setRestoreOffer(null);
  }, [applyOpenResult, restoreOffer]);

  const dismissRestore = useCallback(() => {
    setRestoreOffer(null);
    clearAutosave();
  }, []);

  useEffect(() => {
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
    // Only evaluate restore offer on initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      writeAutosave(controller.document);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [controller.document]);

  const saveStatusLabel = (() => {
    const jobName = controller.document.name.trim();
    if (isDirty) return jobName ? `Unsaved changes to ${jobName}` : 'Unsaved changes';
    if (savedFileName) {
      return jobName ? `All settings saved for ${jobName}` : 'All settings saved';
    }
    return 'Backed up in this browser';
  })();

  return {
    isDirty,
    savedFileName,
    fileStatus,
    saveStatusLabel,
    isFileBusy,
    restoreOffer,
    openDesign,
    openDesignFromInput,
    saveDesign,
    saveDesignAs,
    saveDesignFallback,
    restoreAutosave,
    dismissRestore,
    supportsNativeOpen: typeof window !== 'undefined' && 'showOpenFilePicker' in window,
  };
}
