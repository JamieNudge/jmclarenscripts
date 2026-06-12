export const MAX_LAYERS = 12;

export interface LayerHandleLabels {
  start: string;
  end: string;
}

export function layerHandleLabels(layerIndex: number): LayerHandleLabels {
  const base = 'A'.charCodeAt(0);
  return {
    start: String.fromCharCode(base + layerIndex * 2),
    end: String.fromCharCode(base + layerIndex * 2 + 1),
  };
}

export function layerHandleLabelsForId(
  layers: { id: string }[],
  layerId: string,
): LayerHandleLabels {
  const index = layers.findIndex((layer) => layer.id === layerId);
  if (index < 0) return { start: 'A', end: 'B' };
  return layerHandleLabels(index);
}

export function layerHandlePairLabel(layerIndex: number): string {
  const { start, end } = layerHandleLabels(layerIndex);
  return `${start}/${end}`;
}

export function canAddLayer(layerCount: number): boolean {
  return layerCount < MAX_LAYERS;
}
