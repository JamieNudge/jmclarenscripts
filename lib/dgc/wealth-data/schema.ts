export type Confidence = 'high' | 'medium' | 'low' | 'na';

export interface SourceCitation {
  name: string;
  url: string;
  tableOrSeries?: string;
  accessedAt: string;
}

export interface StatCell {
  value: number | null;
  unit: string;
  observationYear?: number;
  isInterpolated?: boolean;
  confidence: Confidence;
  definition?: string;
  methodologyNote?: string;
  source: SourceCitation | null;
}

export interface WealthSnapshotRow {
  reportYear: number;
  tier: 1 | 2 | 3;
  totalHouseholdWealth: StatCell;
  householdCount: StatCell;
  totalPopulation: StatCell;
  shareTop01Pct: StatCell;
  share99to999Pct: StatCell;
  share90to99Pct: StatCell;
  share50to90Pct: StatCell;
  shareBottom50Pct: StatCell;
  zeroOrNegativeWealth: StatCell;
}

export interface WealthDataset {
  version: string;
  methodology: string;
  definitions: {
    householdWealth: string;
    household: string;
  };
  rows: WealthSnapshotRow[];
}

export const REPORT_YEARS = Array.from({ length: 22 }, (_, i) => 1920 + i * 5);

export function tierForYear(year: number): 1 | 2 | 3 {
  if (year >= 1990) return 1;
  if (year >= 1960) return 2;
  return 3;
}

export function shareBucketSum(row: WealthSnapshotRow): number | null {
  const shares = [
    row.shareTop01Pct.value,
    row.share99to999Pct.value,
    row.share90to99Pct.value,
    row.share50to90Pct.value,
    row.shareBottom50Pct.value,
  ];
  if (shares.some((v) => v === null)) return null;
  return shares.reduce<number>((sum, v) => sum + (v as number), 0);
}

export function formatStatValue(cell: StatCell): string {
  if (cell.value === null) return 'N/A';
  if (cell.unit === 'percent') return `${cell.value.toFixed(1)}%`;
  if (cell.unit === 'usd_millions') {
    const trillions = cell.value / 1_000_000;
    if (trillions >= 1) return `$${trillions.toFixed(2)}T`;
    const billions = cell.value / 1_000;
    return `$${billions.toFixed(1)}B`;
  }
  if (cell.unit === 'count') {
    if (cell.value >= 1_000_000) return `${(cell.value / 1_000_000).toFixed(2)}M`;
    if (cell.value >= 1_000) return `${(cell.value / 1_000).toFixed(1)}K`;
    return cell.value.toLocaleString('en-US');
  }
  return String(cell.value);
}
