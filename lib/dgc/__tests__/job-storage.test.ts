import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeNewDocument } from '../document';
import {
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
});
