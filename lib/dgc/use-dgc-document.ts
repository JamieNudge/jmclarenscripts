import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  activeLayer,
  makeDefaultLayer,
  makeNewDocument,
  newLayerId,
  normalizeTimelineStates,
  recalculateLayerStates,
  SKETCH_PRESETS,
  touchDocument,
} from './document';
import {
  canAddLayer,
  layerHandleLabelsForId,
  layerHandlePairLabel,
  MAX_LAYERS,
} from './layer-handles';
import {
  addCustomSketchPreset,
  deleteCustomSketchPreset,
  loadCustomSketchPresets,
  newCustomSketchPresetId,
  updateCustomSketchPreset,
  type CustomSketchPreset,
} from './sketch-preset-store';
import { areaForRegion, solve } from './partition-solver';
import type {
  CanvasSettings,
  DesignLayer,
  DGCDesignDocument,
  LayerSolveState,
  PartitionEdge,
  SavedYearState,
} from './types';
import { maxStartX, effectiveFieldWidth, normalizeCanvas, normalizeExportPreferences, syncFieldWidth } from './types';
import type { WealthYearDesign } from './wealth-data/to-design-state';

export interface TransientPreview {
  canvas: CanvasSettings;
  layers: DesignLayer[];
  layerStates: Record<string, LayerSolveState>;
  label: string;
}

const MIN_FRACTION = 0.0001;
const MAX_FRACTION = 0.9999;

