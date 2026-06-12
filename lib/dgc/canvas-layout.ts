import type { CanvasSettings, PartitionEdge, Point2D, Rect2D, Size2D } from './types';
import { canvasHeight, canvasWidth, effectiveFieldWidth, fieldOriginY } from './types';

function distanceSquared(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export class CanvasLayout {
  readonly canvas: CanvasSettings;
  readonly screenRect: Rect2D;
  readonly canvasWidthValue: number;
  readonly canvasHeightValue: number;
  readonly scale: number;

  constructor(size: Size2D, canvas: CanvasSettings, padding = 28) {
    this.canvas = canvas;
    this.canvasWidthValue = canvasWidth(canvas);
    this.canvasHeightValue = canvasHeight(canvas);

    this.scale = Math.min(
      (size.width - padding * 2) / Math.max(this.canvasWidthValue, 1),
      (size.height - padding * 2) / Math.max(this.canvasHeightValue, 1),
    );

    const rectWidth = this.canvasWidthValue * this.scale;
    const rectHeight = this.canvasHeightValue * this.scale;
    this.screenRect = {
      x: (size.width - rectWidth) / 2,
      y: (size.height - rectHeight) / 2,
      width: rectWidth,
      height: rectHeight,
    };
  }

  static fromExportScale(canvas: CanvasSettings, scale: number): CanvasLayout {
    const cw = canvasWidth(canvas);
    const ch = canvasHeight(canvas);
    return new CanvasLayout(
      { width: cw * scale, height: ch * scale },
      canvas,
      0,
    );
  }

  get fieldScreenRect(): Rect2D {
    const origin = this.screenPointCanvas(0 + this.canvas.leftMargin, fieldOriginY(this.canvas));
    const width = effectiveFieldWidth(this.canvas) * this.scale;
    const height = this.canvas.fieldHeight * this.scale;
    return {
      x: origin.x,
      y: origin.y - height,
      width,
      height,
    };
  }

  get totalPopulationBandScreenRect(): Rect2D | null {
    if (this.canvas.totalPopulationWidth <= 0) return null;
    const origin = this.screenPointCanvas(this.canvas.leftMargin, fieldOriginY(this.canvas));
    const bandTopY = origin.y;
    const bandBottomY = this.screenPointCanvas(this.canvas.leftMargin, 0).y;
    return {
      x: origin.x,
      y: bandTopY,
      width: this.canvas.totalPopulationWidth * this.scale,
      height: bandBottomY - bandTopY,
    };
  }

  /** @deprecated Use totalPopulationBandScreenRect */
  get povertyAxisBandScreenRect(): Rect2D | null {
    return this.totalPopulationBandScreenRect;
  }

  partitionLineDrawEndpoint(fromB: Point2D, toA: Point2D): Point2D {
    const band = this.totalPopulationBandScreenRect;
    if (!band) return toA;

    const dx = toA.x - fromB.x;
    const dy = toA.y - fromB.y;
    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return toA;

    let maxT = 1;
    const tol = 1;

    if (Math.abs(dy) > 1e-9) {
      for (const yEdge of [band.y + band.height, band.y]) {
        const t = (yEdge - fromB.y) / dy;
        if (t < 1 - 1e-9) continue;
        const x = fromB.x + t * dx;
        if (x >= band.x - tol && x <= band.x + band.width + tol) {
          maxT = Math.max(maxT, t);
        }
      }
    }

    if (Math.abs(dx) > 1e-9) {
      for (const xEdge of [band.x, band.x + band.width]) {
        const t = (xEdge - fromB.x) / dx;
        if (t < 1 - 1e-9) continue;
        const y = fromB.y + t * dy;
        if (y >= band.y - tol && y <= band.y + band.height + tol) {
          maxT = Math.max(maxT, t);
        }
      }
    }

    return { x: fromB.x + maxT * dx, y: fromB.y + maxT * dy };
  }

  screenPointCanvas(canvasX: number, canvasY: number): Point2D {
    const x =
      this.screenRect.x +
      (canvasX / this.canvasWidthValue) * this.screenRect.width;
    const y =
      this.screenRect.y +
      this.screenRect.height -
      (canvasY / this.canvasHeightValue) * this.screenRect.height;
    return { x, y };
  }

  screenPointField(fieldX: number, fieldY: number): Point2D {
    return this.screenPointCanvas(
      this.canvas.leftMargin + fieldX,
      fieldOriginY(this.canvas) + fieldY,
    );
  }

  canvasPointFromScreen(screenPoint: Point2D): Point2D {
    const normalizedX =
      (screenPoint.x - this.screenRect.x) / this.screenRect.width;
    const normalizedY =
      (this.screenRect.y + this.screenRect.height - screenPoint.y) /
      this.screenRect.height;
    return {
      x: this.canvasWidthValue * normalizedX,
      y: this.canvasHeightValue * normalizedY,
    };
  }

  fieldPointFromScreen(screenPoint: Point2D): Point2D {
    const canvasPoint = this.canvasPointFromScreen(screenPoint);
    return {
      x: canvasPoint.x - this.canvas.leftMargin,
      y: canvasPoint.y - fieldOriginY(this.canvas),
    };
  }

  closestFieldPerimeterPoint(screenPoint: Point2D): {
    point: Point2D;
    edge: PartitionEdge;
  } {
    const field = this.fieldScreenRect;
    const leftPoint: Point2D = {
      x: field.x,
      y: Math.min(Math.max(screenPoint.y, field.y), field.y + field.height),
    };
    const topPoint: Point2D = {
      x: Math.min(Math.max(screenPoint.x, field.x), field.x + field.width),
      y: field.y,
    };
    const rightPoint: Point2D = {
      x: field.x + field.width,
      y: Math.min(Math.max(screenPoint.y, field.y), field.y + field.height),
    };

    const candidates: [Point2D, PartitionEdge][] = [
      [leftPoint, 'left'],
      [topPoint, 'top'],
      [rightPoint, 'right'],
    ];

    let best = candidates[0];
    let bestDist = distanceSquared(candidates[0][0], screenPoint);
    for (let i = 1; i < candidates.length; i += 1) {
      const dist = distanceSquared(candidates[i][0], screenPoint);
      if (dist < bestDist) {
        best = candidates[i];
        bestDist = dist;
      }
    }

    return {
      point: this.fieldPointFromScreen(best[0]),
      edge: best[1],
    };
  }
}
