import {
  exportPdf,
  exportPng,
  exportSvg,
  makeExportLayout,
} from './export';
import type { DgcDocumentController } from './use-dgc-document';

export type ExportFormat = 'png' | 'pdf' | 'svg';

export type ExportArtifacts = Record<ExportFormat, Blob>;

export async function buildExportArtifacts(
  controller: DgcDocumentController,
): Promise<ExportArtifacts> {
  const pngScale = controller.document.exportPreferences.pngScale;
  const layout = makeExportLayout(controller.document.canvas, pngScale);
  const context = {
    layout,
    document: controller.document,
    layerStates: controller.layerStates,
    activeLayerID: controller.document.activeLayerID,
    exportWholeComposition: controller.exportWholeComposition,
    transparentBackground:
      controller.document.exportPreferences.pngTransparentBackground,
  };

  const [png, pdf] = await Promise.all([
    exportPng(context, {
      transparentBackground:
        controller.document.exportPreferences.pngTransparentBackground,
    }),
    exportPdf(context),
  ]);
  const svg = exportSvg(context);

  return {
    png,
    pdf,
    svg: new Blob([svg], { type: 'image/svg+xml' }),
  };
}
