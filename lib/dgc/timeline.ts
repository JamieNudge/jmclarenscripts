import type { CanvasSettings, DesignLayer, SavedYearState } from './types';
import { syncFieldWidth } from './types';

/**
 * Pure interpolation between saved yearly states for timeline playback.
 * Progress is mapped proportionally to the year gaps so 20 years of change
 * take twice as long as 10, regardless of how many states were saved.
 */

export interface TimelineFrame {
  canvas: CanvasSettings;
  layers: DesignLayer[];
  fromYear: number;
  toYear: number;
  /** Fractional year at this frame, e.g. 1972.5. */
  currentYear: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpCanvas(a: CanvasSettings, b: CanvasSettings, t: number): CanvasSettings {
  return syncFieldWidth({
    ...(t < 0.5 ? a : b),
    fieldHeight: lerp(a.fieldHeight, b.fieldHeight, t),
    rightMargin: lerp(a.rightMargin, b.rightMargin, t),
    topMargin: lerp(a.topMargin, b.topMargin, t),
    bottomMargin: lerp(a.bottomMargin, b.bottomMargin, t),
    totalPopulationWidth: lerp(a.totalPopulationWidth, b.totalPopulationWidth, t),
    totalPopulationHeight: lerp(a.totalPopulationHeight, b.totalPopulationHeight, t),
    fieldOfWealthWidthPercent: lerp(a.fieldOfWealthWidthPercent, b.fieldOfWealthWidthPercent, t),
  });
}

function lerpLayers(a: DesignLayer[], b: DesignLayer[], t: number): DesignLayer[] {
  const count = Math.min(a.length, b.length);
  const layers: DesignLayer[] = [];
  for (let index = 0; index < count; index += 1) {
    const nearest = t < 0.5 ? a[index] : b[index];
    layers.push({
      ...nearest,
      startX: lerp(a[index].startX, b[index].startX, t),
      areaFraction: lerp(a[index].areaFraction, b[index].areaFraction, t),
    });
  }
  return layers;
}

export function interpolateStates(
  a: SavedYearState,
  b: SavedYearState,
  t: number,
): TimelineFrame {
  const clamped = Math.min(Math.max(t, 0), 1);
  return {
    canvas: lerpCanvas(a.canvas, b.canvas, clamped),
    layers: lerpLayers(a.layers, b.layers, clamped),
    fromYear: a.year,
    toYear: b.year,
    currentYear: lerp(a.year, b.year, clamped),
  };
}

/** Map a global progress value in [0, 1] onto the year span of the states. */
export function timelineFrame(states: SavedYearState[], progress: number): TimelineFrame | null {
  if (states.length === 0) return null;
  const sorted = [...states].sort((left, right) => left.year - right.year);
  if (sorted.length === 1) {
    return interpolateStates(sorted[0], sorted[0], 0);
  }
  const clamped = Math.min(Math.max(progress, 0), 1);
  const firstYear = sorted[0].year;
  const lastYear = sorted[sorted.length - 1].year;
  const span = lastYear - firstYear;
  if (span <= 0) {
    return interpolateStates(sorted[0], sorted[sorted.length - 1], clamped);
  }
  const targetYear = firstYear + span * clamped;
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const a = sorted[index];
    const b = sorted[index + 1];
    if (targetYear <= b.year || index === sorted.length - 2) {
      const segmentSpan = b.year - a.year;
      const t = segmentSpan > 0 ? (targetYear - a.year) / segmentSpan : 0;
      return interpolateStates(a, b, t);
    }
  }
  return interpolateStates(sorted[sorted.length - 1], sorted[sorted.length - 1], 0);
}
