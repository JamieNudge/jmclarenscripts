import { serializeDocument } from './document';
import type { DGCDesignDocument } from './types';

export const AUTOSAVE_STORAGE_KEY = 'dgc:autosave:v1';
export const AUTOSAVE_DEBOUNCE_MS = 2000;

export type AutosavePayload = {
  document: DGCDesignDocument;
  savedAt: string;
};

export function readAutosave(): AutosavePayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AutosavePayload;
    if (!parsed.document?.layers?.length || !parsed.savedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAutosave(document: DGCDesignDocument): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: AutosavePayload = {
      document,
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage full or unavailable — ignore.
  }
}

export function clearAutosave(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}

export function shouldOfferRestore(
  current: DGCDesignDocument,
  autosave: AutosavePayload,
  savedBaseline: string | null,
): boolean {
  const autosaveSerialized = serializeDocument(autosave.document);
  if (savedBaseline && autosaveSerialized === savedBaseline) {
    return false;
  }
  const currentSerialized = serializeDocument(current);
  if (autosaveSerialized === currentSerialized) {
    return false;
  }
  return new Date(autosave.savedAt).getTime() > new Date(current.updatedAt).getTime();
}
