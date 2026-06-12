import type { CanvasSettings, PartitionEdge, Point2D } from './types';

export function partitionPolygonInsideField(
  fieldWidth: number,
  fieldHeight: number,
  startX: number,
  endX: number,
  endY: number,
  edge: PartitionEdge,
): Point2D[] {
  const start: Point2D = { x: startX, y: 0 };
  const end: Point2D = { x: endX, y: endY };
  const bottomLeft: Point2D = { x: 0, y: 0 };
  const topLeft: Point2D = { x: 0, y: fieldHeight };
  const topRight: Point2D = { x: fieldWidth, y: fieldHeight };

  let unclipped: Point2D[];
  switch (edge) {
    case 'left':
      unclipped = [bottomLeft, start, end];
      break;
    case 'top':
      unclipped = [bottomLeft, start, end, topLeft];
      break;
    case 'right':
      unclipped = [bottomLeft, start, end, topRight, topLeft];
      break;
  }

  const clipped = clipPolygonToField(unclipped, fieldWidth, fieldHeight);
  if (clipped.length === 0) {
    return clipHalfPlaneContainingOrigin(
      fieldRectangle(fieldWidth, fieldHeight),
      start,
      end,
    );
  }
  return clipped;
}

export function partitionedAreaInsideField(
  fieldWidth: number,
  fieldHeight: number,
  startX: number,
  endX: number,
  endY: number,
  edge: PartitionEdge,
): number {
  const polygon = partitionPolygonInsideField(
    fieldWidth,
    fieldHeight,
    startX,
    endX,
    endY,
    edge,
  );
  return polygonArea(polygon);
}

export function polygonArea(vertices: Point2D[]): number {
  if (vertices.length < 3) return 0;
  let sum = 0;
  for (let index = 0; index < vertices.length; index += 1) {
    const next = (index + 1) % vertices.length;
    sum += vertices[index].x * vertices[next].y;
    sum -= vertices[next].x * vertices[index].y;
  }
  return Math.abs(sum) / 2;
}

export function fieldOriginInCanvas(canvas: CanvasSettings): Point2D {
  return { x: canvas.leftMargin, y: canvas.bottomMargin };
}

function fieldRectangle(fieldWidth: number, fieldHeight: number): Point2D[] {
  return [
    { x: 0, y: 0 },
    { x: fieldWidth, y: 0 },
    { x: fieldWidth, y: fieldHeight },
    { x: 0, y: fieldHeight },
  ];
}

function clipPolygonToField(
  polygon: Point2D[],
  fieldWidth: number,
  fieldHeight: number,
): Point2D[] {
  let result = polygon;
  result = clipPolygon(result, (p) => p.x >= -1e-9);
  result = clipPolygon(result, (p) => p.x <= fieldWidth + 1e-9);
  result = clipPolygon(result, (p) => p.y >= -1e-9);
  result = clipPolygon(result, (p) => p.y <= fieldHeight + 1e-9);
  return result.filter(
    (p) =>
      p.x >= -1e-9 &&
      p.x <= fieldWidth + 1e-9 &&
      p.y >= -1e-9 &&
      p.y <= fieldHeight + 1e-9,
  );
}

function clipPolygon(polygon: Point2D[], inside: (p: Point2D) => boolean): Point2D[] {
  if (polygon.length === 0) return [];
  const output: Point2D[] = [];
  let previous = polygon[polygon.length - 1];
  for (const current of polygon) {
    const currentInside = inside(current);
    const previousInside = inside(previous);
    if (currentInside) {
      if (!previousInside) {
        const intersection = intersectSegmentWithBoundary(previous, current, inside);
        if (intersection) output.push(intersection);
      }
      output.push(current);
    } else if (previousInside) {
      const intersection = intersectSegmentWithBoundary(previous, current, inside);
      if (intersection) output.push(intersection);
    }
    previous = current;
  }
  return output;
}

function intersectSegmentWithBoundary(
  a: Point2D,
  b: Point2D,
  inside: (p: Point2D) => boolean,
): Point2D | null {
  for (let t = 0; t <= 1.0; t += 0.02) {
    const point: Point2D = {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
    if (inside(point)) return point;
  }
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function clipHalfPlaneContainingOrigin(
  polygon: Point2D[],
  lineStart: Point2D,
  lineEnd: Point2D,
): Point2D[] {
  const origin: Point2D = { x: 0, y: 0 };
  const containsOrigin = isPointInPartitionHalfPlane(origin, lineStart, lineEnd);
  return polygon.filter(
    (point) =>
      isPointInPartitionHalfPlane(point, lineStart, lineEnd) === containsOrigin,
  );
}

function isPointInPartitionHalfPlane(
  point: Point2D,
  lineStart: Point2D,
  lineEnd: Point2D,
): boolean {
  const cross =
    (lineEnd.x - lineStart.x) * (point.y - lineStart.y) -
    (lineEnd.y - lineStart.y) * (point.x - lineStart.x);
  const originCross =
    (lineEnd.x - lineStart.x) * (0 - lineStart.y) -
    (lineEnd.y - lineStart.y) * (0 - lineStart.x);
  if (Math.abs(originCross) < 1e-9) {
    return cross >= -1e-9;
  }
  return (
    (cross >= -1e-9 && originCross >= -1e-9) ||
    (cross <= 1e-9 && originCross <= 1e-9)
  );
}
