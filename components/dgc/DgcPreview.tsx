'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as CanvasGeometry from '@/lib/dgc/canvas-geometry';
import { CanvasLayout } from '@/lib/dgc/canvas-layout';
import {
  layerHandleLabelsForId,
  layerHandlePairLabel,
} from '@/lib/dgc/layer-handles';
import { LayerAreaPercentInput } from '@/components/dgc/LayerAreaPercentInput';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import { edgeDisplayName, effectiveFieldWidth, fieldOriginY, contentWidth } from '@/lib/dgc/types';

type PreviewHandle = 'start' | 'end';

interface HandleHit {
  layerId: string;
  handle: PreviewHandle;
}

interface DgcPreviewProps {
  controller: DgcDocumentController;
  fullscreen?: boolean;
  onRequestFullscreen?: () => void;
}

export default function DgcPreview({
  controller,
  fullscreen = false,
  onRequestFullscreen,
}: DgcPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 520 });
  const [draggingHandle, setDraggingHandle] = useState<PreviewHandle | null>(null);
  const [hoveredHit, setHoveredHit] = useState<HandleHit | null>(null);
  const [readout, setReadout] = useState<string | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({
        width: entry.contentRect.width,
        height: Math.max(entry.contentRect.height, fullscreen ? 400 : 360),
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [fullscreen]);

  const layout = useMemo(
    () => new CanvasLayout(size, controller.document.canvas),
    [size, controller.document.canvas],
  );
  const field = layout.fieldScreenRect;
  const band = layout.totalPopulationBandScreenRect;
  const active = controller.activeLayer;
  const activeState = controller.activeState;
  const activeLabels = active
    ? layerHandleLabelsForId(controller.document.layers, active.id)
    : { start: 'A', end: 'B' };

  const layerPickerLayout = useMemo(() => {
    const canvasRight = layout.screenRect.x + layout.screenRect.width;
    const fieldRight = field.x + field.width;
    const outerMarginWidth = size.width - canvasRight;
    const innerMarginWidth = canvasRight - fieldRight;
    const edgePadding = 12;
    const preferredWidth = 148;
    const gapAfterField = 8;

    // Prefer the black margin outside the gray canvas (original right-3 placement).
    const sideMarginWidth = Math.max(outerMarginWidth, innerMarginWidth);
    const maxWidth = Math.min(
      preferredWidth,
      Math.max(96, size.width - fieldRight - gapAfterField - edgePadding),
    );

    let left = size.width - edgePadding - maxWidth / 2;
    if (outerMarginWidth >= maxWidth + gapAfterField) {
      left = canvasRight + outerMarginWidth / 2;
    } else if (innerMarginWidth >= maxWidth + gapAfterField) {
      left = fieldRight + innerMarginWidth / 2;
    } else {
      left = Math.max(fieldRight + gapAfterField + maxWidth / 2, left);
    }

    return {
      left,
      top: field.y + field.height / 2,
      maxWidth,
      maxHeight: Math.max(Math.min(field.height - 16, 280), 96),
      sideMarginWidth,
    };
  }, [field, layout.screenRect, size.width]);

  const pointerToScreen = useCallback((event: React.PointerEvent | PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const nearestHandle = useCallback(
    (point: { x: number; y: number }): HandleHit | null => {
      const hitRadiusSquared = 70 * 70;
      let best: HandleHit | null = null;
      let bestDist = Infinity;

      for (const layer of controller.document.layers) {
        if (!layer.isVisible) continue;
        const state = controller.layerStates[layer.id];
        if (!state?.result) continue;

        const start = layout.screenPointField(state.input.startX, 0);
        const end = layout.screenPointField(state.result.endX, state.result.endY);
        const startDist = distanceSquared(point, start);
        const endDist = distanceSquared(point, end);

        if (startDist <= hitRadiusSquared && startDist < bestDist) {
          best = { layerId: layer.id, handle: 'start' };
          bestDist = startDist;
        }
        if (endDist <= hitRadiusSquared && endDist < bestDist) {
          best = { layerId: layer.id, handle: 'end' };
          bestDist = endDist;
        }
      }

      return best;
    },
    [controller.document.layers, controller.layerStates, layout],
  );

  const beginHandleInteraction = (hit: HandleHit) => {
    if (hit.layerId !== controller.document.activeLayerID) {
      controller.selectLayer(hit.layerId);
    }
    setDraggingHandle(hit.handle);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    const point = pointerToScreen(event);
    const hit = nearestHandle(point);
    if (!hit) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    beginHandleInteraction(hit);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const point = pointerToScreen(event);
    const labels = active
      ? layerHandleLabelsForId(controller.document.layers, active.id)
      : activeLabels;

    if (draggingHandle === 'start' && active) {
      const fieldPoint = layout.fieldPointFromScreen(point);
      const clamped = Math.min(
        Math.max(fieldPoint.x, 0),
        effectiveFieldWidth(controller.document.canvas),
      );
      controller.updateStartX(clamped);
      setReadout(`${labels.start}: start x = ${formatNumber(clamped)}`);
      return;
    }
    if (draggingHandle === 'end' && active && activeState?.result) {
      const snapped = layout.closestFieldPerimeterPoint(point);
      controller.updateAreaFromPreview(
        snapped.point.x,
        snapped.point.y,
        snapped.edge,
      );
      const fraction =
        controller.layerStates[active.id]?.result?.areaFraction ?? 0;
      setReadout(
        `${labels.end}: ${edgeDisplayName(snapped.edge)} (${formatNumber(snapped.point.x)}, ${formatNumber(snapped.point.y)}) ${formatNumber(fraction * 100)}%`,
      );
      return;
    }
    setHoveredHit(nearestHandle(point));
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingHandle(null);
    setHoveredHit(null);
    setReadout(null);
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-[#1b1b1d] p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Field of Wealth - Preview</h2>
        {onRequestFullscreen && !fullscreen ? (
          <button
            type="button"
            onClick={onRequestFullscreen}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            Present Full Screen Preview
          </button>
        ) : null}
      </div>

      <p className="mb-3 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-center text-sm text-white/90">
        Drag {activeLabels.start} along the bottom edge. Drag {activeLabels.end} to the left, top,
        or right edge to set the target area.
      </p>

      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-xl bg-[#111] ${fullscreen ? 'min-h-[70vh]' : 'min-h-[420px]'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg width={size.width} height={size.height} className="block">
          <rect
            x={layout.screenRect.x}
            y={layout.screenRect.y}
            width={layout.screenRect.width}
            height={layout.screenRect.height}
            fill="#2a2a2c"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1}
          />

          {band ? (
            <>
              <rect
                x={band.x}
                y={band.y}
                width={band.width}
                height={band.height}
                fill="rgba(255,149,0,0.16)"
                stroke="rgba(255,149,0,0.65)"
                strokeWidth={2}
              />
              <text
                x={band.x + band.width / 2}
                y={band.y + band.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={12}
                fontWeight={500}
              >
                {controller.document.canvas.totalPopulationLabel.trim() ||
                  'Total Population'}
              </text>
            </>
          ) : null}

          <line
            x1={layout.screenPointCanvas(0, fieldOriginY(controller.document.canvas)).x}
            y1={layout.screenPointCanvas(0, fieldOriginY(controller.document.canvas)).y}
            x2={layout.screenPointCanvas(contentWidth(controller.document.canvas), fieldOriginY(controller.document.canvas)).x}
            y2={layout.screenPointCanvas(contentWidth(controller.document.canvas), fieldOriginY(controller.document.canvas)).y}
            stroke="#888"
            strokeWidth={2}
            strokeLinecap="round"
          />

          <rect
            x={field.x}
            y={field.y}
            width={field.width}
            height={field.height}
            fill="#0d0d0f"
            stroke="white"
            strokeWidth={2}
          />
          <text
            x={field.x + field.width / 2}
            y={field.y - 10}
            textAnchor="middle"
            fill="white"
            fontSize={12}
            fontWeight={600}
          >
            Field of Wealth
          </text>

          {controller.document.layers.map((layer) => {
            if (!layer.isVisible) return null;
            const state = controller.layerStates[layer.id];
            if (!state?.result) return null;
            const isActive = layer.id === controller.document.activeLayerID;
            const vertices = CanvasGeometry.partitionPolygonInsideField(
              state.input.width,
              state.input.height,
              state.input.startX,
              state.result.endX,
              state.result.endY,
              state.result.edge,
            );
            if (vertices.length < 3) return null;
            const points = vertices
              .map((v) => layout.screenPointField(v.x, v.y))
              .map((p) => `${p.x},${p.y}`)
              .join(' ');
            return (
              <polygon
                key={`fill-${layer.id}`}
                points={points}
                fill={layer.colorHex}
                fillOpacity={isActive ? 0.28 : 0.14}
              />
            );
          })}

          {controller.document.layers.map((layer) => {
            if (!layer.isVisible) return null;
            const state = controller.layerStates[layer.id];
            if (!state?.result) return null;
            const isActive = layer.id === controller.document.activeLayerID;
            const start = layout.screenPointField(state.input.startX, 0);
            const end = layout.screenPointField(state.result.endX, state.result.endY);
            const lineEnd = layout.partitionLineDrawEndpoint(end, start);
            return (
              <line
                key={`line-${layer.id}`}
                x1={end.x}
                y1={end.y}
                x2={lineEnd.x}
                y2={lineEnd.y}
                stroke={layer.colorHex}
                strokeWidth={isActive ? 3 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {controller.document.layers.map((layer) => {
            if (!layer.isVisible) return null;
            const state = controller.layerStates[layer.id];
            if (!state?.result) return null;
            const isActive = layer.id === controller.document.activeLayerID;
            const labels = layerHandleLabelsForId(controller.document.layers, layer.id);
            const startHovered =
              hoveredHit?.layerId === layer.id && hoveredHit.handle === 'start';
            const endHovered =
              hoveredHit?.layerId === layer.id && hoveredHit.handle === 'end';
            const startDragging = isActive && draggingHandle === 'start';
            const endDragging = isActive && draggingHandle === 'end';

            return (
              <g key={`handles-${layer.id}`}>
                {renderHandle(
                  layout.screenPointField(state.input.startX, 0),
                  '#FF9500',
                  labels.start,
                  'start',
                  startHovered || startDragging,
                  !isActive,
                )}
                {renderHandle(
                  layout.screenPointField(state.result.endX, state.result.endY),
                  layer.colorHex,
                  labels.end,
                  'end',
                  endHovered || endDragging,
                  !isActive,
                )}
              </g>
            );
          })}
        </svg>

        <div
          className="pointer-events-auto absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1 overflow-y-auto rounded-xl border border-white/15 bg-black/75 p-1.5"
          style={{
            left: layerPickerLayout.left,
            top: layerPickerLayout.top,
            width: layerPickerLayout.maxWidth,
            maxHeight: layerPickerLayout.maxHeight,
          }}
        >
          {controller.document.layers.map((layer, index) => {
            const isActive = layer.id === controller.document.activeLayerID;
            return (
              <div
                key={layer.id}
                className={`rounded-lg px-2 py-1.5 text-left text-xs transition ${
                  isActive
                    ? 'bg-sky-500/25 font-semibold text-sky-100 ring-1 ring-sky-400/40'
                    : 'text-white/80 hover:bg-white/10'
                } ${!layer.isVisible ? 'opacity-50' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => controller.selectLayer(layer.id)}
                  className="w-full text-left"
                  title={layer.name}
                >
                  <span className="font-mono text-[11px] font-bold">{layerHandlePairLabel(index)}</span>
                  <span className="mt-0.5 block truncate text-[10px] opacity-80">{layer.name}</span>
                </button>
                <label
                  className="mt-1 flex items-center gap-1"
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <span className="shrink-0 text-[10px] opacity-70">Field %</span>
                  <LayerAreaPercentInput
                    value={layer.areaFraction}
                    className="w-14 min-w-0 rounded border border-white/15 bg-[#111] px-1.5 py-0.5 text-[11px] text-white"
                    onCommit={(fraction) =>
                      controller.updateLayerAreaFraction(layer.id, fraction)
                    }
                  />
                </label>
              </div>
            );
          })}
        </div>

        {readout ? (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/80 px-4 py-2 text-sm font-semibold text-white">
            {readout}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function renderHandle(
  point: { x: number; y: number },
  color: string,
  label: string,
  role: PreviewHandle,
  active: boolean,
  dimmed: boolean,
) {
  const radius = active ? 18 : dimmed ? 12 : 16;
  const opacity = dimmed ? 0.45 : 1;
  return (
    <g key={`${label}-${role}`} opacity={opacity}>
      <circle cx={point.x} cy={point.y} r={radius} fill={color} fillOpacity={0.18} />
      <circle
        cx={point.x}
        cy={point.y}
        r={active ? 8 : 6}
        fill={color}
        stroke="white"
        strokeWidth={1.5}
      />
      <text
        x={point.x}
        y={point.y + (role === 'start' ? 24 : -24)}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontWeight={700}
      >
        {label}
      </text>
    </g>
  );
}

function distanceSquared(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function formatNumber(value: number) {
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}
