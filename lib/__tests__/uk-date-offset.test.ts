import { describe, expect, it } from 'vitest';
import {
  clampStatStrikeDayOffset,
  ukSelectionDayOffsetBetween,
} from '@/lib/statstrike/uk-date';

describe('ukSelectionDayOffsetBetween', () => {
  it('returns signed day difference', () => {
    expect(ukSelectionDayOffsetBetween('2026-07-26', '2026-07-27')).toBe(-1);
    expect(ukSelectionDayOffsetBetween('2026-07-27', '2026-07-27')).toBe(0);
    expect(ukSelectionDayOffsetBetween('2026-07-29', '2026-07-27')).toBe(2);
  });

  it('rejects bad keys', () => {
    expect(ukSelectionDayOffsetBetween('nope', '2026-07-27')).toBeNull();
  });
});

describe('clampStatStrikeDayOffset', () => {
  it('clamps to StatStrike board window', () => {
    expect(clampStatStrikeDayOffset(-20)).toBe(-7);
    expect(clampStatStrikeDayOffset(9)).toBe(2);
    expect(clampStatStrikeDayOffset(-3)).toBe(-3);
  });
});
