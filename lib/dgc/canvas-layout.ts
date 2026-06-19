import type { CanvasSettings, PartitionEdge, Point2D, Rect2D, Size2D } from './types';
import { canvasHeight, canvasWidth, effectiveFieldWidth, fieldOriginY } from './types';

/** Inset so 1–2px strokes are not clipped on export edges. */
export const EXPORT_FRAME_PADDING = 2;

function distanceSquared(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export class CanvasLayout {
  readonly canvas: CanvasSettings;
  readonly screenRect: Rect2D;
  readonly outputWidth: number;
  readonly outputHeight: number;
  readonly canvasWidthValue: number;
  readonly canvasHeightValue: number;
  readonly scale: number;

  constructor(size: Size2D, canvas: CanvasSettings, padding = 28) {
    this.canvas = canvas;
    this.canvasWidthValue = canvasWidth(canvas);
    this.canvasHeightValue = canvasHeight(canvas);
    this.outputWidth = size.width;
    this.outputHeight = size.height;

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
    const padding = EXPORT_FRAME_PADDING;
    return new CanvasLayout(
      { width: cw * scale + padding * 2, height: ch * scale + padding * 2 },
      canvas,
      padding,
    );
  }

  get fieldScreenRect(): Rect2D {
    const origin = this.screenPointCanvas(0, fieldOriginY(this.canvas));
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
    const origin = this.screenPointCanvas(0, fieldOriginY(this.canvas));
    const bandTopY = origin.y;
    const bandBottomY = this.screenPointCanvas(0, 0).y;
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

  partitionLineDrawEndpoint(_fromB: Point2D, toA: Point2D): Point2D {
    return toA;
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
    return this.screenPointCanvas(fieldX, fieldOriginY(this.canvas) + fieldY);
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
      x: canvasPoint.x,
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
