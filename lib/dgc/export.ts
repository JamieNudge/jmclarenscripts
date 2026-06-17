import * as CanvasGeometry from './canvas-geometry';
import { CanvasLayout } from './canvas-layout';
import { layerHandleLabelsForId } from './layer-handles';
import type { CanvasSettings, DrawContext } from './types';
import { contentWidth, fieldOriginY } from './types';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Pixels per canvas unit for file export (before PNG scale multiplier). */
export const EXPORT_PIXELS_PER_UNIT = 40;

export function exportUnitScale(canvas: CanvasSettings, pngScale: number): number {
  return EXPORT_PIXELS_PER_UNIT * pngScale;
}

export function makeExportLayout(canvas: CanvasSettings, pngScale: number): CanvasLayout {
  return CanvasLayout.fromExportScale(canvas, exportUnitScale(canvas, pngScale));
}

export function exportSvg(
  context: DrawContext,
  outputWidth = context.layout.screenRect.width,
  outputHeight = context.layout.screenRect.height,
): string {
  const {
    layout,
    document,
    layerStates,
    activeLayerID,
    exportWholeComposition,
    transparentBackground = false,
  } = context;
  const viewWidth = layout.screenRect.width;
  const viewHeight = layout.screenRect.height;
  const canvas = document.canvas;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(outputWidth)}" height="${Math.round(outputHeight)}" viewBox="0 0 ${viewWidth} ${viewHeight}">
`;

  if (!transparentBackground) {
    svg += `<rect x="0" y="0" width="${viewWidth}" height="${viewHeight}" fill="white"/>
