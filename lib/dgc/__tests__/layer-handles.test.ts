import { describe, expect, it } from 'vitest';
import {
  canAddLayer,
  layerHandleLabels,
  layerHandlePairLabel,
  MAX_LAYERS,
} from '../layer-handles';

describe('layerHandles', () => {
  it('assigns sequential letter pairs per layer index', () => {
    expect(layerHandleLabels(0)).toEqual({ start: 'A', end: 'B' });
    expect(layerHandleLabels(1)).toEqual({ start: 'C', end: 'D' });
    expect(layerHandleLabels(2)).toEqual({ start: 'E', end: 'F' });
    expect(layerHandlePairLabel(11)).toBe('W/X');
  });

  it('caps designs at twelve layers', () => {
    expect(MAX_LAYERS).toBe(12);
    expect(canAddLayer(11)).toBe(true);
    expect(canAddLayer(12)).toBe(false);
  });
});
