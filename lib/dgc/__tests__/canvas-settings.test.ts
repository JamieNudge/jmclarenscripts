import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CANVAS,
  contentWidth,
  effectiveFieldWidth,
  normalizeCanvas,
  syncFieldWidth,
} from '../types';

describe('CanvasSettings', () => {
  it('derives field width from total population and percent', () => {
    const canvas = syncFieldWidth({
      ...DEFAULT_CANVAS,
      totalPopulationWidth: 16,
      fieldOfWealthWidthPercent: 75,
    });
    expect(effectiveFieldWidth(canvas)).toBe(12);
    expect(canvas.fieldWidth).toBe(12);
    expect(contentWidth(canvas)).toBe(16);
  });

  it('migrates legacy documents without new fields', () => {
    const legacy = {
      fieldWidth: 10,
      fieldHeight: 8,
      leftMargin: 4,
      rightMargin: 1,
      topMargin: 1,
      bottomMargin: 0.5,
    } as typeof DEFAULT_CANVAS;

    const normalized = normalizeCanvas(legacy);
    expect(normalized.totalPopulationWidth).toBe(10);
    expect(normalized.fieldOfWealthWidthPercent).toBe(100);
    expect(normalized.totalPopulationLabel).toBe('Total Population');
    expect(normalized.totalPopulationHeight).toBe(0.5);
    expect(normalized.bottomMargin).toBe(0.5);
    expect(normalized.fieldWidth).toBe(10);
  });
});
