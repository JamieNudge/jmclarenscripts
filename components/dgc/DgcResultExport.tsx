'use client';

import { useState } from 'react';
import {
  exportPdf,
  exportPng,
  exportSvg,
  makeExportLayout,
} from '@/lib/dgc/export';
import { exportDownloadFilename } from '@/lib/dgc/document';
import { downloadExportBlob } from '@/lib/dgc/file-access';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import { edgeDisplayName } from '@/lib/dgc/types';
import { formatNumber } from '@/lib/dgc/document';
import { dgcSiteConfig } from '@/lib/dgc/site-config';

type ExportStatus = {
  type: 'success' | 'error';
  message: string;
} | null;

export default function DgcResultExport({
  controller,
}: {
  controller: DgcDocumentController;
}) {
  const [expanded, setExpanded] = useState(true);
  const [exportStatus, setExportStatus] = useState<ExportStatus>(null);
  const [exportingFormat, setExportingFormat] = useState<
    'png' | 'svg' | 'pdf' | null
  >(null);
  const result = controller.activeState?.result;

  const makeDrawContext = (pngScale = controller.document.exportPreferences.pngScale) => {
    const layout = makeExportLayout(controller.document.canvas, pngScale);
    return {
      layout,
      document: controller.document,
      layerStates: controller.layerStates,
      activeLayerID: controller.document.activeLayerID,
      exportWholeComposition: controller.exportWholeComposition,
      transparentBackground: controller.document.exportPreferences.pngTransparentBackground,
    };
  };

  const exportFile = async (format: 'png' | 'svg' | 'pdf') => {
    setExportingFormat(format);
    setExportStatus(null);
    try {
      const pngScale = controller.document.exportPreferences.pngScale;
      const context = makeDrawContext(pngScale);
      const filename = exportDownloadFilename(controller.document.name, format);
      const transparent = controller.document.exportPreferences.pngTransparentBackground;

      if (format === 'svg') {
        const svg = exportSvg(context);
        const result = downloadExportBlob(
          new Blob([svg], { type: 'image/svg+xml' }),
          filename,
        );
        if (!result.ok) {
          setExportStatus({ type: 'error', message: `Export failed: ${result.error}` });
          return;
        }
        setExportStatus({
          type: 'success',
          message: `Downloaded ${result.fileName}`,
        });
        return;
      }

      const blob =
        format === 'png'
          ? await exportPng(context, { transparentBackground: transparent })
          : await exportPdf(context);
      const result = downloadExportBlob(blob, filename);
      if (!result.ok) {
        setExportStatus({ type: 'error', message: `Export failed: ${result.error}` });
        return;
      }
      setExportStatus({
        type: 'success',
        message: `Downloaded ${result.fileName}`,
      });
    } catch (error) {
      setExportStatus({
        type: 'error',
        message: `Export failed: ${
          error instanceof Error ? error.message : 'Could not render the export.'
        }`,
      });
    } finally {
      setExportingFormat(null);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    const summary = `Edge: ${edgeDisplayName(result.edge)}
Endpoint: (${formatNumber(result.endX)}, ${formatNumber(result.endY)})
Area fraction: ${formatNumber(result.areaFraction * 100)}%`;
    await navigator.clipboard.writeText(summary);
  };

  const isExporting = exportingFormat !== null;

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
            <h3 className="text-lg font-semibold">Export image</h3>
            <p className="text-xs text-white/60">
              Downloads a PNG, SVG, or PDF using the job name above.
            </p>
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
                disabled={isExporting}
              >
                <option value={1}>1×</option>
                <option value={2}>2×</option>
                <option value={4}>4×</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={controller.document.exportPreferences.pngTransparentBackground}
                onChange={(event) =>
                  controller.updatePngTransparentBackground(event.target.checked)
                }
                disabled={isExporting}
              />
              PNG transparent background
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => exportFile('png')}
                disabled={isExporting}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                {exportingFormat === 'png' ? 'Exporting…' : 'Export PNG'}
              </button>
              <button
                type="button"
                onClick={() => exportFile('svg')}
                disabled={isExporting}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-50"
              >
                {exportingFormat === 'svg' ? 'Exporting…' : 'Export SVG'}
              </button>
              <button
                type="button"
                onClick={() => exportFile('pdf')}
                disabled={isExporting}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-50"
              >
                {exportingFormat === 'pdf' ? 'Exporting…' : 'Export PDF'}
              </button>
            </div>

            {exportStatus ? (
              <p
                className={`text-sm ${
                  exportStatus.type === 'success' ? 'text-green-400' : 'text-red-300'
                }`}
                role="status"
              >
                {exportStatus.message}
              </p>
            ) : null}

            <p className="text-xs text-white/60">
              {dgcSiteConfig.publicProductName} web beta · files interchange with the macOS app.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
