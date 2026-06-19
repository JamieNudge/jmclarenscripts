import { describe, expect, it } from 'vitest';
import {
  canAddLayer,
  layerHandleLabels,
  layerHandlePairLabel,
  MAX_LAYERS,
} from '../layer-handles';

describe('layerHandles', () => {
  it('assigns letter and numbered end label per layer index', () => {
    expect(layerHandleLabels(0)).toEqual({ start: 'A', end: 'A1' });
    expect(layerHandleLabels(1)).toEqual({ start: 'B', end: 'B1' });
    expect(layerHandleLabels(2)).toEqual({ start: 'C', end: 'C1' });
    expect(layerHandlePairLabel(11)).toBe('L/L1');
  });

  it('caps designs at twelve layers', () => {
    expect(MAX_LAYERS).toBe(12);
    expect(canAddLayer(11)).toBe(true);
    expect(canAddLayer(12)).toBe(false);
  });
});
