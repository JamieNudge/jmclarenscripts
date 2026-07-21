import { describe, expect, it } from 'vitest';
import { getWealthDataset } from '../wealth-data';
import {
  WEALTH_LAYER_BLUEPRINT,
  wealthRowToDesign,
  wealthYearEligibility,
} from '../wealth-data/to-design-state';
import { effectiveFieldWidth } from '../types';
import { recalculateLayerStates } from '../document';

const dataset = getWealthDataset();

function row(year: number) {
  const found = dataset.rows.find((r) => r.reportYear === year);
  if (!found) throw new Error(`no row for ${year}`);
  return found;
}

describe('wealthYearEligibility', () => {
  it('rejects years without verified bottom-half shares', () => {
    for (const year of [1920, 1940, 1960]) {
      const result = wealthYearEligibility(row(year));
      expect(result.eligible, String(year)).toBe(false);
      expect(result.reason).toContain(String(year));
    }
  });

  it('accepts years with a complete share breakdown', () => {
    for (const year of [1965, 1990, 2025]) {
      expect(wealthYearEligibility(row(year)).eligible, String(year)).toBe(true);
    }
  });
});

describe('wealthRowToDesign', () => {
  it('throws for incomplete years instead of inventing data', () => {
    expect(() => wealthRowToDesign(row(1930), dataset.version)).toThrow(/1930/);
  });

  it('builds four layers at the canonical percentile boundaries', () => {
    const design = wealthRowToDesign(row(2020), dataset.version);
    expect(design.layers).toHaveLength(4);
    expect(design.layers.map((layer) => layer.startX)).toEqual(
      WEALTH_LAYER_BLUEPRINT.map((blueprint) => blueprint.boundary),
    );
  });

  it('uses cumulative bottom wealth shares as area targets', () => {
    const r = row(2020);
    const design = wealthRowToDesign(r, dataset.version);
    const bottom50 = r.shareBottom50Pct.value as number;
    const cumulative90 = bottom50 + (r.share50to90Pct.value as number);
    expect(design.layers[0].areaFraction).toBeCloseTo(bottom50 / 100, 5);
    expect(design.layers[1].areaFraction).toBeCloseTo(cumulative90 / 100, 5);
    // Cumulative shares must increase strictly.
    for (let index = 1; index < design.layers.length; index += 1) {
      expect(design.layers[index].areaFraction).toBeGreaterThan(
        design.layers[index - 1].areaFraction,
      );
    }
    // Bottom 99.9% share is below 100%.
    expect(design.layers[3].areaFraction).toBeLessThan(1);
  });

  it('normalises the population axis to 0-100', () => {
    const design = wealthRowToDesign(row(1990), dataset.version);
    expect(effectiveFieldWidth(design.canvas)).toBe(100);
    expect(design.canvas.totalPopulationLabel).toContain('1990');
  });

  it('produces layers the partition solver can solve', () => {
    for (const year of [1965, 1985, 2010, 2025]) {
      const design = wealthRowToDesign(row(year), dataset.version);
      const states = recalculateLayerStates({
        name: '',
        createdAt: '',
        updatedAt: '',
        canvas: design.canvas,
        layers: design.layers,
        activeLayerID: design.layers[0].id,
        exportPreferences: {
          preferredFormat: 'png',
          pngScale: 2,
          pngTransparentBackground: true,
        },
      });
      for (const layer of design.layers) {
        expect(states[layer.id].result, `${year} ${layer.name}`).not.toBeNull();
      }
    }
  });

  it('carries provenance and metadata for display', () => {
    const design = wealthRowToDesign(row(2000), dataset.version);
    expect(design.provenance).toContain(dataset.version);
    expect(design.metadata.sourceNames.length).toBeGreaterThan(0);
    expect(design.metadata.populationLabel).toBeTruthy();
    expect(design.metadata.totalWealthLabel).toBeTruthy();
  });
});
