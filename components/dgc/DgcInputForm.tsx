'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { formatNumber } from '@/lib/dgc/document';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
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
        <EditableNumericField
          title="Left margin (poverty axis)"
          value={document.canvas.leftMargin}
          onCommit={controller.updateLeftMargin}
          prompt="e.g. 4"
        />
        <p className="text-sm text-white/80">
          Field of Wealth sits above Total Population, left-aligned at the width percentage you
          set. The left margin extends the bottom axis so point A can sit outside the field.
        </p>
      </Panel>

      <Panel title="Active Layer">
        <EditableNumericField
          title="Start on Bottom Axis"
          value={activeLayer?.startX ?? 0}
          onCommit={controller.updateStartX}
          prompt="e.g. 3 or -2"
        />
        <AreaTargetField
          key={activeLayer?.id ?? 'none'}
          value={activeLayer?.areaFraction ?? 0}
          onCommit={controller.updateAreaFraction}
        />
        <p className="text-sm text-white/80">
          Type an area target (e.g. 66%) and B moves to match. Dragging B updates this value.
        </p>
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
