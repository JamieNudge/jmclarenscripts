import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  designDownloadFilename,
  downloadBlob,
  exportDownloadFilename,
  makeNewDocument,
  parseDocumentJson,
  serializeDocument,
} from '../document';
import { parseDesignFile } from '../file-access';

describe('document I/O', () => {
  it('round-trips documents through JSON', () => {
    const original = makeNewDocument('Test Design');
    const parsed = parseDocumentJson(serializeDocument(original));
    expect(parsed.name).toBe('Test Design');
    expect(parsed.layers).toHaveLength(1);
    expect(parsed.canvas.fieldHeight).toBe(original.canvas.fieldHeight);
  });

  it('rejects documents without layers', () => {
    expect(() => parseDocumentJson(JSON.stringify({ name: 'x', layers: [] }))).toThrow(
      'Invalid document: no layers.',
    );
  });

  it('builds design filenames', () => {
    expect(designDownloadFilename('My Design')).toBe('My-Design.dgcjson');
    expect(designDownloadFilename('already.dgcjson')).toBe('already.dgcjson');
  });

  it('builds export filenames', () => {
    expect(exportDownloadFilename('My Design', 'png')).toBe('my-design.png');
  });

  it('rejects HTML files saved from the browser', () => {
    expect(() => parseDesignFile(new File(['<html></html>'], 'page.html'), '<html></html>')).toThrow(
      'saved webpage',
    );
  });
});

describe('downloadBlob', () => {
  let appendChild: ReturnType<typeof vi.spyOn>;
  let removeChild: ReturnType<typeof vi.spyOn>;
  let clicked = false;
  let mockBody: { appendChild: ReturnType<typeof vi.fn>; removeChild: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    clicked = false;
    mockBody = {
      appendChild: vi.fn((node: Node) => {
        const anchor = node as HTMLAnchorElement;
        anchor.click = () => {
          clicked = true;
        };
        return node;
      }),
      removeChild: vi.fn((node: Node) => node),
    };

    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn(),
      }),
    );
    vi.stubGlobal('document', {
      body: mockBody,
      createElement: vi.fn(() => {
        const anchor = {
          href: '',
          download: '',
          style: { display: '' },
          click: () => {
            clicked = true;
          },
        } as unknown as HTMLAnchorElement;
        return anchor;
      }),
    });
    vi.stubGlobal('window', globalThis);

    appendChild = vi.spyOn(mockBody, 'appendChild');
    removeChild = vi.spyOn(mockBody, 'removeChild');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('attaches anchor, clicks, and revokes after delay', () => {
    const blob = new Blob(['test'], { type: 'text/plain' });
    const ok = downloadBlob(blob, 'test.txt');

    expect(ok).toBe(true);
    expect(clicked).toBe(true);
    expect(appendChild).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);

    vi.advanceTimersByTime(1000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});
