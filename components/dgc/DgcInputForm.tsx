'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { LayerAreaPercentInput } from '@/components/dgc/LayerAreaPercentInput';
import { formatNumber, newLayerId } from '@/lib/dgc/document';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import { layerHandleLabelsForId, layerHandlePairLabel, MAX_LAYERS } from '@/lib/dgc/layer-handles';
import type { CustomSketchPreset } from '@/lib/dgc/sketch-preset-store';
import {
  DEFAULT_TOTAL_POPULATION_COLOR_HEX,
  DEFAULT_TOTAL_POPULATION_LABEL,
  edgeDisplayName,
} from '@/lib/dgc/types';
import { getWealthDataset } from '@/lib/dgc/wealth-data';
import { formatStatValue } from '@/lib/dgc/wealth-data/schema';
import {
  WEALTH_LAYER_BLUEPRINT,
  wealthRowToDesign,
  wealthYearEligibility,
} from '@/lib/dgc/wealth-data/to-design-state';

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

function InlineNumericInput({
  value,
  onCommit,
  className = 'w-28 rounded border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-2 py-1 text-[var(--dgc-text)]',
}: {
  value: number;
  onCommit: (value: number) => void;
  className?: string;
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
    <input
      className={className}
      value={focused ? draft : formatNumber(value)}
      inputMode="decimal"
      onPointerDown={(event) => event.stopPropagation()}
      onFocus={() => {
        setFocused(true);
        setDraft(formatNumber(value));
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
      }}
      onChange={(event) => setDraft(event.target.value)}
    />
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

      <WealthYearPanel controller={controller} />

      <CollapsiblePanel title="Manual Geometry" summary="Fine-tune population and field dimensions.">
        <div className="space-y-4">
          <div className="space-y-3 rounded-xl border border-[var(--dgc-border-soft)] p-3">
            <h4 className="font-semibold text-[var(--dgc-text)]">Total Population</h4>
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
          </div>

          <div className="space-y-3 rounded-xl border border-[var(--dgc-border-soft)] p-3">
            <h4 className="font-semibold text-[var(--dgc-text)]">Field of Wealth</h4>
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
              set. Each layer starts on the bottom edge of the field; drag the end handle or type the
              wealth area target to move the endpoint on the preview.
            </p>
          </div>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="Built-in Sketch Cases" summary="Optional manual starting points.">
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
      </CollapsiblePanel>

      <CollapsiblePanel title="My Presets" summary="Save or reuse manual layer settings.">
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
      </CollapsiblePanel>

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

function WealthYearPanel({ controller }: { controller: DgcDocumentController }) {
  const dataset = useMemo(() => getWealthDataset(), []);
  const eligibleRows = useMemo(
    () =>
      dataset.rows.map((row) => ({
        row,
        eligibility: wealthYearEligibility(row),
      })),
    [dataset],
  );
  const selectableRows = eligibleRows.filter((entry) => entry.eligibility.eligible);
  const defaultYear =
    selectableRows.at(-1)?.row.reportYear ?? null;
  const [selectedYear, setSelectedYear] = useState<number | null>(defaultYear);

  const selected = eligibleRows.find((entry) => entry.row.reportYear === selectedYear) ?? null;
  const selectedIndex = Math.max(
    selectableRows.findIndex((entry) => entry.row.reportYear === selectedYear),
    0,
  );
  const earliestYear = selectableRows[0]?.row.reportYear;
  const latestYear = selectableRows.at(-1)?.row.reportYear;

  const handleApply = (alsoSaveState: boolean) => {
    if (!selected?.eligibility.eligible) return;
    const design = wealthRowToDesign(selected.row, dataset.version);
    controller.applyWealthYearDesign(design);
    if (alsoSaveState) {
      controller.saveTimelineState({
        id: newLayerId(),
        year: design.year,
        label: String(design.year),
        datasetVersion: dataset.version,
        provenance: design.provenance,
        savedAt: new Date().toISOString(),
        canvas: design.canvas,
        layers: design.layers,
      });
    }
  };

  return (
    <Panel title="Historical Wealth Data">
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
        <p className="text-sm font-medium text-[var(--dgc-text)]">Start from verified data</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--dgc-text-soft)]">
          Pick a year and load the diagram from the verified US household wealth dataset. The
          population axis is normalised to 0–100 with boundaries at 50 / 90 / 99 / 99.9.{' '}
          <a href="/dgc/data" className="text-sky-400 underline hover:text-sky-300">
            Check the data
          </a>
        </p>
      </div>

      <details className="group rounded-lg border border-[var(--dgc-border-soft)] bg-[var(--dgc-hover)]/60">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-medium text-[var(--dgc-text-soft)] [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden="true"
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--dgc-border-strong)] font-serif text-[10px]"
          >
            i
          </span>
          Why only {earliestYear}–{latestYear}?
          <span
            aria-hidden="true"
            className="ml-auto text-[var(--dgc-text-muted)] transition-transform group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <div className="space-y-2 border-t border-[var(--dgc-border-soft)] px-3 py-3 text-xs leading-relaxed text-[var(--dgc-text-soft)]">
          <p>
            The historical primary sources report top 10%, top 1%, and top 0.1% wealth shares,
            but do not report the bottom 50% / 50–90% split before 1962. The first complete
            five-year dataset point is therefore 1965.
          </p>
          <p>
            This diagram needs all five wealth groups, so earlier years are disabled rather than
            filled with estimates. The verified full-diagram and animation range is 1965–2025.
          </p>
          <p>
            Earlier decades could only be shown using a separate reduced three-layer view for the
            top 10%, top 1%, and top 0.1%; that is not mixed into this comparable timeline.
          </p>
        </div>
      </details>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-[var(--dgc-text)]">Year</span>
          <span className="rounded-full bg-[var(--dgc-chip)] px-3 py-1 text-sm font-semibold text-[var(--dgc-text)]">
            {selectedYear}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(selectableRows.length - 1, 0)}
          step={1}
          value={selectedIndex}
          onChange={(event) => {
            const next = selectableRows[Number(event.target.value)];
            if (next) setSelectedYear(next.row.reportYear);
          }}
          className="w-full accent-sky-500"
          aria-label="Historical wealth data year"
        />
        <div className="flex justify-between text-[10px] text-[var(--dgc-text-muted)]">
          <span>{earliestYear}</span>
          <span>{selectableRows[Math.floor(selectableRows.length / 2)]?.row.reportYear}</span>
          <span>{latestYear}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {selectableRows.map(({ row }) => (
            <button
              key={row.reportYear}
              type="button"
              onClick={() => setSelectedYear(row.reportYear)}
              className={`rounded-full px-2.5 py-1 text-xs transition ${
                row.reportYear === selectedYear
                  ? 'bg-sky-600 font-semibold text-white'
                  : 'bg-[var(--dgc-chip)] text-[var(--dgc-text-soft)] hover:bg-[var(--dgc-hover-strong)]'
              }`}
            >
              {row.reportYear}
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        selected.eligibility.eligible ? (
          <div className="space-y-3 rounded-xl border border-[var(--dgc-border-soft)] bg-[var(--dgc-hover)] p-3 text-xs text-[var(--dgc-text-soft)]">
            <div className="grid grid-cols-2 gap-2">
              <MetricChip label="Population" value={formatStatValue(selected.row.totalPopulation)} />
              <MetricChip label="Households" value={formatStatValue(selected.row.householdCount)} />
              <MetricChip label="Total wealth" value={formatStatValue(selected.row.totalHouseholdWealth)} />
              <MetricChip label="Zero/negative" value={formatStatValue(selected.row.zeroOrNegativeWealth)} />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[var(--dgc-text)]">Wealth bucket shares</p>
              <div className="grid grid-cols-2 gap-1.5">
                <MetricChip label="Bottom 50%" value={formatStatValue(selected.row.shareBottom50Pct)} />
                <MetricChip label="50-90%" value={formatStatValue(selected.row.share50to90Pct)} />
                <MetricChip label="90-99%" value={formatStatValue(selected.row.share90to99Pct)} />
                <MetricChip label="99-99.9%" value={formatStatValue(selected.row.share99to999Pct)} />
                <MetricChip label="Top 0.1%" value={formatStatValue(selected.row.shareTop01Pct)} />
              </div>
            </div>
            <WealthLayerLegend />
          </div>
        ) : (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-[var(--dgc-text-soft)]">
            {selected.eligibility.reason}
          </p>
        )
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!selected?.eligibility.eligible}
          onClick={() => handleApply(false)}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Load selected year
        </button>
        <button
          type="button"
          disabled={!selected?.eligibility.eligible}
          onClick={() => handleApply(true)}
          className="rounded-lg border border-[var(--dgc-border)] px-3 py-2 text-sm text-[var(--dgc-text)] hover:bg-[var(--dgc-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add year to timeline
        </button>
      </div>
    </Panel>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--dgc-border-soft)] bg-[var(--dgc-panel)] px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-[var(--dgc-text-muted)]">{label}</p>
      <p className="mt-0.5 font-semibold text-[var(--dgc-text)]">{value}</p>
    </div>
  );
}

