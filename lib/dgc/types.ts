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

export interface CanvasSettings {
  /** Derived from totalPopulationWidth × fieldOfWealthWidthPercent; kept for document compatibility. */
  fieldWidth: number;
  fieldHeight: number;
  leftMargin: number;
  rightMargin: number;
  topMargin: number;
  bottomMargin: number;
  totalPopulationWidth: number;
  fieldOfWealthWidthPercent: number;
  totalPopulationLabel: string;
}

export const DEFAULT_CANVAS: CanvasSettings = {
  fieldWidth: 12,
  fieldHeight: 8,
  leftMargin: 4,
  rightMargin: 1,
  topMargin: 1,
  bottomMargin: 0.5,
  totalPopulationWidth: 12,
  fieldOfWealthWidthPercent: 100,
  totalPopulationLabel: DEFAULT_TOTAL_POPULATION_LABEL,
};

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

  return syncFieldWidth({
    ...canvas,
    totalPopulationWidth,
    fieldOfWealthWidthPercent,
    totalPopulationLabel,
  });
}

export function canvasWidth(canvas: CanvasSettings): number {
  return canvas.leftMargin + contentWidth(canvas) + canvas.rightMargin;
}

export function canvasHeight(canvas: CanvasSettings): number {
  return canvas.bottomMargin + canvas.fieldHeight + canvas.topMargin;
}

export function minStartX(canvas: CanvasSettings): number {
  return -canvas.leftMargin;
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
}

export const DEFAULT_EXPORT_PREFERENCES: ExportPreferences = {
  preferredFormat: 'png',
  pngScale: 2,
};

export interface DGCDesignDocument {
  name: string;
  createdAt: string;
  updatedAt: string;
  canvas: CanvasSettings;
  layers: DesignLayer[];
  activeLayerID: string;
  exportPreferences: ExportPreferences;
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
