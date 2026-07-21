export type PartitionEdge = 'left' | 'top' | 'right';

export const PARTITION_EDGES: PartitionEdge[] = ['left', 'top', 'right'];

export function edgeDisplayName(edge: PartitionEdge): string {
  return edge.charAt(0).toUpperCase() + edge.slice(1);
}

export interface SolverInput {
  width: number;
  height: number;
  startX: number;
  areaFraction: number;
  minStartX: number;
}

export interface PartitionResult {
  edge: PartitionEdge;
  endX: number;
  endY: number;
  targetArea: number;
  computedArea: number;
  areaFraction: number;
}

export interface LayerSolveState {
  input: SolverInput;
  result: PartitionResult | null;
  errorMessage: string | null;
}

export const DEFAULT_TOTAL_POPULATION_LABEL = 'Total Population';
export const DEFAULT_TOTAL_POPULATION_COLOR_HEX = '#FF9500';

export interface CanvasSettings {
  /** Derived from totalPopulationWidth × fieldOfWealthWidthPercent; kept for document compatibility. */
  fieldWidth: number;
  fieldHeight: number;
  leftMargin: number;
  rightMargin: number;
  topMargin: number;
  /** @deprecated Use totalPopulationHeight; kept for document compatibility. */
  bottomMargin: number;
  totalPopulationWidth: number;
  totalPopulationHeight: number;
  fieldOfWealthWidthPercent: number;
  totalPopulationLabel: string;
  totalPopulationColorHex: string;
}

export const DEFAULT_CANVAS: CanvasSettings = {
  fieldWidth: 12,
  fieldHeight: 8,
  leftMargin: 0,
  rightMargin: 1,
  topMargin: 1,
  bottomMargin: 0.5,
  totalPopulationWidth: 12,
  totalPopulationHeight: 0.5,
  fieldOfWealthWidthPercent: 100,
  totalPopulationLabel: DEFAULT_TOTAL_POPULATION_LABEL,
  totalPopulationColorHex: DEFAULT_TOTAL_POPULATION_COLOR_HEX,
};

export function fieldOriginY(canvas: CanvasSettings): number {
  return canvas.totalPopulationHeight;
}

export function effectiveFieldWidth(canvas: CanvasSettings): number {
  return canvas.totalPopulationWidth * (canvas.fieldOfWealthWidthPercent / 100);
}

export function contentWidth(canvas: CanvasSettings): number {
  return Math.max(effectiveFieldWidth(canvas), canvas.totalPopulationWidth);
}

export function syncFieldWidth(canvas: CanvasSettings): CanvasSettings {
  return { ...canvas, fieldWidth: effectiveFieldWidth(canvas) };
}

export function normalizeCanvas(canvas: CanvasSettings): CanvasSettings {
  const totalPopulationWidth =
    canvas.totalPopulationWidth > 0 ? canvas.totalPopulationWidth : canvas.fieldWidth;
  const fieldOfWealthWidthPercent =
    canvas.fieldOfWealthWidthPercent > 0
      ? canvas.fieldOfWealthWidthPercent
      : totalPopulationWidth > 0
        ? (canvas.fieldWidth / totalPopulationWidth) * 100
        : 100;
  const totalPopulationLabel =
    canvas.totalPopulationLabel?.trim() || DEFAULT_TOTAL_POPULATION_LABEL;
  const totalPopulationColorHex =
    canvas.totalPopulationColorHex?.trim() || DEFAULT_TOTAL_POPULATION_COLOR_HEX;
  const totalPopulationHeight =
    canvas.totalPopulationHeight > 0
      ? canvas.totalPopulationHeight
      : canvas.bottomMargin > 0
        ? canvas.bottomMargin
        : DEFAULT_CANVAS.totalPopulationHeight;

  return syncFieldWidth({
    ...canvas,
    leftMargin: 0,
    totalPopulationWidth,
    totalPopulationHeight,
    bottomMargin: totalPopulationHeight,
    fieldOfWealthWidthPercent,
    totalPopulationLabel,
    totalPopulationColorHex,
  });
}

export function canvasWidth(canvas: CanvasSettings): number {
  return contentWidth(canvas) + canvas.rightMargin;
}

export function canvasHeight(canvas: CanvasSettings): number {
  return canvas.totalPopulationHeight + canvas.fieldHeight + canvas.topMargin;
}

export function minStartX(_canvas: CanvasSettings): number {
  return 0;
}

export function maxStartX(canvas: CanvasSettings): number {
  return effectiveFieldWidth(canvas);
}

export interface DesignLayer {
  id: string;
  name: string;
  isVisible: boolean;
  isLocked: boolean;
  startX: number;
  areaFraction: number;
  colorHex: string;
}

export type ExportFormatPreference = 'png' | 'svg' | 'pdf';

export interface ExportPreferences {
  preferredFormat: ExportFormatPreference;
  pngScale: number;
  pngTransparentBackground: boolean;
}

export const DEFAULT_EXPORT_PREFERENCES: ExportPreferences = {
  preferredFormat: 'png',
  pngScale: 2,
  pngTransparentBackground: true,
};

export function normalizeExportPreferences(
  preferences: Partial<ExportPreferences> | undefined,
): ExportPreferences {
  return {
    preferredFormat: preferences?.preferredFormat ?? DEFAULT_EXPORT_PREFERENCES.preferredFormat,
    pngScale: preferences?.pngScale ?? DEFAULT_EXPORT_PREFERENCES.pngScale,
    pngTransparentBackground:
      preferences?.pngTransparentBackground ??
      DEFAULT_EXPORT_PREFERENCES.pngTransparentBackground,
  };
}

/** A saved diagram snapshot for one dataset year, used by the timeline player. */
export interface SavedYearState {
  id: string;
  year: number;
  label: string;
  datasetVersion: string;
  provenance: string;
  savedAt: string;
  canvas: CanvasSettings;
  layers: DesignLayer[];
}

export interface DGCDesignDocument {
  name: string;
  createdAt: string;
  updatedAt: string;
  canvas: CanvasSettings;
  layers: DesignLayer[];
  activeLayerID: string;
  exportPreferences: ExportPreferences;
  /** Optional in stored JSON for backward compatibility; normalized to []. */
  timelineStates?: SavedYearState[];
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export interface Rect2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DrawContext {
  layout: import('./canvas-layout').CanvasLayout;
  document: DGCDesignDocument;
  layerStates: Record<string, LayerSolveState>;
  activeLayerID: string;
  exportWholeComposition: boolean;
  transparentBackground?: boolean;
}

export type PartitionSolverErrorCode =
  | 'invalidWidth'
  | 'invalidHeight'
  | 'invalidStartX'
  | 'invalidAreaFraction'
  | 'unsolvedEdge';

export class PartitionSolverError extends Error {
  constructor(public code: PartitionSolverErrorCode, message: string) {
    super(message);
    this.name = 'PartitionSolverError';
  }
}