function WealthLayerLegend() {
  return (
    <div className="space-y-2 border-t border-[var(--dgc-border-soft)] pt-3">
      <p className="text-[11px] font-semibold text-[var(--dgc-text)]">
        Diagram layers are cumulative wealth boundaries
      </p>
      <div className="grid gap-1.5">
        {WEALTH_LAYER_BLUEPRINT.map((layer) => (
          <div key={layer.boundary} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: layer.colorHex }}
              aria-hidden="true"
            />
            <span className="text-[var(--dgc-text-soft)]">
              {layer.name} boundary at {layer.boundary}% of population
            </span>
          </div>
        ))}
      </div>
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
              className={`rounded-xl border p-3 ${
                isActive
                  ? 'border-[var(--dgc-accent-border)] bg-[var(--dgc-accent-surface)]'
                  : 'border-[var(--dgc-border-soft)]'
              }`}
              onClick={() => controller.selectLayer(layer.id)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  controller.selectLayer(layer.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="flex flex-wrap items-start gap-2">
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

                <div className="min-w-0 flex-[1_1_15rem]">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded bg-[var(--dgc-chip)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--dgc-text)]">
                      {handlePair}
                    </span>
                    <input
                      className="min-w-0 flex-1 rounded border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-2 py-1 text-[var(--dgc-text)]"
                      value={layer.name}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                      onChange={(event) =>
                        controller.renameLayer(layer.id, event.target.value)
                      }
                    />
                  </div>

                  <div
                    className="mt-2 space-y-2"
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <label className="grid grid-cols-[minmax(0,1fr)_minmax(4.75rem,8rem)] items-center gap-2 text-xs text-[var(--dgc-text-muted)]">
                      <span className="min-w-0">{handleLabels.start} on bottom edge</span>
                      <InlineNumericInput
                        value={layer.startX}
                        onCommit={(value) => controller.updateLayerStartX(layer.id, value)}
                        className="min-w-0 w-full rounded border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-2 py-1 text-[var(--dgc-text)]"
                      />
                    </label>

                    <label className="grid grid-cols-[minmax(0,1fr)_minmax(4.75rem,8rem)] items-center gap-2 text-xs text-[var(--dgc-text-muted)]">
                      <span className="min-w-0">Field of Wealth %</span>
                      <LayerAreaPercentInput
                        value={layer.areaFraction}
                        onCommit={(fraction) =>
                          controller.updateLayerAreaFraction(layer.id, fraction)
                        }
                        className="min-w-0 w-full rounded border border-[var(--dgc-border)] bg-[var(--dgc-input)] px-2 py-1 text-sm text-[var(--dgc-text)]"
                      />
                    </label>

                    <label className="flex flex-wrap items-center gap-2 text-xs text-[var(--dgc-text-muted)]">
                      <span className="min-w-0">Colour</span>
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

                {isActive || controller.document.layers.length > 1 ? (
                  <div className="ml-auto flex shrink-0 items-center gap-2 self-start">
                    {isActive ? (
                      <span className="rounded-full bg-[var(--dgc-accent-surface)] px-2 py-1 text-xs font-semibold text-[var(--dgc-accent-text)]">
                        Active
                      </span>
                    ) : null}

                    {controller.document.layers.length > 1 ? (
                      <button
                        type="button"
                        className="text-[var(--dgc-danger-text)]"
                        onClick={(event) => {
                          event.stopPropagation();
                          controller.deleteLayer(layer.id);
                        }}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
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

function CollapsiblePanel({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-[var(--dgc-border)] bg-[var(--dgc-panel)] p-4">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-lg font-semibold text-[var(--dgc-text)]">{title}</span>
          <span className="mt-0.5 block text-xs text-[var(--dgc-text-muted)]">{summary}</span>
        </span>
        <span
          aria-hidden="true"
          className="mt-1 text-[var(--dgc-text-muted)] transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="mt-4 space-y-3">{children}</div>
    </details>
  );
}
