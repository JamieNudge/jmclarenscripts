import { parseDocumentJson, serializeDocument, touchDocument } from './document';
import type { DGCDesignDocument } from './types';

export const SAVED_JOBS_STORAGE_KEY = 'dgc:saved-jobs:v1';
export const LAST_JOB_ID_STORAGE_KEY = 'dgc:last-job:v1';

export type SavedJobRecord = {
  id: string;
  name: string;
  document: DGCDesignDocument;
  savedAt: string;
};

type JobRegistry = Record<string, SavedJobRecord>;

function readRegistry(): JobRegistry {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SAVED_JOBS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as JobRegistry;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeRegistry(registry: JobRegistry): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAVED_JOBS_STORAGE_KEY, JSON.stringify(registry));
}

export function jobIdFromName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
  return slug || 'untitled-job';
}

export function formatJobSavedAt(savedAt: string): string {
  try {
    return new Date(savedAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return savedAt;
  }
}

export function listSavedJobs(): SavedJobRecord[] {
  return Object.values(readRegistry()).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

export function saveJob(document: DGCDesignDocument): SavedJobRecord {
  const name = document.name.trim();
  if (!name) {
    throw new Error('Enter a job name before saving.');
  }

  const id = jobIdFromName(name);
  const registry = readRegistry();
  const record: SavedJobRecord = {
    id,
    name,
    document: touchDocument({ ...document, name }),
    savedAt: new Date().toISOString(),
  };
  registry[id] = record;
  writeRegistry(registry);
  writeLastJobId(id);
  return record;
}

export function loadJob(id: string): SavedJobRecord | null {
  const registry = readRegistry();
  const record = registry[id];
  if (!record?.document) return null;
  try {
    const document = parseDocumentJson(serializeDocument(record.document));
    writeLastJobId(id);
    return { ...record, document };
  } catch {
    return null;
  }
}

export function readInitialSavedJob(): {
  document: DGCDesignDocument;
  id: string;
} | null {
  if (typeof window === 'undefined') return null;
  const lastId = readLastJobId();
  if (!lastId) return null;
  const record = loadJob(lastId);
  if (!record) return null;
  return { document: record.document, id: record.id };
}

export function deleteJob(id: string): void {
  const registry = readRegistry();
  delete registry[id];
  writeRegistry(registry);
  if (readLastJobId() === id) {
    clearLastJobId();
  }
}

export function readLastJobId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LAST_JOB_ID_STORAGE_KEY);
}

export function writeLastJobId(id: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_JOB_ID_STORAGE_KEY, id);
}

export function clearLastJobId(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LAST_JOB_ID_STORAGE_KEY);
}
