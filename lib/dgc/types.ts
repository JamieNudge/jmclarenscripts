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

export interface CanvasSettings {
  fieldWidth: number;
  fieldHeight: number;
  leftMargin: number;
  rightMargin: number;
  topMargin: number;
  bottomMargin: number;
}

export const DEFAULT_CANVAS: CanvasSettings = {
  fieldWidth: 12,
  fieldHeight: 8,
  leftMargin: 4,
  rightMargin: 1,
  topMargin: 1,
  bottomMargin: 0.5,
};

export function canvasWidth(canvas: CanvasSettings): number {
  return canvas.leftMargin + canvas.fieldWidth + canvas.rightMargin;
}

export function canvasHeight(canvas: CanvasSettings): number {
  return canvas.bottomMargin + canvas.fieldHeight + canvas.topMargin;
}

export function minStartX(canvas: CanvasSettings): number {
  return -canvas.leftMargin;
}

export function maxStartX(canvas: CanvasSettings): number {
  return canvas.fieldWidth;
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
