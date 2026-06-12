import { describe, expect, it } from 'vitest';
import { solve, areaForRegion } from '../partition-solver';
import { PartitionSolverError, type SolverInput } from '../types';

function input(partial: Partial<SolverInput> & Pick<SolverInput, 'width' | 'height' | 'startX' | 'areaFraction'>): SolverInput {
  return {
    minStartX: partial.minStartX ?? 0,
    ...partial,
  };
}

describe('PartitionSolver', () => {
  it('solves left edge case', () => {
    const result = solve(input({ width: 10, height: 8, startX: 2, areaFraction: 0.05 }));
    expect(result.edge).toBe('left');
    expect(result.endX).toBeCloseTo(0, 4);
    expect(result.endY).toBeCloseTo(4, 4);
    expect(result.computedArea).toBeCloseTo(4, 4);
  });

  it('solves top edge case', () => {
    const result = solve(input({ width: 10, height: 8, startX: 2, areaFraction: 0.4 }));
    expect(result.edge).toBe('top');
    expect(result.endX).toBeCloseTo(6, 4);
    expect(result.endY).toBeCloseTo(8, 4);
    expect(result.computedArea).toBeCloseTo(32, 4);
  });

  it('solves right edge case', () => {
    const result = solve(input({ width: 10, height: 8, startX: 2, areaFraction: 0.8 }));
    expect(result.edge).toBe('right');
    expect(result.endX).toBeCloseTo(10, 4);
    expect(result.endY).toBeCloseTo(4, 4);
    expect(result.computedArea).toBeCloseTo(64, 4);
  });

  it('rejects start before bottom-left corner', () => {
    expect(() =>
      solve(input({ width: 10, height: 8, startX: -2, areaFraction: 0.15 })),
    ).toThrow(PartitionSolverError);
  });

  it('rejects invalid area fraction', () => {
    expect(() =>
      solve(input({ width: 10, height: 8, startX: 2, areaFraction: 1.2 })),
    ).toThrow(PartitionSolverError);
  });

  it('rejects out of range start position', () => {
    expect(() =>
      solve(input({ width: 10, height: 8, startX: 12, areaFraction: 0.2 })),
    ).toThrow(PartitionSolverError);
  });

  it('areaForRegion matches solver for top edge', () => {
    const result = solve(input({ width: 10, height: 8, startX: 2, areaFraction: 0.4 }));
    const area = areaForRegion(10, 8, 2, result.edge, result.endX, result.endY);
    expect(area).toBeCloseTo(result.computedArea, 4);
  });
});
