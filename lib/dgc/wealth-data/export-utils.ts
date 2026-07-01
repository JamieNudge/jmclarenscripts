import type { StatCell, WealthSnapshotRow } from './schema';
import { formatStatValue } from './schema';

const COLUMN_KEYS = [
  'totalHouseholdWealth',
  'householdCount',
  'totalPopulation',
  'shareTop01Pct',
  'share99to999Pct',
  'share90to99Pct',
  'share50to90Pct',
  'shareBottom50Pct',
  'zeroOrNegativeWealth',
] as const;

export { COLUMN_KEYS };

export const COLUMN_LABELS: Record<(typeof COLUMN_KEYS)[number], string> = {
  totalHouseholdWealth: 'Total household wealth',
  householdCount: 'Households',
  totalPopulation: 'Population',
  shareTop01Pct: 'Top 0.1% share',
  share99to999Pct: '99–99.9% share',
  share90to99Pct: '90–99% share',
  share50to90Pct: '50–90% share',
  shareBottom50Pct: 'Bottom 50% share',
  zeroOrNegativeWealth: 'Zero/negative wealth',
};

export function datasetToCsv(rows: WealthSnapshotRow[]): string {
  const headers = ['Year', 'Tier', ...COLUMN_KEYS.map((k) => COLUMN_LABELS[k])];
  const lines = [headers.map(escapeCsv).join(',')];
  for (const row of rows) {
    const values = [
      String(row.reportYear),
      String(row.tier),
      ...COLUMN_KEYS.map((k) => formatStatValue(row[k])),
    ];
    lines.push(values.map(escapeCsv).join(','));
  }
  return lines.join('\n');
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function confidenceBadgeClass(confidence: StatCell['confidence']): string {
  switch (confidence) {
    case 'high':
      return 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/30';
    case 'medium':
      return 'bg-amber-500/20 text-amber-100 ring-amber-400/30';
    case 'low':
      return 'bg-orange-500/20 text-orange-100 ring-orange-400/30';
    default:
      return 'bg-white/10 text-white/50 ring-white/15';
  }
}
