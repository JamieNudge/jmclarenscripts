'use client';

import type { ReactNode } from 'react';
import { formatNumber } from '@/lib/dgc/document';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import { edgeDisplayName } from '@/lib/dgc/types';

function numericField(
  title: string,
  value: string,
  onChange: (value: number) => void,
  prompt: string,
) {
  return (
    <label className="block space-y-1">
      <span className="text-base font-semibold text-white">{title}</span>
      <input
        className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2 text-white"
        value={value}
        placeholder={prompt}
        onChange={(event) => {
          const parsed = Number(event.target.value.replace(',', '.'));
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
      />
    </label>
  );
}

export default function DgcInputForm({ controller }: { controller: DgcDocumentController }) {
  const { document, activeLayer } = controller;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Inputs</h2>

      <Panel title="Field of Wealth">
        {numericField(
          'Width',
          formatNumber(document.canvas.fieldWidth),
          controller.updateFieldWidth,
          'e.g. 12',
        )}
        {numericField(
          'Height',
          formatNumber(document.canvas.fieldHeight),
          controller.updateFieldHeight,
          'e.g. 8',
        )}
        {numericField(
          'Left margin (poverty axis)',
          formatNumber(document.canvas.leftMargin),
          controller.updateLeftMargin,
          'e.g. 4',
        )}
        <p className="text-sm text-white/80">
          The inner rectangle is the Field of Wealth. The left margin extends the bottom axis so
          point A can sit outside the field.
        </p>
      </Panel>

      <Panel title="Active Layer">
        {numericField(
          'Start on Bottom Axis',
          formatNumber(activeLayer?.startX ?? 0),
          controller.updateStartX,
          'e.g. 3 or -2',
        )}
        {numericField(
          'Area Target (%)',
          formatNumber((activeLayer?.areaFraction ?? 0) * 100),
          (value) => controller.updateAreaFraction(value / 100),
          'e.g. 35',
        )}
        <p className="text-sm text-white/80">
          Use a negative start value to place A on the poverty axis extension, left of the Field of
          Wealth.
        </p>
      </Panel>

      <button
        type="button"
        onClick={controller.applySampleValues}
        className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-500"
      >
        Use Sample
      </button>

      <Panel title="Client Sketch Presets">
        <div className="space-y-2">
          {controller.sketchPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => controller.applyPreset(preset)}
              className="flex w-full items-center justify-between rounded-lg border border-white/15 px-3 py-2 text-left text-white hover:bg-white/5"
            >
              <span className="font-semibold">{preset.title}</span>
              <span className="text-sm text-white/70">
                start {formatNumber(preset.startX)} · {formatNumber(preset.areaPercent)}%
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <DgcLayersPanel controller={controller} />
    </div>
  );
}

function DgcLayersPanel({ controller }: { controller: DgcDocumentController }) {
  return (
    <Panel title="Layers">
      <div className="space-y-2">
        {controller.document.layers.map((layer) => {
          const isActive = layer.id === controller.document.activeLayerID;
          const state = controller.layerStates[layer.id];
          return (
            <div
              key={layer.id}
              className={`rounded-xl border p-3 ${isActive ? 'border-sky-400/40 bg-sky-500/10' : 'border-white/10'}`}
              onClick={() => controller.selectLayer(layer.id)}
              onKeyDown={() => controller.selectLayer(layer.id)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="text-white/80"
                  onClick={(event) => {
                    event.stopPropagation();
                    controller.toggleLayerVisibility(layer.id);
                  }}
                >
                  {layer.isVisible ? '👁' : '🚫'}
                </button>
                <div className="min-w-0 flex-1">
                  <input
                    className="w-full rounded border border-white/15 bg-[#111] px-2 py-1 text-white"
                    value={layer.name}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                      controller.renameLayer(layer.id, event.target.value)
                    }
                  />
                  {state?.result ? (
                    <p className="mt-1 text-sm text-white/75">
                      {edgeDisplayName(state.result.edge)} ·{' '}
                      {formatNumber(state.result.areaFraction * 100)}%
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-red-300">{state?.errorMessage}</p>
                  )}
                </div>
                {isActive ? (
                  <span className="rounded-full bg-sky-500/20 px-2 py-1 text-xs font-semibold text-sky-200">
                    Active
                  </span>
                ) : null}
                {controller.document.layers.length > 1 ? (
                  <button
                    type="button"
                    className="text-red-300"
                    onClick={(event) => {
                      event.stopPropagation();
                      controller.deleteLayer(layer.id);
                    }}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={controller.addLayer}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white"
        >
          Add Layer
        </button>
        <button
          type="button"
          onClick={controller.duplicateActiveLayer}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white"
        >
          Duplicate
        </button>
      </div>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/15 bg-[#1b1b1d] p-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {children}
    </section>
  );
}
