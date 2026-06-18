export type ExportPresetId = 'screen' | 'print' | 'poster' | 'tshirt';

export type ExportPreset = {
  id: ExportPresetId;
  label: string;
  description: string;
  format: 'png' | 'svg' | 'pdf';
  pngScale: number;
  transparentBackground: boolean;
};

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'screen',
    label: 'For screen',
    description: 'Email, slides, and websites',
    format: 'png',
    pngScale: 2,
    transparentBackground: false,
  },
  {
    id: 'print',
    label: 'For print',
    description: 'Handouts and documents',
    format: 'pdf',
    pngScale: 2,
    transparentBackground: false,
  },
  {
    id: 'poster',
    label: 'For large print',
    description: 'Posters and design tools (SVG)',
    format: 'svg',
    pngScale: 2,
    transparentBackground: false,
  },
  {
    id: 'tshirt',
    label: 'For T-shirt / transparent',
    description: 'Print-on-demand, no background',
    format: 'png',
    pngScale: 4,
    transparentBackground: true,
  },
];

export function exportPreset(id: ExportPresetId): ExportPreset {
  const preset = EXPORT_PRESETS.find((item) => item.id === id);
  if (!preset) throw new Error(`Unknown export preset: ${id}`);
  return preset;
}