export function useDgcDocument(initial?: DGCDesignDocument) {
  const [document, setDocument] = useState<DGCDesignDocument>(
    initial ?? makeNewDocument(),
  );
  const [exportWholeComposition, setExportWholeComposition] = useState(true);
  const [customSketchPresets, setCustomSketchPresets] = useState<CustomSketchPreset[]>([]);
  const [copyResultConfirmationVisible, setCopyResultConfirmationVisible] = useState(false);
  const [transientPreview, setTransientPreviewState] = useState<TransientPreview | null>(null);

  useEffect(() => {
    setCustomSketchPresets(loadCustomSketchPresets());
  }, []);

  const layerStates = useMemo(
    () => recalculateLayerStates(document),
    [document],
  );

  const mutate = useCallback((mutation: (draft: DGCDesignDocument) => void) => {
    setDocument((current) => {
      const draft = structuredClone(current);
      mutation(draft);
      return touchDocument(draft);
    });
  }, []);

  const replaceDocument = useCallback((next: DGCDesignDocument) => {
    const canvas = normalizeCanvas(next.canvas);
    const maxStart = maxStartX(canvas);
    const layers = next.layers.map((layer) => ({
      ...layer,
      startX: Math.min(Math.max(layer.startX, 0), maxStart),
    }));
    setTransientPreviewState(null);
    setDocument({
      ...next,
      canvas,
      layers,
      exportPreferences: normalizeExportPreferences(next.exportPreferences),
      timelineStates: normalizeTimelineStates(next.timelineStates),
    });
  }, []);

  const updateTotalPopulationWidth = useCallback(
    (value: number) => {
      mutate((d) => {
        d.canvas.totalPopulationWidth = Math.max(0, value);
        d.canvas = syncFieldWidth(d.canvas);
      });
    },
    [mutate],
  );

  const updateFieldOfWealthWidthPercent = useCallback(
    (value: number) => {
      mutate((d) => {
        d.canvas.fieldOfWealthWidthPercent = Math.max(0, value);
        d.canvas = syncFieldWidth(d.canvas);
      });
    },
    [mutate],
  );

  const updateTotalPopulationLabel = useCallback(
    (label: string) => {
      mutate((d) => {
        d.canvas.totalPopulationLabel = label;
      });
    },
    [mutate],
  );

  const updateTotalPopulationColorHex = useCallback(
    (colorHex: string) => {
      mutate((d) => {
        d.canvas.totalPopulationColorHex = colorHex;
      });
    },
    [mutate],
  );

  const updateTotalPopulationHeight = useCallback(
    (value: number) => {
      mutate((d) => {
        d.canvas.totalPopulationHeight = Math.max(0, value);
        d.canvas.bottomMargin = d.canvas.totalPopulationHeight;
      });
    },
    [mutate],
  );

  const updateFieldHeight = useCallback(
    (value: number) => mutate((d) => { d.canvas.fieldHeight = value; }),
    [mutate],
  );

  const updateStartX = useCallback(
    (value: number) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === d.activeLayerID);
        if (index < 0) return;
        d.layers[index].startX = Math.min(
          Math.max(value, 0),
          maxStartX(d.canvas),
        );
      });
    },
    [mutate],
  );

  const updateAreaFraction = useCallback(
    (value: number) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === d.activeLayerID);
        if (index < 0) return;
        d.layers[index].areaFraction = Math.min(
          Math.max(value, MIN_FRACTION),
          MAX_FRACTION,
        );
      });
    },
    [mutate],
  );

  const updateLayerAreaFraction = useCallback(
    (layerId: string, value: number) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === layerId);
        if (index < 0) return;
        d.layers[index].areaFraction = Math.min(
          Math.max(value, MIN_FRACTION),
          MAX_FRACTION,
        );
      });
    },
    [mutate],
  );

  const updateLayerStartX = useCallback(
    (layerId: string, value: number) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === layerId);
        if (index < 0) return;
        d.layers[index].startX = Math.min(
          Math.max(value, 0),
          maxStartX(d.canvas),
        );
      });
    },
    [mutate],
  );

  const moveLayerTowardFront = useCallback(
    (layerId: string) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === layerId);
        if (index < 0 || index >= d.layers.length - 1) return;
        const next = [...d.layers];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        d.layers = next;
      });
    },
    [mutate],
  );

  const moveLayerTowardBack = useCallback(
    (layerId: string) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === layerId);
        if (index <= 0) return;
        const next = [...d.layers];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        d.layers = next;
      });
    },
    [mutate],
  );

  const updateAreaFromPreview = useCallback(
    (endX: number, endY: number, edge: PartitionEdge) => {
      const layer = activeLayer(document);
      if (!layer) return;
      const computedArea = areaForRegion(
        effectiveFieldWidth(document.canvas),
        document.canvas.fieldHeight,
        layer.startX,
        edge,
        endX,
        endY,
      );
      const total =
        effectiveFieldWidth(document.canvas) * document.canvas.fieldHeight;
      if (total <= 0) return;
      updateAreaFraction(
        Math.min(Math.max(computedArea / total, MIN_FRACTION), MAX_FRACTION),
      );
    },
    [document, updateAreaFraction],
  );

  const applyPreset = useCallback(
    (preset: (typeof SKETCH_PRESETS)[number]) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === d.activeLayerID);
        if (index < 0) return;
        d.layers[index].startX = preset.startX;
        d.layers[index].areaFraction = preset.areaPercent / 100;
      });
    },
    [mutate],
  );

  const applyCustomPreset = useCallback(
    (preset: CustomSketchPreset) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === d.activeLayerID);
        if (index < 0) return;
        d.layers[index].startX = preset.startX;
        d.layers[index].areaFraction = preset.areaPercent / 100;
      });
    },
    [mutate],
  );

  const saveActiveLayerAsCustomPreset = useCallback(
    (title: string) => {
      const layer = activeLayer(document);
      const trimmed = title.trim();
      if (!layer || !trimmed) return;
      const preset: CustomSketchPreset = {
        id: newCustomSketchPresetId(),
        title: trimmed,
        startX: layer.startX,
        areaPercent: layer.areaFraction * 100,
      };
      setCustomSketchPresets(addCustomSketchPreset(preset));
    },
    [document],
  );

  const updateCustomPreset = useCallback((preset: CustomSketchPreset) => {
    setCustomSketchPresets(updateCustomSketchPreset(preset));
  }, []);

  const deleteCustomPreset = useCallback((id: string) => {
    setCustomSketchPresets(deleteCustomSketchPreset(id));
  }, []);

  const addLayer = useCallback(() => {
    mutate((d) => {
      if (!canAddLayer(d.layers.length)) return;
      const layer = makeDefaultLayer(d.layers.length + 1, d.canvas);
      d.layers.push(layer);
      d.activeLayerID = layer.id;
    });
  }, [mutate]);

  const duplicateActiveLayer = useCallback(() => {
    mutate((d) => {
      if (!canAddLayer(d.layers.length)) return;
      const current = d.layers.find((layer) => layer.id === d.activeLayerID);
      if (!current) return;
      const copy = {
        ...structuredClone(current),
        id: newLayerId(),
        name: `${current.name} Copy`,
      };
      d.layers.push(copy);
      d.activeLayerID = copy.id;
    });
  }, [mutate]);

  const deleteLayer = useCallback(
    (id: string) => {
      mutate((d) => {
        if (d.layers.length <= 1) return;
        d.layers = d.layers.filter((layer) => layer.id !== id);
        if (d.activeLayerID === id) {
          d.activeLayerID = d.layers[0].id;
        }
      });
    },
    [mutate],
  );

  const selectLayer = useCallback(
    (id: string) => {
      setDocument((current) => {
        if (!current.layers.some((layer) => layer.id === id)) return current;
        return { ...current, activeLayerID: id };
      });
    },
    [],
  );

  const toggleLayerVisibility = useCallback(
    (id: string) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === id);
        if (index < 0) return;
        d.layers[index].isVisible = !d.layers[index].isVisible;
      });
    },
    [mutate],
  );

  const renameLayer = useCallback(
    (id: string, name: string) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === id);
        if (index < 0) return;
        d.layers[index].name = name;
      });
    },
    [mutate],
  );

  const updateLayerColor = useCallback(
    (id: string, colorHex: string) => {
      mutate((d) => {
        const index = d.layers.findIndex((layer) => layer.id === id);
        if (index < 0) return;
        d.layers[index].colorHex = colorHex;
      });
    },
    [mutate],
  );

  const updatePngScale = useCallback(
    (scale: number) => {
      mutate((d) => {
        d.exportPreferences.pngScale = scale;
      });
    },
    [mutate],
  );

  const updatePngTransparentBackground = useCallback(
    (enabled: boolean) => {
      mutate((d) => {
        d.exportPreferences.pngTransparentBackground = enabled;
      });
    },
    [mutate],
  );

  const updateJobName = useCallback(
    (name: string) => {
      mutate((d) => {
        d.name = name;
      });
    },
    [mutate],
  );

  // ----- Wealth data year application -----

  const applyWealthYearDesign = useCallback(
    (design: WealthYearDesign) => {
      setTransientPreviewState(null);
      mutate((d) => {
        d.canvas = syncFieldWidth(normalizeCanvas(design.canvas));
        d.layers = structuredClone(design.layers);
        d.activeLayerID = d.layers[0].id;
      });
    },
    [mutate],
  );

  // ----- Timeline states -----

  const timelineStates = useMemo(
    () => normalizeTimelineStates(document.timelineStates),
    [document.timelineStates],
  );

  const saveTimelineState = useCallback(
    (state: SavedYearState) => {
      mutate((d) => {
        const existing = normalizeTimelineStates(d.timelineStates);
        const withoutYear = existing.filter((entry) => entry.year !== state.year);
        d.timelineStates = normalizeTimelineStates([...withoutYear, state]);
      });
    },
    [mutate],
  );

  const deleteTimelineState = useCallback(
    (id: string) => {
      mutate((d) => {
        d.timelineStates = normalizeTimelineStates(d.timelineStates).filter(
          (entry) => entry.id !== id,
        );
      });
    },
    [mutate],
  );

  const restoreTimelineState = useCallback(
    (id: string) => {
      setTransientPreviewState(null);
      mutate((d) => {
        const state = normalizeTimelineStates(d.timelineStates).find(
          (entry) => entry.id === id,
        );
        if (!state) return;
        d.canvas = syncFieldWidth(normalizeCanvas(state.canvas));
        d.layers = structuredClone(state.layers);
        d.activeLayerID = d.layers[0].id;
      });
    },
    [mutate],
  );

  // ----- Transient playback preview (not persisted, no document churn) -----

  const setTransientPreview = useCallback(
    (frame: { canvas: CanvasSettings; layers: DesignLayer[]; label: string } | null) => {
      if (!frame) {
        setTransientPreviewState(null);
        return;
      }
      const canvas = syncFieldWidth(frame.canvas);
      const layerStates: Record<string, LayerSolveState> = {};
      for (const layer of frame.layers) {
        const input = {
          width: effectiveFieldWidth(canvas),
          height: canvas.fieldHeight,
          startX: layer.startX,
          areaFraction: layer.areaFraction,
          minStartX: 0,
        };
        try {
          layerStates[layer.id] = { input, result: solve(input), errorMessage: null };
        } catch (error) {
          layerStates[layer.id] = {
            input,
            result: null,
            errorMessage: error instanceof Error ? error.message : 'Solver failed.',
          };
        }
      }
      setTransientPreviewState({
        canvas,
        layers: frame.layers,
        layerStates,
        label: frame.label,
      });
    },
    [],
  );

  const active = activeLayer(document);
  const activeState: LayerSolveState | undefined = active
    ? layerStates[active.id]
    : undefined;

  return {
    document,
    layerStates,
    exportWholeComposition,
    setExportWholeComposition,
    activeLayer: active,
    activeState,
    replaceDocument,
    updateTotalPopulationWidth,
    updateFieldOfWealthWidthPercent,
    updateTotalPopulationLabel,
    updateTotalPopulationColorHex,
    updateTotalPopulationHeight,
    updateFieldHeight,
    updateStartX,
    updateAreaFraction,
    updateLayerAreaFraction,
    updateLayerStartX,
    moveLayerTowardFront,
    moveLayerTowardBack,
    updateAreaFromPreview,
    applyPreset,
    applyCustomPreset,
    saveActiveLayerAsCustomPreset,
    updateCustomPreset,
    deleteCustomPreset,
    customSketchPresets,
    copyResultConfirmationVisible,
    setCopyResultConfirmationVisible,
    applySampleValues: () => applyPreset(SKETCH_PRESETS[1]),
    addLayer,
    duplicateActiveLayer,
    deleteLayer,
    selectLayer,
    toggleLayerVisibility,
    renameLayer,
    updateLayerColor,
    updatePngScale,
    updatePngTransparentBackground,
    updateJobName,
    applyWealthYearDesign,
    timelineStates,
    saveTimelineState,
    deleteTimelineState,
    restoreTimelineState,
    transientPreview,
    setTransientPreview,
    sketchPresets: SKETCH_PRESETS,
    canAddLayer: canAddLayer(document.layers.length),
    maxLayers: MAX_LAYERS,
    canCopyResult: !!activeState?.result,
    solveCheck: solve,
  };
}

export type DgcDocumentController = ReturnType<typeof useDgcDocument>;
