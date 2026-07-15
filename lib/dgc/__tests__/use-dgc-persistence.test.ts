import { describe, expect, it } from 'vitest';
import { describeSaveState } from '../use-dgc-persistence';

describe('describeSaveState', () => {
  it('reports ready for a fresh unsaved document', () => {
    expect(
      describeSaveState({
        baseline: 'doc-a',
        browserSavedBaseline: null,
        computerFileName: null,
        fileSavedBaseline: null,
        serializedDocument: 'doc-a',
      }),
    ).toEqual({ isDirty: false, label: 'Ready' });
  });

  it('reports unsaved changes when no saved checkpoint matches', () => {
    expect(
      describeSaveState({
        baseline: 'doc-a',
        browserSavedBaseline: null,
        computerFileName: null,
        fileSavedBaseline: null,
        serializedDocument: 'doc-b',
      }),
    ).toEqual({ isDirty: true, label: 'Unsaved changes' });
  });

  it('reports browser backups separately from Mac saves', () => {
    expect(
      describeSaveState({
        baseline: 'doc-a',
        browserSavedBaseline: 'doc-a',
        computerFileName: null,
        fileSavedBaseline: null,
        serializedDocument: 'doc-a',
      }),
    ).toEqual({ isDirty: false, label: 'Backed up in this browser' });
  });

  it('reports Mac saves when the disk baseline matches', () => {
    expect(
      describeSaveState({
        baseline: 'doc-a',
        browserSavedBaseline: 'doc-a',
        computerFileName: 'design.dgcjson',
        fileSavedBaseline: 'doc-a',
        serializedDocument: 'doc-a',
      }),
    ).toEqual({ isDirty: false, label: 'Saved to your Mac' });
  });

  it('warns when browser backup is newer than the Mac file', () => {
    expect(
      describeSaveState({
        baseline: 'doc-b',
        browserSavedBaseline: 'doc-b',
        computerFileName: 'design.dgcjson',
        fileSavedBaseline: 'doc-a',
        serializedDocument: 'doc-b',
      }),
    ).toEqual({
      isDirty: true,
      label: 'Backed up in this browser; Mac file needs saving',
    });
  });
});
