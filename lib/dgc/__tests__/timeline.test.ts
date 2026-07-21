import { describe, expect, it } from 'vitest';
import { interpolateStates, timelineFrame } from '../timeline';
import { makeNewDocument, parseDocumentJson, serializeDocument } from '../document';
import type { SavedYearState } from '../types';
import { DEFAULT_CANVAS, syncFieldWidth } from '../types';
import { getWealthDataset } from '../wealth-data';
import { wealthRowToDesign } from '../wealth-data/to-design-state';

function makeState(year: number, startX: number, areaFraction: number): SavedYearState {
  return {
    id: `state-${year}`,
    year,
    label: String(year),
    datasetVersion: 'test',
    provenance: 'test',
    savedAt: new Date().toISOString(),
    canvas: syncFieldWidth({ ...DEFAULT_CANVAS }),
    layers: [
      {
        id: `layer-${year}`,
        name: `Layer ${year}`,
        isVisible: true,
        isLocked: false,
        startX,
        areaFraction,
        colorHex: '#2F7CE5',
      },
    ],
  };
}

describe('interpolateStates', () => {
  const a = makeState(1990, 2, 0.2);
  const b = makeState(2010, 6, 0.6);

  it('returns the endpoints at t=0 and t=1', () => {
    expect(interpolateStates(a, b, 0).layers[0].startX).toBe(2);
    expect(interpolateStates(a, b, 1).layers[0].startX).toBe(6);
    expect(interpolateStates(a, b, 0).currentYear).toBe(1990);
    expect(interpolateStates(a, b, 1).currentYear).toBe(2010);
  });

  it('lerps startX and areaFraction at the midpoint', () => {
    const mid = interpolateStates(a, b, 0.5);
    expect(mid.layers[0].startX).toBeCloseTo(4);
    expect(mid.layers[0].areaFraction).toBeCloseTo(0.4);
    expect(mid.currentYear).toBeCloseTo(2000);
  });

  it('clamps t outside [0, 1]', () => {
    expect(interpolateStates(a, b, -1).layers[0].startX).toBe(2);
    expect(interpolateStates(a, b, 2).layers[0].startX).toBe(6);
  });
});

describe('timelineFrame', () => {
  it('returns null with no states', () => {
    expect(timelineFrame([], 0.5)).toBeNull();
  });

  it('holds a single state regardless of progress', () => {
    const only = makeState(1975, 3, 0.3);
    expect(timelineFrame([only], 0.9)?.layers[0].startX).toBe(3);
  });

  it('maps progress proportionally to year gaps', () => {
    // 1990 -> 2000 -> 2020: the first segment is a third of the span.
    const states = [makeState(1990, 0, 0.1), makeState(2000, 3, 0.4), makeState(2020, 9, 0.7)];
    const third = timelineFrame(states, 1 / 3);
    expect(third?.currentYear).toBeCloseTo(2000, 5);
    expect(third?.layers[0].startX).toBeCloseTo(3, 5);
    const twoThirds = timelineFrame(states, 2 / 3);
    expect(twoThirds?.currentYear).toBeCloseTo(2010, 5);
    expect(twoThirds?.layers[0].startX).toBeCloseTo(6, 5);
  });

  it('sorts unsorted states before interpolating', () => {
    const states = [makeState(2020, 9, 0.7), makeState(1990, 0, 0.1)];
    expect(timelineFrame(states, 0)?.currentYear).toBe(1990);
    expect(timelineFrame(states, 1)?.currentYear).toBe(2020);
  });

  it('interpolates real wealth-year layer geometry with stable layer ids', () => {
    const dataset = getWealthDataset();
    const stateForYear = (year: number): SavedYearState => {
      const row = dataset.rows.find((entry) => entry.reportYear === year);
      if (!row) throw new Error(`Missing ${year}`);
      const design = wealthRowToDesign(row, dataset.version);
      return {
        id: `state-${year}`,
        year,
        label: String(year),
        datasetVersion: dataset.version,
        provenance: design.provenance,
        savedAt: new Date().toISOString(),
        canvas: design.canvas,
        layers: design.layers,
      };
    };

    const start = stateForYear(1965);
    const end = stateForYear(2025);
    const firstFrame = timelineFrame([start, end], 0);
    const midFrame = timelineFrame([start, end], 0.5);
    const lastFrame = timelineFrame([start, end], 1);

    expect(firstFrame?.layers.map((layer) => layer.id)).toEqual(
      midFrame?.layers.map((layer) => layer.id),
    );
    expect(firstFrame?.layers.map((layer) => layer.id)).toEqual(
      lastFrame?.layers.map((layer) => layer.id),
    );
    expect(midFrame?.layers[0].areaFraction).not.toBe(firstFrame?.layers[0].areaFraction);
    expect(lastFrame?.layers[0].areaFraction).not.toBe(firstFrame?.layers[0].areaFraction);
    expect(midFrame?.layers[3].areaFraction).toBeLessThan(
      firstFrame?.layers[3].areaFraction ?? 0,
    );
  });
});

describe('document timeline persistence', () => {
  it('round-trips timeline states through serialize/parse', () => {
    const document = makeNewDocument('Timeline Test');
    document.timelineStates = [makeState(2000, 3, 0.4), makeState(1990, 0, 0.1)];
    const parsed = parseDocumentJson(serializeDocument(document));
    expect(parsed.timelineStates).toHaveLength(2);
    // Normalized to chronological order.
    expect(parsed.timelineStates?.map((s) => s.year)).toEqual([1990, 2000]);
  });

  it('loads legacy documents without timelineStates as an empty list', () => {
    const document = makeNewDocument('Legacy');
    const raw = JSON.parse(serializeDocument(document));
    delete raw.timelineStates;
    const parsed = parseDocumentJson(JSON.stringify(raw));
    expect(parsed.timelineStates).toEqual([]);
  });

  it('drops malformed timeline entries on parse', () => {
    const document = makeNewDocument('Malformed');
    const raw = JSON.parse(serializeDocument(document));
    raw.timelineStates = [makeState(1990, 0, 0.1), { id: 'bad' }, null, { year: 2000 }];
    const parsed = parseDocumentJson(JSON.stringify(raw));
    expect(parsed.timelineStates).toHaveLength(1);
    expect(parsed.timelineStates?.[0].year).toBe(1990);
  });
});
