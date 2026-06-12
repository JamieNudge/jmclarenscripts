import * as CanvasGeometry from './canvas-geometry';
import { CanvasLayout } from './canvas-layout';
import type { DrawContext } from './types';

export function exportSvg(context: DrawContext): string {
  const { layout, document, layerStates, activeLayerID, exportWholeComposition } =
    context;
  const { width, height } = layout.screenRect;
  const canvas = document.canvas;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect x="0" y="0" width="${width}" height="${height}" fill="white"/>
<rect x="${layout.screenRect.x}" y="${layout.screenRect.y}" width="${layout.screenRect.width}" height="${layout.screenRect.height}" fill="none" stroke="#888" stroke-width="1"/>
`;

  const axisStart = layout.screenPointCanvas(0, canvas.bottomMargin);
  const axisEnd = layout.screenPointCanvas(
    layout.canvasWidthValue,
    canvas.bottomMargin,
  );
  svg += `<line x1="${axisStart.x}" y1="${axisStart.y}" x2="${axisEnd.x}" y2="${axisEnd.y}" stroke="#666" stroke-width="2"/>\n`;

  const band = layout.povertyAxisBandScreenRect;
  if (band) {
    svg += `<rect x="${band.x}" y="${band.y}" width="${band.width}" height="${band.height}" fill="#FF9500" fill-opacity="0.16" stroke="#FF9500" stroke-opacity="0.65" stroke-width="2"/>\n`;
    svg += `<text x="${band.x + band.width / 2}" y="${band.y + band.height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#333">Poverty axis extension</text>\n`;
  }

  const field = layout.fieldScreenRect;
  svg += `<rect x="${field.x}" y="${field.y}" width="${field.width}" height="${field.height}" fill="#f8f8f8" stroke="#333" stroke-width="2"/>\n`;
  svg += `<text x="${field.x + field.width / 2}" y="${field.y - 6}" text-anchor="middle" font-size="12" fill="#666">Field of Wealth</text>\n`;

  const layers = exportWholeComposition
    ? document.layers
    : document.layers.filter((layer) => layer.id === activeLayerID);

  for (const layer of layers) {
    if (!layer.isVisible) continue;
    const state = layerStates[layer.id];
    if (!state?.result) continue;
    const { result, input } = state;
    const color = layer.colorHex;
    const isActive = layer.id === activeLayerID;
    const vertices = CanvasGeometry.partitionPolygonInsideField(
      input.width,
      input.height,
      input.startX,
      result.endX,
      result.endY,
      result.edge,
    );

    if (vertices.length >= 3) {
      const points = vertices
        .map((v) => layout.screenPointField(v.x, v.y))
        .map((p) => `${p.x},${p.y}`)
        .join(' ');
      svg += `<polygon points="${points}" fill="${color}" fill-opacity="${isActive ? 0.28 : 0.14}" stroke="none"/>\n`;
    }

    const start = layout.screenPointField(input.startX, 0);
    const end = layout.screenPointField(result.endX, result.endY);
    const lineEnd = layout.partitionLineDrawEndpoint(end, start);
    svg += `<line x1="${end.x}" y1="${end.y}" x2="${lineEnd.x}" y2="${lineEnd.y}" stroke="${color}" stroke-width="${isActive ? 3 : 1.5}" stroke-linecap="round"/>\n`;
    if (isActive || exportWholeComposition) {
      svg += `<circle cx="${start.x}" cy="${start.y}" r="6" fill="#FF9500"/>\n`;
      svg += `<circle cx="${end.x}" cy="${end.y}" r="6" fill="${color}"/>\n`;
    }
  }

  svg += '</svg>';
  return svg;
}

export function svgToPngBlob(svg: string, scale: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
    );
    img.onload = () => {
      const canvas = window.document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas unavailable.'));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error('PNG export failed.'));
        },
        'image/png',
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG rasterization failed.'));
    };
    img.src = url;
  });
}

export async function exportPng(context: DrawContext, scale: number): Promise<Blob> {
  const svg = exportSvg(context);
  return svgToPngBlob(svg, scale);
}

export async function exportPdf(context: DrawContext, scale: number): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const pngBlob = await exportPng(context, scale);
  const pngUrl = URL.createObjectURL(pngBlob);
  try {
    const img = await loadImage(pngUrl);
    const width = img.width / scale;
    const height = img.height / scale;
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
    });
    pdf.addImage(pngUrl, 'PNG', 0, 0, width, height);
    return pdf.output('blob');
  } finally {
    URL.revokeObjectURL(pngUrl);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image.'));
    img.src = url;
  });
}
