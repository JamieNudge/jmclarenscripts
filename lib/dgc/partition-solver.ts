import * as CanvasGeometry from './canvas-geometry';
import type {
  PartitionEdge,
  PartitionResult,
  SolverInput,
} from './types';
import { PartitionSolverError } from './types';

const TOLERANCE = 1e-9;

function clamp(value: number, lower: number, upper: number): number {
  return Math.min(Math.max(value, lower), upper);
}

function validate(input: SolverInput): void {
  if (input.width <= 0) {
    throw new PartitionSolverError('invalidWidth', 'Width must be greater than zero.');
  }
  if (input.height <= 0) {
    throw new PartitionSolverError('invalidHeight', 'Height must be greater than zero.');
  }
  if (
    input.startX < input.minStartX - TOLERANCE ||
    input.startX > input.width + TOLERANCE
  ) {
    throw new PartitionSolverError(
      'invalidStartX',
      'Start position is outside the allowed axis range.',
    );
  }
  if (input.areaFraction <= 0 || input.areaFraction >= 1) {
    throw new PartitionSolverError(
      'invalidAreaFraction',
      'Area target must be greater than 0% and less than 100%.',
    );
  }
}

function makeResult(
  edge: PartitionEdge,
  input: SolverInput,
  endX: number,
  endY: number,
): PartitionResult {
  const computedArea = areaForRegion(
    input.width,
    input.height,
    input.startX,
    edge,
    endX,
    endY,
  );
  return {
    edge,
    endX,
    endY,
    targetArea: input.width * input.height * input.areaFraction,
    computedArea,
    areaFraction: computedArea / (input.width * input.height),
  };
}

function solveInsideStart(input: SolverInput): PartitionResult {
  const { width, height, startX } = input;
  const targetArea = width * height * input.areaFraction;
  const leftThreshold = (startX * height) / 2;
  const topThreshold = (height * (startX + width)) / 2;

  if (startX > TOLERANCE && targetArea <= leftThreshold + TOLERANCE) {
    const endY = clamp((2 * targetArea) / startX, 0, height);
    return makeResult('left', input, 0, endY);
  }

  if (targetArea <= topThreshold + TOLERANCE) {
    const endX = clamp(2 * targetArea / height - startX, 0, width);
    return makeResult('top', input, endX, height);
  }

  const denominator = width - startX;
  if (denominator <= TOLERANCE) {
    throw new PartitionSolverError(
      'unsolvedEdge',
      'The solver could not place an endpoint on the right edge for this input.',
    );
  }

  const endY = clamp(
    (2 * (width * height - targetArea)) / denominator,
    0,
    height,
  );
  return makeResult('right', input, width, endY);
}

export function solve(input: SolverInput): PartitionResult {
  validate(input);
  return solveInsideStart(input);
}

export function areaForRegion(
  width: number,
  height: number,
  startX: number,
  edge: PartitionEdge,
  endX: number,
  endY: number,
): number {
  switch (edge) {
    case 'left':
      return (startX * endY) / 2;
    case 'top':
      return (height * (startX + endX)) / 2;
    case 'right':
      return width * height - ((width - startX) * endY) / 2;
  }
}
