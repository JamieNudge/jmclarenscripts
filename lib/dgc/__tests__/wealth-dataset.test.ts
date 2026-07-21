import { describe, expect, it } from 'vitest';
import { getWealthDataset } from '../wealth-data';
import { REPORT_YEARS, shareBucketSum, tierForYear } from '../wealth-data/schema';
import { datasetToCsv } from '../wealth-data/export-utils';

const SHARE_KEYS = [
  'shareTop01Pct',
  'share99to999Pct',
  'share90to99Pct',
  'share50to90Pct',
  'shareBottom50Pct',
] as const;

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

  it('declares a verification date and a source directory', () => {
    expect(dataset.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dataset.sources.length).toBeGreaterThanOrEqual(5);
    for (const source of dataset.sources) {
      expect(source.id).toBeTruthy();
      expect(source.name).toBeTruthy();
      expect(source.url).toMatch(/^https?:\/\//);
      expect(source.coverage).toBeTruthy();
      expect(source.description).toBeTruthy();
      if (source.dataFileUrl) {
        expect(source.dataFileUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  it('requires sources with valid URLs on every populated cell', () => {
    for (const row of dataset.rows) {
      for (const key of [
        'totalHouseholdWealth',
        'householdCount',
        'totalPopulation',
        ...SHARE_KEYS,
        'zeroOrNegativeWealth',
      ] as const) {
        const cell = row[key];
        if (cell.value !== null) {
          expect(cell.source, `${row.reportYear} ${key}`).not.toBeNull();
          expect(cell.source?.url).toMatch(/^https?:\/\//);
          if (cell.source?.dataFileUrl) {
            expect(cell.source.dataFileUrl).toMatch(/^https?:\/\//);
          }
        } else {
          expect(cell.confidence, `${row.reportYear} ${key}`).toBe('na');
          expect(cell.methodologyNote, `${row.reportYear} ${key}`).toBeTruthy();
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

  it('marks unavailable bottom-half shares as N/A before 1965', () => {
    for (const row of dataset.rows.filter((r) => r.reportYear < 1965)) {
      expect(row.share50to90Pct.value, `${row.reportYear}`).toBeNull();
      expect(row.shareBottom50Pct.value, `${row.reportYear}`).toBeNull();
    }
    for (const row of dataset.rows.filter((r) => r.reportYear >= 1965)) {
      expect(row.share50to90Pct.value, `${row.reportYear}`).not.toBeNull();
      expect(row.shareBottom50Pct.value, `${row.reportYear}`).not.toBeNull();
    }
  });

  it('marks pre-1960 zero-wealth as N/A', () => {
    for (const row of dataset.rows.filter((r) => r.reportYear < 1960)) {
      expect(row.zeroOrNegativeWealth.value).toBeNull();
      expect(row.zeroOrNegativeWealth.confidence).toBe('na');
    }
  });

  it('flags nearest-year Wolff mappings as interpolated with the survey year', () => {
    for (const row of dataset.rows.filter((r) => r.reportYear >= 1960)) {
      const cell = row.zeroOrNegativeWealth;
      expect(cell.value, `${row.reportYear}`).not.toBeNull();
      expect(cell.observationYear, `${row.reportYear}`).toBeTruthy();
      if (cell.observationYear !== row.reportYear) {
        expect(cell.isInterpolated, `${row.reportYear}`).toBe(true);
      }
    }
  });

  it('uses consistent units', () => {
    for (const row of dataset.rows) {
      expect(row.totalHouseholdWealth.unit).toBe('usd_millions');
      expect(row.householdCount.unit).toBe('count');
      expect(row.totalPopulation.unit).toBe('count');
      for (const key of SHARE_KEYS) {
        expect(row[key].unit).toBe('percent');
      }
      expect(row.zeroOrNegativeWealth.unit).toBe('percent');
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
