import { describe, expect, it } from 'vitest';
import { getWealthDataset } from '../wealth-data';
import { REPORT_YEARS, shareBucketSum, tierForYear } from '../wealth-data/schema';
import { datasetToCsv } from '../wealth-data/export-utils';

describe('wealth dataset', () => {
  const dataset = getWealthDataset();

  it('has 22 rows on the five-year grid ending 2025', () => {
    expect(dataset.rows).toHaveLength(22);
    expect(dataset.rows.map((r) => r.reportYear)).toEqual(REPORT_YEARS);
  });

  it('assigns tiers by era', () => {
    expect(tierForYear(1955)).toBe(3);
    expect(tierForYear(1970)).toBe(2);
    expect(tierForYear(2000)).toBe(1);
  });

  it('requires sources on populated cells', () => {
    for (const row of dataset.rows) {
      for (const key of [
        'totalHouseholdWealth',
        'shareTop01Pct',
        'shareBottom50Pct',
      ] as const) {
        const cell = row[key];
        if (cell.value !== null) {
          expect(cell.source, `${row.reportYear} ${key}`).not.toBeNull();
          expect(cell.source?.url).toMatch(/^https?:\/\//);
        }
      }
    }
  });

  it('wealth share buckets sum to ~100% when all populated', () => {
    for (const row of dataset.rows) {
      const sum = shareBucketSum(row);
      if (sum !== null) {
        expect(sum).toBeGreaterThanOrEqual(99);
        expect(sum).toBeLessThanOrEqual(101);
      }
    }
  });

  it('marks pre-1960 zero-wealth as N/A', () => {
    for (const row of dataset.rows.filter((r) => r.reportYear < 1960)) {
      expect(row.zeroOrNegativeWealth.value).toBeNull();
      expect(row.zeroOrNegativeWealth.confidence).toBe('na');
    }
  });

  it('exports CSV with header row', () => {
    const csv = datasetToCsv(dataset.rows);
    expect(csv.split('\n')[0]).toContain('Year');
    expect(csv.split('\n').length).toBe(23);
  });

  it('includes definitions text', () => {
    expect(dataset.definitions.householdWealth.length).toBeGreaterThan(100);
    expect(dataset.definitions.household.length).toBeGreaterThan(50);
  });
});