<rect x="${layout.screenRect.x}" y="${layout.screenRect.y}" width="${layout.screenRect.width}" height="${layout.screenRect.height}" fill="none" stroke="#888" stroke-width="1"/>
`;
  }

  const axisY = fieldOriginY(canvas);
  const axisStart = layout.screenPointCanvas(0, axisY);
  const axisEnd = layout.screenPointCanvas(contentWidth(canvas), axisY);
  svg += `<line x1="${axisStart.x}" y1="${axisStart.y}" x2="${axisEnd.x}" y2="${axisEnd.y}" stroke="#666" stroke-width="2"/>\n`;

  const band = layout.totalPopulationBandScreenRect;
  if (band) {
    svg += `<rect x="${band.x}" y="${band.y}" width="${band.width}" height="${band.height}" fill="#FF9500" fill-opacity="0.16" stroke="#FF9500" stroke-opacity="0.65" stroke-width="2"/>\n`;
    const label =
      document.canvas.totalPopulationLabel.trim() || 'Total Population';
    svg += `<text x="${band.x + band.width / 2}" y="${band.y + band.height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#333">${escapeXml(label)}</text>\n`;
  }

  const field = layout.fieldScreenRect;
  svg += `<rect x="${field.x}" y="${field.y}" width="${field.width}" height="${field.height}" fill="${transparentBackground ? 'none' : '#f8f8f8'}" stroke="#333" stroke-width="2"/>\n`;
  if (!transparentBackground) {
    svg += `<text x="${field.x + field.width / 2}" y="${field.y - 6}" text-anchor="middle" font-size="12" fill="#666">Field of Wealth</text>\n`;
  }

  const layers = exportWholeComposition
    ? document.layers
    : document.layers.filter((layer) => layer.id === activeLayerID);

  for (let layerIndex = 0; layerIndex < layers.length; layerIndex += 1) {
    const layer = layers[layerIndex];
    if (!layer.isVisible) continue;
    const state = layerStates[layer.id];
    if (!state?.result) continue;
    const { result, input } = state;
    const color = layer.colorHex;
    const isActive = layer.id === activeLayerID;
    const labels = layerHandleLabelsForId(document.layers, layer.id);
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
      svg += `<text x="${start.x}" y="${start.y + 16}" text-anchor="middle" font-size="11" font-weight="700" fill="#333">${escapeXml(labels.start)}</text>\n`;
      svg += `<circle cx="${end.x}" cy="${end.y}" r="6" fill="${color}"/>\n`;
      svg += `<text x="${end.x}" y="${end.y - 10}" text-anchor="middle" font-size="11" font-weight="700" fill="#333">${escapeXml(labels.end)}</text>\n`;
    }
  }

  svg += '</svg>';
  return svg;
}

function drawExportToCanvas(
  ctx: CanvasRenderingContext2D,
  context: DrawContext,
  width: number,
  height: number,
): void {
  const {
    layout,
    document,
    layerStates,
    activeLayerID,
    exportWholeComposition,
    transparentBackground = false,
  } = context;
  const canvas = document.canvas;

  if (!transparentBackground) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(136, 136, 136, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      layout.screenRect.x,
      layout.screenRect.y,
      layout.screenRect.width,
      layout.screenRect.height,
    );
  }

  const axisY = fieldOriginY(canvas);
  const axisStart = layout.screenPointCanvas(0, axisY);
  const axisEnd = layout.screenPointCanvas(contentWidth(canvas), axisY);
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(axisStart.x, axisStart.y);
  ctx.lineTo(axisEnd.x, axisEnd.y);
  ctx.stroke();

  const band = layout.totalPopulationBandScreenRect;
  if (band) {
    ctx.fillStyle = 'rgba(255, 149, 0, 0.16)';
    ctx.fillRect(band.x, band.y, band.width, band.height);
    ctx.strokeStyle = 'rgba(255, 149, 0, 0.65)';
    ctx.lineWidth = 2;
    ctx.strokeRect(band.x, band.y, band.width, band.height);
    const label =
      document.canvas.totalPopulationLabel.trim() || 'Total Population';
    ctx.fillStyle = '#333333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, band.x + band.width / 2, band.y + band.height / 2);
  }

  const field = layout.fieldScreenRect;
  if (!transparentBackground) {
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(field.x, field.y, field.width, field.height);
  }
  ctx.strokeStyle = 'rgba(51, 51, 51, 0.75)';
  ctx.lineWidth = 2;
  ctx.strokeRect(field.x, field.y, field.width, field.height);

  if (!transparentBackground) {
    ctx.fillStyle = '#666666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Field of Wealth', field.x + field.width / 2, field.y - 6);
  }

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
    const labels = layerHandleLabelsForId(document.layers, layer.id);
    const vertices = CanvasGeometry.partitionPolygonInsideField(
      input.width,
      input.height,
      input.startX,
      result.endX,
      result.endY,
      result.edge,
    );

    if (vertices.length >= 3) {
      ctx.fillStyle = color;
      ctx.globalAlpha = isActive ? 0.28 : 0.14;
      ctx.beginPath();
      const first = layout.screenPointField(vertices[0].x, vertices[0].y);
      ctx.moveTo(first.x, first.y);
      for (const vertex of vertices.slice(1)) {
        const point = layout.screenPointField(vertex.x, vertex.y);
        ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const start = layout.screenPointField(input.startX, 0);
    const end = layout.screenPointField(result.endX, result.endY);
    const lineEnd = layout.partitionLineDrawEndpoint(end, start);
    ctx.strokeStyle = color;
    ctx.lineWidth = isActive ? 3 : 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(lineEnd.x, lineEnd.y);
    ctx.stroke();

    if (isActive || exportWholeComposition) {
      ctx.fillStyle = '#FF9500';
      ctx.beginPath();
      ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333333';
      ctx.font = '700 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(labels.start, start.x, start.y + 16);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(end.x, end.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333333';
      ctx.fillText(labels.end, end.x, end.y - 10);
    }
  }
}

export function svgToPngBlob(
  svg: string,
  pixelWidth: number,
  pixelHeight: number,
  transparentBackground = false,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = window.document.createElement('canvas');
    const width = Math.max(1, Math.round(pixelWidth));
    const height = Math.max(1, Math.round(pixelHeight));
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas unavailable.'));
      return;
    }

    if (!transparentBackground) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    const img = new Image();
    const url = URL.createObjectURL(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
    );
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) resolve(blob);
            else reject(new Error('PNG export failed.'));
          },
          'image/png',
        );
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error instanceof Error ? error : new Error('PNG export failed.'));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('SVG rasterization failed.'));
    };
    img.src = url;
  });
}

export async function exportPng(
  context: DrawContext,
  options: { transparentBackground?: boolean } = {},
): Promise<Blob> {
  const transparentBackground =
    options.transparentBackground ?? context.transparentBackground ?? true;
  const { width, height } = context.layout.screenRect;
  const pixelWidth = Math.max(1, Math.round(width));
  const pixelHeight = Math.max(1, Math.round(height));

  const canvas = window.document.createElement('canvas');
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas unavailable.');
  }

  drawExportToCanvas(
    ctx,
    { ...context, transparentBackground },
    pixelWidth,
    pixelHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('PNG export failed.'));
      },
      'image/png',
    );
  });
}

export async function exportPdf(context: DrawContext): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const { width, height } = context.layout.screenRect;
  const pngBlob = await exportPng(context, { transparentBackground: false });
  const pngUrl = URL.createObjectURL(pngBlob);
  try {
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [Math.round(width), Math.round(height)],
    });
    pdf.addImage(pngUrl, 'PNG', 0, 0, width, height);
    return pdf.output('blob');
  } finally {
    URL.revokeObjectURL(pngUrl);
  }
}
