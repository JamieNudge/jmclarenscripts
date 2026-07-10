'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { LayerAreaPercentInput } from '@/components/dgc/LayerAreaPercentInput';
import { formatNumber } from '@/lib/dgc/document';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import { layerHandleLabelsForId, layerHandlePairLabel, MAX_LAYERS } from '@/lib/dgc/layer-handles';
import type { CustomSketchPreset } from '@/lib/dgc/sketch-preset-store';
import {
  DEFAULT_TOTAL_POPULATION_COLOR_HEX,
  DEFAULT_TOTAL_POPULATION_LABEL,
  edgeDisplayName,
} from '@/lib/dgc/types';

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
      <span className="text-base font-semibold text-[var(--dgc-text)]">{title}</span>
      <div className="relative">
        <input
          className="w-full rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-3 py-2 text-[var(--dgc-text)]"
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

export default function DgcInputForm({ controller }: { controller: DgcDocumentController }) {
  const { document } = controller;
  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [editingPreset, setEditingPreset] = useState<CustomSketchPreset | null>(null);
  const [editPresetTitle, setEditPresetTitle] = useState('');
  const [editPresetStartX, setEditPresetStartX] = useState('');
  const [editPresetAreaPercent, setEditPresetAreaPercent] = useState('');

  const displayLayerIndices = Array.from(document.layers.keys()).reverse();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-[var(--dgc-text)]">Inputs</h2>

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
          <span className="text-base font-semibold text-[var(--dgc-text)]">Label</span>
          <input
            className="w-full rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-3 py-2 text-[var(--dgc-text)]"
            value={document.canvas.totalPopulationLabel}
            placeholder={DEFAULT_TOTAL_POPULATION_LABEL}
            onChange={(event) => controller.updateTotalPopulationLabel(event.target.value)}
          />
        </label>
        <label className="flex items-center gap-3">
          <span className="text-base font-semibold text-[var(--dgc-text)]">Colour</span>
          <input
            type="color"
            value={document.canvas.totalPopulationColorHex || DEFAULT_TOTAL_POPULATION_COLOR_HEX}
            onChange={(event) => controller.updateTotalPopulationColorHex(event.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-[var(--dgc-border)] bg-transparent"
            aria-label="Total Population colour"
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
        <p className="text-sm text-[var(--dgc-text-soft)]">
          Field of Wealth sits above Total Population, left-aligned at the width percentage you
          set. Each layer starts on the bottom edge of the field; drag the end handle or type that
          layer&apos;s Field of Wealth % to move the endpoint on the preview.
        </p>
      </Panel>

      <Panel title="Built-in Sketch Cases">
        <div className="space-y-2">
          {controller.sketchPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => controller.applyPreset(preset)}
              className="flex w-full items-center justify-between rounded-lg border border-[var(--dgc-border)] px-3 py-2 text-left text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)]"
            >
              <span className="font-semibold">{preset.title}</span>
              <span className="text-sm text-[var(--dgc-text-muted)]">
                start {formatNumber(preset.startX)} · {formatNumber(preset.areaPercent)}%
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--dgc-text-faint)]">
          Applies start position and area target to the active layer.
        </p>
      </Panel>

      <Panel title="My Presets">
        {controller.customSketchPresets.length === 0 ? (
          <p className="text-sm text-[var(--dgc-text-muted)]">
            No custom presets yet. Save the active layer&apos;s settings below.
          </p>
        ) : (
          <div className="space-y-2">
            {controller.customSketchPresets.map((preset) => (
              <div key={preset.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => controller.applyCustomPreset(preset)}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--dgc-border)] px-3 py-2 text-left text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)]"
                >
                  <span className="block font-semibold">{preset.title}</span>
                  <span className="text-xs text-[var(--dgc-text-muted)]">
                    start {formatNumber(preset.startX)} · {formatNumber(preset.areaPercent)}%
                  </span>
                </button>
                <button
                  type="button"
                  className="text-sm text-[var(--dgc-text-soft)]"
                  onClick={() => {
                    setEditingPreset(preset);
                    setEditPresetTitle(preset.title);
                    setEditPresetStartX(formatNumber(preset.startX));
                    setEditPresetAreaPercent(formatNumber(preset.areaPercent));
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-sm text-red-300"
                  onClick={() => controller.deleteCustomPreset(preset.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <input
            className="min-w-0 flex-1 rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-3 py-2 text-[var(--dgc-text)]"
            value={newPresetTitle}
            placeholder="Preset name"
            onChange={(event) => setNewPresetTitle(event.target.value)}
          />
          <button
            type="button"
            disabled={!newPresetTitle.trim()}
            onClick={() => {
              controller.saveActiveLayerAsCustomPreset(newPresetTitle);
              setNewPresetTitle('');
            }}
            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Save Active Layer as Preset
          </button>
        </div>
      </Panel>

      <DgcLayersPanel controller={controller} displayLayerIndices={displayLayerIndices} />

      {editingPreset ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--dgc-overlay)] p-4">
          <div className="w-full max-w-md space-y-3 rounded-2xl border border-[var(--dgc-border)] bg-[var(--dgc-panel)] p-4 text-[var(--dgc-text)]">
            <h3 className="text-lg font-semibold">Edit Preset</h3>
            <input
              className="w-full rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-3 py-2"
              value={editPresetTitle}
              onChange={(event) => setEditPresetTitle(event.target.value)}
              placeholder="Name"
            />
            <input
              className="w-full rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-3 py-2"
              value={editPresetStartX}
              onChange={(event) => setEditPresetStartX(event.target.value)}
              placeholder="Start on bottom edge"
            />
            <input
              className="w-full rounded-lg border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-3 py-2"
              value={editPresetAreaPercent}
              onChange={(event) => setEditPresetAreaPercent(event.target.value)}
              placeholder="Area target (%)"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-[var(--dgc-border)] px-3 py-2"
                onClick={() => setEditingPreset(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-sky-600 px-3 py-2 text-white"
                onClick={() => {
                  const startX = parseNumericInput(editPresetStartX);
                  const areaPercent = parseNumericInput(editPresetAreaPercent);
                  if (!editPresetTitle.trim() || startX === null || areaPercent === null) return;
                  controller.updateCustomPreset({
                    id: editingPreset.id,
                    title: editPresetTitle.trim(),
                    startX,
                    areaPercent,
                  });
                  setEditingPreset(null);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DgcLayersPanel({
  controller,
  displayLayerIndices,
}: {
  controller: DgcDocumentController;
  displayLayerIndices: number[];
}) {
  return (
    <Panel title="Layers">
      <p className="text-xs text-[var(--dgc-text-faint)]">Top of the list is front-most on the canvas.</p>
      <div className="space-y-2">
        {displayLayerIndices.map((index) => {
          const layer = controller.document.layers[index];
          const isActive = layer.id === controller.document.activeLayerID;
          const state = controller.layerStates[layer.id];
          const handleLabels = layerHandleLabelsForId(controller.document.layers, layer.id);
          const handlePair = layerHandlePairLabel(index);
          const canMoveTowardFront = index < controller.document.layers.length - 1;
          const canMoveTowardBack = index > 0;

          return (
            <div
              key={layer.id}
              className={`rounded-xl border p-3 ${isActive ? 'border-sky-400/40 bg-sky-500/10' : 'border-[var(--dgc-border-soft)]'}`}
              onClick={() => controller.selectLayer(layer.id)}
              onKeyDown={() => controller.selectLayer(layer.id)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={!canMoveTowardFront}
                    className="text-[var(--dgc-text-soft)] disabled:opacity-30"
                    onClick={(event) => {
                      event.stopPropagation();
                      controller.moveLayerTowardFront(layer.id);
                    }}
                    aria-label="Move toward front"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveTowardBack}
                    className="text-[var(--dgc-text-soft)] disabled:opacity-30"
                    onClick={(event) => {
                      event.stopPropagation();
                      controller.moveLayerTowardBack(layer.id);
                    }}
                    aria-label="Move toward back"
                  >
                    ▼
                  </button>
                </div>

                <button
                  type="button"
                  className="text-[var(--dgc-text-soft)]"
                  onClick={(event) => {
                    event.stopPropagation();
                    controller.toggleLayerVisibility(layer.id);
                  }}
                >
                  {layer.isVisible ? '👁' : '🚫'}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[var(--dgc-chip)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--dgc-text)]">
                      {handlePair}
                    </span>
                    <input
                      className="min-w-0 flex-1 rounded border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-2 py-1 text-[var(--dgc-text)]"
                      value={layer.name}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        controller.renameLayer(layer.id, event.target.value)
                      }
                    />
                  </div>

                  <div
                    className="mt-2 space-y-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <label className="flex items-center gap-2 text-xs text-[var(--dgc-text-muted)]">
                      <span className="w-28 shrink-0">{handleLabels.start} on bottom edge</span>
                      <input
                        className="w-24 rounded border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-2 py-1 text-[var(--dgc-text)]"
                        defaultValue={formatNumber(layer.startX)}
                        onBlur={(event) => {
                          const parsed = parseNumericInput(event.target.value);
                          if (parsed !== null) {
                            controller.updateLayerStartX(layer.id, parsed);
                          }
                        }}
                      />
                    </label>

                    <label className="flex items-center gap-2 text-xs text-[var(--dgc-text-muted)]">
                      <span className="w-28 shrink-0">Field of Wealth %</span>
                      <LayerAreaPercentInput
                        value={layer.areaFraction}
                        onCommit={(fraction) =>
                          controller.updateLayerAreaFraction(layer.id, fraction)
                        }
                      />
                    </label>

                    <label className="flex items-center gap-2 text-xs text-[var(--dgc-text-muted)]">
                      Colour
                      <input
                        type="color"
                        value={layer.colorHex}
                        onChange={(event) =>
                          controller.updateLayerColor(layer.id, event.target.value)
                        }
                        className="h-8 w-10 cursor-pointer rounded border border-[var(--dgc-border)] bg-transparent"
                        aria-label={`Colour for layer ${handlePair}`}
                      />
                    </label>
                  </div>

                  {state?.result ? (
                    <p className="mt-1 text-sm text-[var(--dgc-text-muted)]">
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
          className="rounded-lg border border-[var(--dgc-border)] px-3 py-2 text-sm text-[var(--dgc-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Duplicate
        </button>
        <span className="text-xs text-[var(--dgc-text-faint)]">
          {controller.document.layers.length}/{MAX_LAYERS} layers · up to {MAX_LAYERS} per design
        </span>
      </div>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-[var(--dgc-border)] bg-[var(--dgc-panel)] p-4">
      <h3 className="text-lg font-semibold text-[var(--dgc-text)]">{title}</h3>
      {children}
    </section>
  );
}
