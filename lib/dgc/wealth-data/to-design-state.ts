import type { WealthSnapshotRow } from './schema';
import { formatStatValue } from './schema';
import type { CanvasSettings, DesignLayer } from '../types';
import { DEFAULT_TOTAL_POPULATION_COLOR_HEX } from '../types';
import { newLayerId } from '../document';

/**
 * Canonical mapping from a dataset year to a Field of Wealth diagram.
 *
 * Both axes are normalized to 0-100. The bottom (population) axis carries the
 * cumulative wealth-percentile boundaries 50 / 90 / 99 / 99.9, and each layer's
 * area target is the cumulative share of total wealth held below that
 * boundary. Raw dollar/count values have incompatible units and are surfaced
 * as metadata instead of distorting the geometry.
 */

export const WEALTH_LAYER_BLUEPRINT = [
  { boundary: 50, name: 'Bottom 50%', colorHex: '#2F7CE5' },
  { boundary: 90, name: 'Bottom 90%', colorHex: '#28A88C' },
  { boundary: 99, name: 'Bottom 99%', colorHex: '#E5A02F' },
  { boundary: 99.9, name: 'Bottom 99.9%', colorHex: '#D9534F' },
] as const;

const MIN_FRACTION = 0.0001;
const MAX_FRACTION = 0.9999;

export interface WealthYearEligibility {
  eligible: boolean;
  reason?: string;
}

export function wealthYearEligibility(row: WealthSnapshotRow): WealthYearEligibility {
  const missing: string[] = [];
  if (row.shareBottom50Pct.value === null) missing.push('bottom 50% share');
  if (row.share50to90Pct.value === null) missing.push('50-90% share');
  if (row.share90to99Pct.value === null) missing.push('90-99% share');
  if (row.share99to999Pct.value === null) missing.push('99-99.9% share');
  if (row.shareTop01Pct.value === null) missing.push('top 0.1% share');
  if (missing.length > 0) {
    return {
      eligible: false,
      reason: `No verified ${missing.join(', ')} for ${row.reportYear}; this year cannot be drawn without inventing data.`,
    };
  }
  return { eligible: true };
}

export interface WealthYearDesign {
  year: number;
  canvas: CanvasSettings;
  layers: DesignLayer[];
  provenance: string;
  metadata: {
    tier: number;
    totalWealthLabel: string;
    householdsLabel: string;
    populationLabel: string;
    zeroOrNegativeLabel: string;
    sourceNames: string[];
  };
}

function makeCanvas(row: WealthSnapshotRow): CanvasSettings {
  return {
    fieldWidth: 100,
    fieldHeight: 60,
    leftMargin: 0,
    rightMargin: 8,
    topMargin: 8,
    bottomMargin: 4,
    totalPopulationWidth: 100,
    totalPopulationHeight: 4,
    fieldOfWealthWidthPercent: 100,
    totalPopulationLabel: `US Population ${row.reportYear} — ${formatStatValue(row.totalPopulation)}`,
    totalPopulationColorHex: DEFAULT_TOTAL_POPULATION_COLOR_HEX,
  };
}

export function wealthRowToDesign(
  row: WealthSnapshotRow,
  datasetVersion: string,
): WealthYearDesign {
  const eligibility = wealthYearEligibility(row);
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason);
  }

  const bottom50 = row.shareBottom50Pct.value as number;
  const next40 = row.share50to90Pct.value as number;
  const next9 = row.share90to99Pct.value as number;
  const next09 = row.share99to999Pct.value as number;

  const cumulativeShares = [
    bottom50,
    bottom50 + next40,
    bottom50 + next40 + next9,
    bottom50 + next40 + next9 + next09,
  ];

  const layers: DesignLayer[] = WEALTH_LAYER_BLUEPRINT.map((blueprint, index) => ({
    id: newLayerId(),
    name: `${blueprint.name} — ${cumulativeShares[index].toFixed(1)}% of wealth`,
    isVisible: true,
    isLocked: false,
    startX: blueprint.boundary,
    areaFraction: Math.min(
      Math.max(cumulativeShares[index] / 100, MIN_FRACTION),
      MAX_FRACTION,
    ),
    colorHex: blueprint.colorHex,
  }));

  const sourceNames = Array.from(
    new Set(
      [
        row.shareBottom50Pct.source?.name,
        row.share50to90Pct.source?.name,
        row.totalHouseholdWealth.source?.name,
        row.totalPopulation.source?.name,
      ].filter((name): name is string => !!name),
    ),
  );

  return {
    year: row.reportYear,
    canvas: makeCanvas(row),
    layers,
    provenance: `Dataset ${datasetVersion}, tier ${row.tier}: ${sourceNames.join('; ')}`,
    metadata: {
      tier: row.tier,
      totalWealthLabel: formatStatValue(row.totalHouseholdWealth),
      householdsLabel: formatStatValue(row.householdCount),
      populationLabel: formatStatValue(row.totalPopulation),
      zeroOrNegativeLabel: formatStatValue(row.zeroOrNegativeWealth),
      sourceNames,
    },
  };
}
