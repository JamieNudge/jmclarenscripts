'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { LayerAreaPercentInput } from '@/components/dgc/LayerAreaPercentInput';
import { formatNumber } from '@/lib/dgc/document';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import { layerHandleLabelsForId, layerHandlePairLabel, layerPanelTitle, MAX_LAYERS } from '@/lib/dgc/layer-handles';
import { DEFAULT_TOTAL_POPULATION_LABEL, edgeDisplayName } from '@/lib/dgc/types';

function parseNumericInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/%/g, '').replace(/,/g, '.');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? null : parsed;
}

function EditableNumericField({
  title,
  value,
  onCommit,
  prompt,
  suffix = '',
}: {
  title: string;
  value: number;
  onCommit: (value: number) => void;
  prompt: string;
  suffix?: string;
}) {
  const [draft, setDraft] = useState(formatNumber(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDraft(formatNumber(value));
    }
  }, [value, focused]);

  const commit = () => {
    const parsed = parseNumericInput(draft);
    if (parsed !== null) {
      onCommit(parsed);
    }
    setFocused(false);
  };

  return (
    <label className="block space-y-1">
      <span className="text-base font-semibold text-white">{title}</span>
      <div className="relative">
        <input
          className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2 text-white"
          value={focused ? draft : `${formatNumber(value)}${suffix}`}
          placeholder={prompt}
          inputMode="decimal"
          onFocus={() => {
            setFocused(true);
            setDraft(formatNumber(value));
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
          onChange={(event) => setDraft(event.target.value)}
        />
      </div>
    </label>
  );
}

function AreaTargetField({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (fraction: number) => void;
}) {
  return (
    <EditableNumericField
      title="Area Target (%)"
      value={value * 100}
      prompt="e.g. 66"
      suffix="%"
      onCommit={(percent) => onCommit(percent / 100)}
    />
  );
}

export default function DgcInputForm({ controller }: { controller: DgcDocumentController }) {
  const { document, activeLayer } = controller;
  const activeLayerIndex = document.layers.findIndex(
    (layer) => layer.id === document.activeLayerID,
  );
  const activeLayerTitle =
    activeLayerIndex >= 0
      ? layerPanelTitle(activeLayerIndex)
      : 'Active layer';
  const activeHandleLabels =
    activeLayerIndex >= 0
      ? layerHandleLabelsForId(document.layers, document.activeLayerID)
      : { start: 'A', end: 'A1' };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Inputs</h2>

      <Panel title="Total Population">
        <EditableNumericField
          title="Width"
          value={document.canvas.totalPopulationWidth}
          onCommit={controller.updateTotalPopulationWidth}
          prompt="e.g. 12"
        />
        <EditableNumericField
          title="Height"
          value={document.canvas.totalPopulationHeight}
          onCommit={controller.updateTotalPopulationHeight}
          prompt="e.g. 1"
        />
        <label className="block space-y-1">
          <span className="text-base font-semibold text-white">Label</span>
          <input
            className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2 text-white"
            value={document.canvas.totalPopulationLabel}
            placeholder={DEFAULT_TOTAL_POPULATION_LABEL}
            onChange={(event) => controller.updateTotalPopulationLabel(event.target.value)}
          />
        </label>
      </Panel>

      <Panel title="Field of Wealth">
        <EditableNumericField
          title="Width (% of Total Population)"
          value={document.canvas.fieldOfWealthWidthPercent}
          onCommit={controller.updateFieldOfWealthWidthPercent}
          prompt="e.g. 100"
          suffix="%"
        />
        <EditableNumericField
          title="Height"
          value={document.canvas.fieldHeight}
          onCommit={controller.updateFieldHeight}
          prompt="e.g. 8"
        />
        <p className="text-sm text-white/80">
          Field of Wealth sits above Total Population, left-aligned at the width percentage you
          set. Each layer starts on the bottom edge of the field; drag the end handle to the left,
          top, or right edge to set the target area from the bottom-left corner.
        </p>
      </Panel>

      <Panel title={activeLayerTitle}>
        <EditableNumericField
          title={`${activeHandleLabels.start} on bottom edge`}
          value={activeLayer?.startX ?? 0}
          onCommit={controller.updateStartX}
          prompt="e.g. 3"
        />
        <AreaTargetField
          key={activeLayer?.id ?? 'none'}
          value={activeLayer?.areaFraction ?? 0}
          onCommit={controller.updateAreaFraction}
        />
        <p className="text-sm text-white/80">
          This is the layer you are editing. Type an area target (e.g. 66%) and the{' '}
          {activeHandleLabels.end} handle moves to match. Dragging the handle updates this
          value. Select another layer in the list below to edit it.
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
        {controller.document.layers.map((layer, index) => {
          const isActive = layer.id === controller.document.activeLayerID;
          const state = controller.layerStates[layer.id];
          const handlePair = layerHandlePairLabel(index);
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
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs font-bold text-white">
                      {handlePair}
                    </span>
                    <input
                      className="min-w-0 flex-1 rounded border border-white/15 bg-[#111] px-2 py-1 text-white"
                      value={layer.name}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        controller.renameLayer(layer.id, event.target.value)
                      }
                    />
                  </div>
                  <div
                    className="mt-2 flex flex-wrap items-center gap-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <label className="flex items-center gap-2 text-xs text-white/70">
                      Colour
                      <input
                        type="color"
                        value={layer.colorHex}
                        onChange={(event) =>
                          controller.updateLayerColor(layer.id, event.target.value)
                        }
                        className="h-8 w-10 cursor-pointer rounded border border-white/15 bg-transparent"
                        aria-label={`Colour for layer ${handlePair}`}
                      />
                    </label>
                    <span className="shrink-0 text-xs text-white/70">Field of Wealth %</span>
                    <LayerAreaPercentInput
                      value={layer.areaFraction}
                      onCommit={(fraction) =>
                        controller.updateLayerAreaFraction(layer.id, fraction)
                      }
                    />
                  </div>
                  {state?.result ? (
                    <p className="mt-1 text-sm text-white/75">
                      {edgeDisplayName(state.result.edge)}
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
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={controller.addLayer}
          disabled={!controller.canAddLayer}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add Layer
        </button>
        <button
          type="button"
          onClick={controller.duplicateActiveLayer}
          disabled={!controller.canAddLayer}
          className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Duplicate
        </button>
        <span className="text-xs text-white/60">
          {controller.document.layers.length}/{MAX_LAYERS} layers · up to {MAX_LAYERS} per design
        </span>
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
