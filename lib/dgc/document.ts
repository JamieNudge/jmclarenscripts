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
  effectiveFieldWidth,
  minStartX,
  maxStartX,
  normalizeCanvas,
  normalizeExportPreferences,
  syncFieldWidth,
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
    startX: effectiveFieldWidth(canvas) * 0.25,
    areaFraction: 0.35,
    colorHex: '#2F7CE5',
  };
}

export function makeNewDocument(name = ''): DGCDesignDocument {
  const canvas = syncFieldWidth({ ...DEFAULT_CANVAS });
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
      width: effectiveFieldWidth(document.canvas),
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
  parsed.canvas = normalizeCanvas(parsed.canvas);
  parsed.exportPreferences = normalizeExportPreferences(parsed.exportPreferences);
  const maxStart = maxStartX(parsed.canvas);
  for (const layer of parsed.layers) {
    layer.startX = Math.min(Math.max(layer.startX, 0), maxStart);
  }
  return parsed;
}

export function serializeDocument(document: DGCDesignDocument): string {
  return JSON.stringify(document, null, 2);
}

const DOWNLOAD_REVOKE_DELAY_MS = 1000;

export function jobNameFromFileName(fileName: string): string {
  const base = fileName.replace(/\.dgcjson$/i, '').trim();
  return base.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

export function designDownloadFilename(name: string): string {
  const trimmed = (name.trim() || 'job-settings').replace(/\s+/g, '-');
  return trimmed.toLowerCase().endsWith('.dgcjson') ? trimmed : `${trimmed}.dgcjson`;
}

export function exportDownloadFilename(name: string, ext: string): string {
  const base = (name.trim() || 'job').replace(/\s+/g, '-').toLowerCase();
  return `${base}.${ext}`;
}

export function downloadBlob(blob: Blob, filename: string): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_REVOKE_DELAY_MS);
  return true;
}

export const SKETCH_PRESETS = [
  { id: 'low', title: '~8% Sketch Case', startX: 2.2, areaPercent: 8 },
  { id: 'mid', title: '~60% Sketch Case', startX: 4.0, areaPercent: 60 },
  { id: 'high', title: '~92% Sketch Case', startX: 7.2, areaPercent: 92 },
] as const;
