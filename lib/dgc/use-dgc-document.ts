import { useCallback, useMemo, useState } from 'react';
import {
  activeLayer,
  makeDefaultLayer,
  makeNewDocument,
  newLayerId,
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
import { areaForRegion, solve } from './partition-solver';
import type {
  DGCDesignDocument,
  LayerSolveState,
  PartitionEdge,
} from './types';
import { maxStartX, effectiveFieldWidth, normalizeCanvas, normalizeExportPreferences, syncFieldWidth } from './types';

const MIN_FRACTION = 0.0001;
const MAX_FRACTION = 0.9999;

export function useDgcDocument(initial?: DGCDesignDocument) {
  const [document, setDocument] = useState<DGCDesignDocument>(
    initial ?? makeNewDocument(),
  );
  const [exportWholeComposition, setExportWholeComposition] = useState(true);

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
    setDocument({
      ...next,
      canvas,
      layers,
      exportPreferences: normalizeExportPreferences(next.exportPreferences),
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
    updateTotalPopulationHeight,
    updateFieldHeight,
    updateStartX,
    updateAreaFraction,
    updateLayerAreaFraction,
    updateAreaFromPreview,
    applyPreset,
    applySampleValues: () => applyPreset(SKETCH_PRESETS[1]),
    addLayer,
    duplicateActiveLayer,
    deleteLayer,
    selectLayer,
    toggleLayerVisibility,
    renameLayer,
    updatePngScale,
    updatePngTransparentBackground,
    updateJobName,
    sketchPresets: SKETCH_PRESETS,
    canAddLayer: canAddLayer(document.layers.length),
    maxLayers: MAX_LAYERS,
    canCopyResult: !!activeState?.result,
    solveCheck: solve,
  };
}

export type DgcDocumentController = ReturnType<typeof useDgcDocument>;
