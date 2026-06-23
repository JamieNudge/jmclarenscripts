export interface CustomSketchPreset {
  id: string;
  title: string;
  startX: number;
  areaPercent: number;
}

const STORAGE_KEY = 'dgc.custom-sketch-presets';

function readStorage(): CustomSketchPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomSketchPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(presets: CustomSketchPreset[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function loadCustomSketchPresets(): CustomSketchPreset[] {
  return readStorage();
}

export function addCustomSketchPreset(preset: CustomSketchPreset): CustomSketchPreset[] {
  const presets = readStorage();
  presets.push(preset);
  writeStorage(presets);
  return presets;
}

export function updateCustomSketchPreset(preset: CustomSketchPreset): CustomSketchPreset[] {
  const presets = readStorage();
  const index = presets.findIndex((item) => item.id === preset.id);
  if (index < 0) return presets;
  presets[index] = preset;
  writeStorage(presets);
  return presets;
}

export function deleteCustomSketchPreset(id: string): CustomSketchPreset[] {
  const presets = readStorage().filter((item) => item.id !== id);
  writeStorage(presets);
  return presets;
}

export function newCustomSketchPresetId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `preset-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
