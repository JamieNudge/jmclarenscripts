'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as CanvasGeometry from '@/lib/dgc/canvas-geometry';
import { CanvasLayout } from '@/lib/dgc/canvas-layout';
import type { DgcDocumentController } from '@/lib/dgc/use-dgc-document';
import { edgeDisplayName, effectiveFieldWidth } from '@/lib/dgc/types';

type PreviewHandle = 'start' | 'end';

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
  const [hoveredHandle, setHoveredHandle] = useState<PreviewHandle | null>(null);
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

  const pointerToScreen = useCallback((event: React.PointerEvent | PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const nearestHandle = useCallback(
    (point: { x: number; y: number }): PreviewHandle | null => {
      if (!activeState?.result || !active) return null;
      const start = layout.screenPointField(active.startX, 0);
      const end = layout.screenPointField(
        activeState.result.endX,
        activeState.result.endY,
      );
      const startDist = distanceSquared(point, start);
      const endDist = distanceSquared(point, end);
      const hit = 70 * 70;
      if (startDist <= hit && startDist <= endDist) return 'start';
      if (endDist <= hit) return 'end';
      return null;
    },
    [active, activeState, layout],
  );

  const onPointerDown = (event: React.PointerEvent) => {
    if (!activeState?.result) return;
    const point = pointerToScreen(event);
    const handle = nearestHandle(point);
    if (!handle) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingHandle(handle);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const point = pointerToScreen(event);
    if (draggingHandle === 'start') {
      const fieldPoint = layout.fieldPointFromScreen(point);
      const clamped = Math.min(
        Math.max(fieldPoint.x, -controller.document.canvas.leftMargin),
        effectiveFieldWidth(controller.document.canvas),
      );
      controller.updateStartX(clamped);
      setReadout(`A: start x = ${formatNumber(clamped)}`);
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
        `B: ${edgeDisplayName(snapped.edge)} (${formatNumber(snapped.point.x)}, ${formatNumber(snapped.point.y)}) ${formatNumber(fraction * 100)}%`,
      );
      return;
    }
    setHoveredHandle(nearestHandle(point));
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingHandle(null);
    setHoveredHandle(null);
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
            x1={layout.screenPointCanvas(0, controller.document.canvas.bottomMargin).x}
            y1={layout.screenPointCanvas(0, controller.document.canvas.bottomMargin).y}
            x2={layout.screenPointCanvas(layout.canvasWidthValue, controller.document.canvas.bottomMargin).x}
            y2={layout.screenPointCanvas(layout.canvasWidthValue, controller.document.canvas.bottomMargin).y}
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

          {active && activeState?.result ? (
            <>
              {renderHandle(
                layout.screenPointField(active.startX, 0),
                '#FF9500',
                'A',
                hoveredHandle === 'start' || draggingHandle === 'start',
              )}
              {renderHandle(
                layout.screenPointField(
                  activeState.result.endX,
                  activeState.result.endY,
                ),
                active.colorHex,
                'B',
                hoveredHandle === 'end' || draggingHandle === 'end',
              )}
            </>
          ) : null}
        </svg>

        <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-white/15 bg-black/70 px-4 py-2 text-sm text-white">
          Drag A to choose the starting point. Drag B to adjust the target area.
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
  active: boolean,
) {
  const radius = active ? 18 : 16;
  return (
    <g key={label}>
      <circle cx={point.x} cy={point.y} r={radius} fill={color} fillOpacity={0.18} />
      <circle cx={point.x} cy={point.y} r={8} fill={color} stroke="white" strokeWidth={1.5} />
      <text
        x={point.x}
        y={point.y + (label === 'A' ? 24 : -24)}
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
