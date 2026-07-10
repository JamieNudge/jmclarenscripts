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
import {
  EXPORT_PRESETS,
  exportPreset,
  type ExportPresetId,
} from '@/lib/dgc/export-presets';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import { edgeDisplayName } from '@/lib/dgc/types';
import { formatNumber } from '@/lib/dgc/document';
import { dgcSiteConfig } from '@/lib/dgc/site-config';
import DgcFileMenu from './DgcFileMenu';
import type { useDgcPersistence } from '@/lib/dgc/use-dgc-persistence';

type Persistence = ReturnType<typeof useDgcPersistence>;

type ExportStatus = {
  type: 'success' | 'error';
  message: string;
} | null;

export default function DgcResultExport({
  controller,
  persistence,
}: {
  controller: DgcDocumentController;
  persistence: Persistence;
}) {
  const [expanded, setExpanded] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>(null);
  const [exportingId, setExportingId] = useState<ExportPresetId | 'custom' | null>(
    null,
  );
  const result = controller.activeState?.result;

  const makeDrawContext = (options: {
    pngScale?: number;
    transparentBackground?: boolean;
  } = {}) => {
    const pngScale =
      options.pngScale ?? controller.document.exportPreferences.pngScale;
    const layout = makeExportLayout(controller.document.canvas, pngScale);
    return {
      layout,
      document: controller.document,
      layerStates: controller.layerStates,
      activeLayerID: controller.document.activeLayerID,
      exportWholeComposition: controller.exportWholeComposition,
      transparentBackground:
        options.transparentBackground ??
        controller.document.exportPreferences.pngTransparentBackground,
    };
  };

  const runExport = async (options: {
    format: 'png' | 'svg' | 'pdf';
    pngScale?: number;
    transparentBackground?: boolean;
    label: string;
    exportKey: ExportPresetId | 'custom';
  }) => {
    setExportingId(options.exportKey);
    setExportStatus(null);
    try {
      const context = makeDrawContext({
        pngScale: options.pngScale,
        transparentBackground: options.transparentBackground,
      });
      const filename = exportDownloadFilename(
        controller.document.name,
        options.format,
      );

      if (options.format === 'svg') {
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
        options.format === 'png'
          ? await exportPng(context, {
              transparentBackground:
                options.transparentBackground ??
                controller.document.exportPreferences.pngTransparentBackground,
            })
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
      setExportingId(null);
    }
  };

  const exportPresetChoice = (id: ExportPresetId) => {
    const preset = exportPreset(id);
    void runExport({
      format: preset.format,
      pngScale: preset.pngScale,
      transparentBackground: preset.transparentBackground,
      label: preset.label,
      exportKey: id,
    });
  };

  const copyResult = async () => {
    if (!result) return;
    const summary = `Edge: ${edgeDisplayName(result.edge)}
Endpoint: (${formatNumber(result.endX)}, ${formatNumber(result.endY)})
Area fraction: ${formatNumber(result.areaFraction * 100)}%`;
    await navigator.clipboard.writeText(summary);
    controller.setCopyResultConfirmationVisible(true);
    window.setTimeout(() => controller.setCopyResultConfirmationVisible(false), 2000);
  };

  const isExporting = exportingId !== null;

  return (
    <section className="rounded-2xl border border-[var(--dgc-border)] bg-[var(--dgc-panel)] p-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="text-xl font-semibold text-[var(--dgc-text)]">Result & Export</span>
        <span className="text-sm text-[var(--dgc-text-muted)]">{expanded ? 'Hide controls' : 'Show controls'}</span>
      </button>

      {expanded ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-[var(--dgc-text)]">
            <h3 className="text-lg font-semibold">Result</h3>
            {result ? (
              <div className="space-y-1 text-sm text-[var(--dgc-text-soft)]">
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
              className="rounded-lg border border-[var(--dgc-border)] px-3 py-2 text-sm text-[var(--dgc-text)] disabled:opacity-40"
            >
              Copy to Clipboard
            </button>
            <p className="text-xs text-[var(--dgc-text-faint)]">
              Pastes into Notes, Word, email, etc.
            </p>
            {controller.copyResultConfirmationVisible ? (
              <p className="text-sm font-semibold text-green-400">Copied to clipboard.</p>
            ) : null}

            <div className="border-t border-[var(--dgc-border-soft)] pt-4">
              <h3 className="mb-3 text-lg font-semibold">Your files</h3>
              <DgcFileMenu controller={controller} persistence={persistence} />
            </div>
          </div>

          <div className="space-y-3 text-[var(--dgc-text)]">
            <h3 className="text-lg font-semibold">Export finished artwork</h3>
            <p className="text-xs text-[var(--dgc-text-faint)]">
              Downloads a picture or document you can share or print. Use{' '}
              <span className="font-medium text-[var(--dgc-text-soft)]">Save design</span> on the left
              if you need to keep editing later.
            </p>

            <div className="rounded-lg border border-[var(--dgc-border-soft)] bg-[var(--dgc-input)] p-3 text-xs text-[var(--dgc-text-muted)]">
              <p className="font-medium text-[var(--dgc-text-soft)]">Which format?</p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <span className="font-medium text-[var(--dgc-text-soft)]">Solid background</span> — PNG
                  with white behind the diagram (email, slides)
                </li>
                <li>
                  <span className="font-medium text-[var(--dgc-text-soft)]">Large posters</span> — SVG
                  (stays sharp at any size)
                </li>
                <li>
                  <span className="font-medium text-[var(--dgc-text-soft)]">Transparent background</span>{' '}
                  — PNG with no background (T-shirts, print-on-demand)
                </li>
                <li>
                  <span className="font-medium text-[var(--dgc-text-soft)]">Keep editing</span> — use
                  Save design on the left, not Export
                </li>
              </ul>
            </div>

            <div className="grid gap-2 sm:grid-cols-1">
              {EXPORT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => exportPresetChoice(preset.id)}
                  disabled={isExporting}
                  className="rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-3 py-3 text-left hover:border-sky-500/40 disabled:opacity-50"
                >
                  <span className="block text-sm font-medium text-[var(--dgc-text)]">
                    {exportingId === preset.id ? 'Exporting…' : preset.label}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--dgc-text-faint)]">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAdvancedOpen((value) => !value)}
              className="text-sm text-[var(--dgc-text-muted)] hover:text-[var(--dgc-text)]"
            >
              {advancedOpen ? 'Hide advanced options' : 'Advanced options'}
            </button>

            {advancedOpen ? (
              <div className="space-y-3 rounded-lg border border-[var(--dgc-border-soft)] bg-[var(--dgc-input)] p-3">
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
                    className="mt-1 w-full rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input-deep)] px-3 py-2"
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
                    onClick={() =>
                      void runExport({
                        format: 'png',
                        label: 'PNG',
                        exportKey: 'custom',
                      })
                    }
                    disabled={isExporting}
                    className="rounded-lg border border-[var(--dgc-border)] px-3 py-2 text-sm disabled:opacity-50"
                  >
                    {exportingId === 'custom' ? 'Exporting…' : 'Custom PNG'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void runExport({
                        format: 'svg',
                        label: 'SVG',
                        exportKey: 'custom',
                      })
                    }
                    disabled={isExporting}
                    className="rounded-lg border border-[var(--dgc-border)] px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Custom SVG
                  </button>
                </div>
              </div>
            ) : null}

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

            <p className="text-xs text-[var(--dgc-text-dim)]">
              {dgcSiteConfig.publicProductName} web beta · works with the Mac app.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
