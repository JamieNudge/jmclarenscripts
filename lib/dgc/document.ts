import type {
  CanvasSettings,
  DesignLayer,
  DGCDesignDocument,
  LayerSolveState,
  SolverInput,
} from './types';
import {
  DEFAULT_CANVAS,
  DEFAULT_EXPORT_PREFERENCES,
  minStartX,
} from './types';
import { solve } from './partition-solver';

export function newLayerId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function makeDefaultLayer(index: number, canvas: CanvasSettings): DesignLayer {
  return {
    id: newLayerId(),
    name: `Layer ${index}`,
    isVisible: true,
    isLocked: false,
    startX: canvas.fieldWidth * 0.25,
    areaFraction: 0.35,
    colorHex: '#2F7CE5',
  };
}

export function makeNewDocument(name = 'Untitled Design'): DGCDesignDocument {
  const canvas = { ...DEFAULT_CANVAS };
  const layer = makeDefaultLayer(1, canvas);
  const now = new Date().toISOString();
  return {
    name,
    createdAt: now,
    updatedAt: now,
    canvas,
    layers: [layer],
    activeLayerID: layer.id,
    exportPreferences: { ...DEFAULT_EXPORT_PREFERENCES },
  };
}

export function touchDocument(document: DGCDesignDocument): DGCDesignDocument {
  return { ...document, updatedAt: new Date().toISOString() };
}

export function recalculateLayerStates(
  document: DGCDesignDocument,
): Record<string, LayerSolveState> {
  const states: Record<string, LayerSolveState> = {};
  for (const layer of document.layers) {
    const input: SolverInput = {
      width: document.canvas.fieldWidth,
      height: document.canvas.fieldHeight,
      startX: layer.startX,
      areaFraction: layer.areaFraction,
      minStartX: minStartX(document.canvas),
    };
    try {
      const result = solve(input);
      states[layer.id] = { input, result, errorMessage: null };
    } catch (error) {
      states[layer.id] = {
        input,
        result: null,
        errorMessage: error instanceof Error ? error.message : 'Solver failed.',
      };
    }
  }
  return states;
}

export function activeLayer(document: DGCDesignDocument): DesignLayer | undefined {
  return document.layers.find((layer) => layer.id === document.activeLayerID);
}

export function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function parseDocumentJson(raw: string): DGCDesignDocument {
  const parsed = JSON.parse(raw) as DGCDesignDocument;
  if (!parsed.layers?.length) {
    throw new Error('Invalid document: no layers.');
  }
  return parsed;
}

export function serializeDocument(document: DGCDesignDocument): string {
  return JSON.stringify(document, null, 2);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const SKETCH_PRESETS = [
  { id: 'low', title: '~8% Sketch Case', startX: 2.2, areaPercent: 8 },
  { id: 'mid', title: '~60% Sketch Case', startX: 4.0, areaPercent: 60 },
  { id: 'high', title: '~92% Sketch Case', startX: 7.2, areaPercent: 92 },
] as const;
