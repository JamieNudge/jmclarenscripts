export const MAX_LAYERS = 12;

export interface LayerHandleLabels {
  start: string;
  end: string;
}

/** Layer 1 → A / A1, layer 2 → B / B1, etc. */
export function layerHandleLabels(layerIndex: number): LayerHandleLabels {
  const letter = String.fromCharCode('A'.charCodeAt(0) + layerIndex);
  return {
    start: letter,
    end: `${letter}1`,
  };
}

export function layerHandleLabelsForId(
  layers: { id: string }[],
  layerId: string,
): LayerHandleLabels {
  const index = layers.findIndex((layer) => layer.id === layerId);
  if (index < 0) return { start: 'A', end: 'A1' };
  return layerHandleLabels(index);
}

export function layerHandlePairLabel(layerIndex: number): string {
  const { start, end } = layerHandleLabels(layerIndex);
  return `${start}/${end}`;
}

export function layerPanelTitle(layerIndex: number): string {
  const { start, end } = layerHandleLabels(layerIndex);
  return `Layer ${layerIndex + 1} (${start} → ${end})`;
}

export function canAddLayer(layerCount: number): boolean {
  return layerCount < MAX_LAYERS;
}
