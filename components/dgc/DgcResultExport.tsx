'use client';

import { useRef, useState } from 'react';
import { CanvasLayout } from '@/lib/dgc/canvas-layout';
import {
  downloadBlob,
  formatNumber,
  parseDocumentJson,
  serializeDocument,
} from '@/lib/dgc/document';
import { exportPdf, exportPng, exportSvg } from '@/lib/dgc/export';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import { edgeDisplayName } from '@/lib/dgc/types';
import { dgcSiteConfig } from '@/lib/dgc/site-config';

export default function DgcResultExport({
  controller,
}: {
  controller: DgcDocumentController;
}) {
  const [expanded, setExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const result = controller.activeState?.result;

  const makeDrawContext = () => {
    const scale = controller.document.exportPreferences.pngScale;
    const layout = CanvasLayout.fromExportScale(controller.document.canvas, scale);
    return {
      layout,
      document: controller.document,
      layerStates: controller.layerStates,
      activeLayerID: controller.document.activeLayerID,
      exportWholeComposition: controller.exportWholeComposition,
    };
  };

  const exportFile = async (format: 'png' | 'svg' | 'pdf') => {
    const context = makeDrawContext();
    const base = controller.document.name.replace(/\s+/g, '-').toLowerCase();
    if (format === 'svg') {
      const svg = exportSvg(context);
      downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${base}.svg`);
      return;
    }
    const scale = controller.document.exportPreferences.pngScale;
    if (format === 'png') {
      const blob = await exportPng(context, scale);
      downloadBlob(blob, `${base}.png`);
      return;
    }
    const blob = await exportPdf(context, scale);
    downloadBlob(blob, `${base}.pdf`);
  };

  const openDocument = async (file: File) => {
    const text = await file.text();
    controller.replaceDocument(parseDocumentJson(text));
  };

  const saveDocument = () => {
    const blob = new Blob([serializeDocument(controller.document)], {
      type: 'application/json',
    });
    downloadBlob(blob, `${controller.document.name || 'design'}.dgcjson`);
  };

  const copyResult = async () => {
    if (!result) return;
    const summary = `Edge: ${edgeDisplayName(result.edge)}
Endpoint: (${formatNumber(result.endX)}, ${formatNumber(result.endY)})
Area fraction: ${formatNumber(result.areaFraction * 100)}%`;
    await navigator.clipboard.writeText(summary);
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-[#1b1b1d] p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="text-xl font-semibold text-white">Result & Export</span>
        <span className="text-sm text-white/70">{expanded ? 'Hide controls' : 'Show controls'}</span>
      </button>

      {expanded ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-white">
            <h3 className="text-lg font-semibold">Result</h3>
            {result ? (
              <div className="space-y-1 text-sm text-white/85">
                <p>Edge: {edgeDisplayName(result.edge)}</p>
                <p>
                  Endpoint: ({formatNumber(result.endX)}, {formatNumber(result.endY)})
                </p>
                <p>Computed area: {formatNumber(result.computedArea)}</p>
                <p>Area fraction: {formatNumber(result.areaFraction * 100)}%</p>
              </div>
            ) : (
              <p className="text-sm text-red-300">
                {controller.activeState?.errorMessage ?? 'No result for active layer.'}
              </p>
            )}
            <button
              type="button"
              disabled={!controller.canCopyResult}
              onClick={copyResult}
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white disabled:opacity-40"
            >
              Copy Result Summary
            </button>
          </div>

          <div className="space-y-3 text-white">
            <h3 className="text-lg font-semibold">Export</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={controller.exportWholeComposition}
                onChange={(event) =>
                  controller.setExportWholeComposition(event.target.checked)
                }
              />
              Export whole composition
            </label>
            <label className="block text-sm">
              PNG scale
              <select
                className="mt-1 w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2"
                value={controller.document.exportPreferences.pngScale}
                onChange={(event) =>
                  controller.updatePngScale(Number(event.target.value))
                }
              >
                <option value={1}>1×</option>
                <option value={2}>2×</option>
                <option value={4}>4×</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => exportFile('png')}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium"
              >
                Export PNG
              </button>
              <button
                type="button"
                onClick={() => exportFile('svg')}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm"
              >
                Export SVG
              </button>
              <button
                type="button"
                onClick={() => exportFile('pdf')}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm"
              >
                Export PDF
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm"
              >
                Open .dgcjson
              </button>
              <button
                type="button"
                onClick={saveDocument}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm"
              >
                Download .dgcjson
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".dgcjson,application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void openDocument(file);
                event.target.value = '';
              }}
            />
            <p className="text-xs text-white/60">
              {dgcSiteConfig.publicProductName} web beta · files interchange with the macOS app.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
