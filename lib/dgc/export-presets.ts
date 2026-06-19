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
    description: 'Fast-loading PNG for email, slides, and websites',
    format: 'png',
    pngScale: 2,
    transparentBackground: false,
  },
  {
    id: 'print',
    label: 'For print',
    description: 'PDF for paper handouts and documents',
    format: 'pdf',
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
    id: 'tshirt',
    label: 'For cotton T-shirts',
    description: 'High-res PNG with transparent background for print-on-demand',
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
