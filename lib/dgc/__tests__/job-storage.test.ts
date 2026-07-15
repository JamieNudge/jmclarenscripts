import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeNewDocument } from '../document';
import {
  deleteJob,
  jobIdFromName,
  LAST_JOB_ID_STORAGE_KEY,
  listSavedJobs,
  loadJob,
  readInitialSavedJob,
  saveJob,
  SAVED_JOBS_STORAGE_KEY,
} from '../job-storage';

describe('job-storage', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
      },
    });
  });

  it('creates stable ids from job names', () => {
    expect(jobIdFromName('Diana 8% sketch')).toBe('diana-8-sketch');
  });

  it('saves and loads jobs in browser storage', () => {
    const document = makeNewDocument('Diana 8% sketch');
    const saved = saveJob(document);

    expect(saved.name).toBe('Diana 8% sketch');
    expect(listSavedJobs()).toHaveLength(1);

    const loaded = loadJob(saved.id);
    expect(loaded?.document.name).toBe('Diana 8% sketch');
    expect(loaded?.document.layers).toHaveLength(1);
  });

  it('keeps same-name jobs as separate browser saves', () => {
    const first = saveJob(makeNewDocument('Case A'));
    const second = saveJob(makeNewDocument('Case A'));

    expect(first.id).not.toBe(second.id);
    expect(listSavedJobs()).toHaveLength(2);
    expect(listSavedJobs().map((job) => job.name)).toEqual(['Case A', 'Case A']);
  });

  it('updates an existing browser save when an id is provided', () => {
    const original = saveJob(makeNewDocument('Case A'));
    const updatedDocument = makeNewDocument('Case A');
    updatedDocument.layers[0].startX = 7.5;

    const updated = saveJob(updatedDocument, { id: original.id });

    expect(updated.id).toBe(original.id);
    expect(listSavedJobs()).toHaveLength(1);
    expect(loadJob(original.id)?.document.layers[0].startX).toBe(7.5);
  });

  it('requires a job name before saving', () => {
    expect(() => saveJob(makeNewDocument(''))).toThrow('Enter a job name');
  });

  it('remembers the last opened job id', () => {
    const document = makeNewDocument('Case A');
    const saved = saveJob(document);
    loadJob(saved.id);

    expect(window.localStorage.getItem(LAST_JOB_ID_STORAGE_KEY)).toBe(saved.id);
    expect(window.localStorage.getItem(SAVED_JOBS_STORAGE_KEY)).toContain('Case A');
  });

  it('reads the last saved job on startup', () => {
    const document = makeNewDocument('Startup job');
    const saved = saveJob(document);
    const initial = readInitialSavedJob();

    expect(initial?.id).toBe(saved.id);
    expect(initial?.document.name).toBe('Startup job');
  });

  it('loads legacy slug-keyed jobs from browser storage', () => {
    const legacyId = jobIdFromName('Legacy Job');
    const legacyDocument = makeNewDocument('Legacy Job');
    window.localStorage.setItem(
      SAVED_JOBS_STORAGE_KEY,
      JSON.stringify({
        [legacyId]: {
          id: legacyId,
          name: 'Legacy Job',
          document: legacyDocument,
          savedAt: new Date().toISOString(),
        },
      }),
    );
    window.localStorage.setItem(LAST_JOB_ID_STORAGE_KEY, legacyId);

    expect(loadJob(legacyId)?.document.name).toBe('Legacy Job');
    expect(readInitialSavedJob()?.id).toBe(legacyId);
  });

  it('deletes saved jobs and clears last id when needed', () => {
    const saved = saveJob(makeNewDocument('Delete me'));

    deleteJob(saved.id);

    expect(listSavedJobs()).toHaveLength(0);
    expect(window.localStorage.getItem(LAST_JOB_ID_STORAGE_KEY)).toBeNull();
  });
});
