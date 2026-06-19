export type ExportPresetId = 'solid' | 'poster' | 'transparent';

export type ExportPreset = {
  id: ExportPresetId;
  label: string;
  description: string;
  format: 'png' | 'svg';
  pngScale: number;
  transparentBackground: boolean;
};

export const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'solid',
    label: 'Image with solid background',
    description: 'PNG with white background — fast for email, slides, and websites',
    format: 'png',
    pngScale: 2,
    transparentBackground: false,
  },
  {
    id: 'poster',
    label: 'For large posters',
    description: 'SVG stays sharp at any size for big prints',
    format: 'svg',
    pngScale: 2,
    transparentBackground: false,
  },
  {
    id: 'transparent',
    label: 'Image with transparent background',
    description: 'High-res PNG with no background — T-shirts and print-on-demand',
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
