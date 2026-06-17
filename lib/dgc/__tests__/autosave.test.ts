import { describe, expect, it } from 'vitest';
import { makeNewDocument, serializeDocument } from '../document';
import { shouldOfferRestore, type AutosavePayload } from '../autosave';

describe('autosave', () => {
  it('offers restore when autosave is newer than the current document', () => {
    const current = makeNewDocument();
    const autosave: AutosavePayload = {
      document: {
        ...current,
        name: 'Recovered Design',
        updatedAt: new Date(Date.now() + 60_000).toISOString(),
      },
      savedAt: new Date(Date.now() + 60_000).toISOString(),
    };

    expect(shouldOfferRestore(current, autosave, serializeDocument(current))).toBe(
      true,
    );
  });

  it('does not offer restore when autosave matches saved baseline', () => {
    const current = makeNewDocument();
    const baseline = serializeDocument(current);
    const autosave: AutosavePayload = {
      document: current,
      savedAt: new Date().toISOString(),
    };

    expect(shouldOfferRestore(current, autosave, baseline)).toBe(false);
  });
});
