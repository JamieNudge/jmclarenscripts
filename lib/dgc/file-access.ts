import {
  designDownloadFilename,
  downloadBlob,
  exportDownloadFilename,
  parseDocumentJson,
  serializeDocument,
} from './document';
import type { ExportFormat } from './build-export-artifacts';
import type { DGCDesignDocument } from './types';

const DESIGN_FILE_TYPES: Array<{
  description: string;
  accept: Record<string, string[]>;
}> = [
  {
    description: 'Field of Wealth design (edit later)',
    accept: { 'application/json': ['.dgcjson'] },
  },
];

export const EXPORT_SAVE_FILE_TYPES: Array<{
  description: string;
  accept: Record<string, string[]>;
}> = [
  {
    description: 'PNG image',
    accept: { 'image/png': ['.png'] },
  },
  {
    description: 'PDF document',
    accept: { 'application/pdf': ['.pdf'] },
  },
  {
    description: 'SVG image',
    accept: { 'image/svg+xml': ['.svg'] },
  },
];

// Open only accepts editable design files.
const DGC_FILE_TYPES = DESIGN_FILE_TYPES;

export type FileAccessResult =
  | { ok: true; fileName: string; handle?: FileSystemFileHandle }
  | { ok: false; error: string; cancelled?: boolean };

export type OpenDesignResult =
  | {
      ok: true;
      document: DGCDesignDocument;
      fileName: string;
      handle?: FileSystemFileHandle;
    }
  | { ok: false; error: string; cancelled?: boolean };

export function supportsFileSystemAccess(): boolean {
  return (
    typeof window !== 'undefined' &&
    'showSaveFilePicker' in window &&
    'showOpenFilePicker' in window
  );
}

export function parseDesignFile(file: File, text: string): DGCDesignDocument {
  const name = file.name.toLowerCase();
  if (name.endsWith('.html') || name.endsWith('.htm')) {
    throw new Error(
      'That looks like a saved webpage, not a design file. Use Open and choose a file you saved with Save.',
    );
  }
  return parseDocumentJson(text);
}

export async function openDesignFromFile(file: File): Promise<OpenDesignResult> {
  try {
    const text = await file.text();
    const document = parseDesignFile(file, text);
    return { ok: true, document, fileName: file.name };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Couldn't open that file — make sure it's a design saved from this tool.",
    };
  }
}

export async function openDesignWithPicker(): Promise<OpenDesignResult> {
  if (!supportsFileSystemAccess()) {
    return {
      ok: false,
      error: 'Use Open design to choose a file from your device.',
      cancelled: true,
    };
  }

  try {
    const [handle] = await window.showOpenFilePicker!({
      multiple: false,
      types: DGC_FILE_TYPES,
    });
    const file = await handle.getFile();
    const text = await file.text();
    const document = parseDesignFile(file, text);
    return { ok: true, document, fileName: file.name, handle };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, error: 'Open cancelled.', cancelled: true };
    }
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Couldn't open that file — make sure it's a design saved from this tool.",
    };
  }
}

export function exportFormatFromFileName(fileName: string): ExportFormat {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.svg')) return 'svg';
  return 'png';
}

async function writeDesignHandle(
  handle: FileSystemFileHandle,
  document: DGCDesignDocument,
): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(serializeDocument(document));
  await writable.close();
}

async function writeBlobHandle(
  handle: FileSystemFileHandle,
  blob: Blob,
): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function showSaveFilePicker(
  options: SaveFilePickerOptions & { startIn?: 'desktop' | 'documents' | 'downloads' },
): Promise<FileSystemFileHandle> {
  return window.showSaveFilePicker!(
    options as SaveFilePickerOptions & { startIn?: string },
  );
}

export async function saveDesignWithPicker(
  document: DGCDesignDocument,
  options: {
    forcePicker?: boolean;
    existingHandle?: FileSystemFileHandle | null;
  } = {},
): Promise<FileAccessResult> {
  const fileName = designDownloadFilename(document.name);

  if (
    !options.forcePicker &&
    options.existingHandle &&
    supportsFileSystemAccess()
  ) {
    try {
      await writeDesignHandle(options.existingHandle, document);
      return { ok: true, fileName: options.existingHandle.name, handle: options.existingHandle };
    } catch {
      // Fall through to picker / download fallback.
    }
  }

  if (supportsFileSystemAccess()) {
    try {
      const handle = await showSaveFilePicker({
        suggestedName: fileName,
        types: DESIGN_FILE_TYPES,
        startIn: 'desktop',
      });
      await writeDesignHandle(handle, document);
      return { ok: true, fileName: handle.name, handle };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { ok: false, error: 'Save cancelled.', cancelled: true };
      }
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Couldn't save — try again.",
      };
    }
  }

  const blob = new Blob([serializeDocument(document)], {
    type: 'application/json',
  });
  const downloaded = downloadBlob(blob, fileName);
  if (!downloaded) {
    return {
      ok: false,
      error: "Couldn't start the download. Check that downloads are allowed for this site.",
    };
  }
  return { ok: true, fileName };
}

export async function saveExportWithPicker(
  artifacts: Record<ExportFormat, Blob>,
  designName: string,
  options: { format?: ExportFormat } = {},
): Promise<FileAccessResult> {
  const suggestedName = exportDownloadFilename(designName, options.format ?? 'png');

  if (supportsFileSystemAccess()) {
    try {
      const handle = await window.showSaveFilePicker!({
        suggestedName,
        types: EXPORT_SAVE_FILE_TYPES,
      });
      const format = exportFormatFromFileName(handle.name);
      await writeBlobHandle(handle, artifacts[format]);
      return { ok: true, fileName: handle.name, handle };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { ok: false, error: 'Save cancelled.', cancelled: true };
      }
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Couldn't save — try again.",
      };
    }
  }

  const format = options.format ?? 'png';
  const fileName = exportDownloadFilename(designName, format);
  const downloaded = downloadBlob(artifacts[format], fileName);
  if (!downloaded) {
    return {
      ok: false,
      error: "Couldn't start the download. Check that downloads are allowed for this site.",
    };
  }
  return { ok: true, fileName };
}

export function downloadDesignFallback(document: DGCDesignDocument): FileAccessResult {
  const fileName = designDownloadFilename(document.name);
  const blob = new Blob([serializeDocument(document)], {
    type: 'application/json',
  });
  const downloaded = downloadBlob(blob, fileName);
  if (!downloaded) {
    return {
      ok: false,
      error: "Couldn't start the download. Check that downloads are allowed for this site.",
    };
  }
  return { ok: true, fileName };
}

export function downloadExportBlob(blob: Blob, filename: string): FileAccessResult {
  const downloaded = downloadBlob(blob, filename);
  if (!downloaded) {
    return {
      ok: false,
      error: "Couldn't start the download. Check that downloads are allowed for this site.",
    };
  }
  return { ok: true, fileName: filename };
}
