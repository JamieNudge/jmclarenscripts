import type {
  StatStrikeGoalBandCascade,
  StatStrikeGoalBandCascadeBandOdds,
  StatStrikeGoalBandCascadeDisplayRow,
} from '@/lib/statstrike/models';

function asRecord(v: unknown): Record<string, unknown> | null {
  return v != null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function asNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asString(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) return v.trim();
  return null;
}

/** Normalize band keys for odds lookup (O2.5, OVER 2.5, Over 2.5 Goals → O2.5). */
export function normalizedBandKey(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/OVER/g, 'O')
    .replace(/UNDER/g, 'U')
    .replace(/GOALS/g, '');
}

export function displayLabelForBand(raw: string): string {
  switch (normalizedBandKey(raw)) {
    case 'O2.5':
      return 'Over 2.5';
    case 'O3.5':
      return 'Over 3.5';
    case 'O4.5':
      return 'Over 4.5';
    case 'O5.5':
    case 'O5.5+':
      return 'Over 5.5+';
    case 'U2.5':
      return 'Under 2.5';
    default:
      return raw.trim() || raw;
  }
}

/** Rows for expand UI: recommended bands with optional matching decimal odds (iOS displayBandRows). */
export function displayBandRows(cascade: StatStrikeGoalBandCascade): StatStrikeGoalBandCascadeDisplayRow[] {
  const oddsByBand = new Map<string, StatStrikeGoalBandCascadeBandOdds>();
  for (const odds of cascade.bandOdds ?? []) {
    oddsByBand.set(normalizedBandKey(odds.band), odds);
  }
  return cascade.recommendedBands.map((band) => {
    const key = normalizedBandKey(band);
    return {
      bandKey: band,
      label: displayLabelForBand(band),
      decimalOdds: oddsByBand.get(key)?.decimalOdds ?? null,
    };
  });
}

function parseBandOdds(raw: unknown): StatStrikeGoalBandCascadeBandOdds | null {
  const o = asRecord(raw);
  if (!o) return null;
  const band = asString(o.band);
  if (!band) return null;
  return {
    band,
    decimalOdds: asNumber(o.decimalOdds),
    impliedProbability: asNumber(o.impliedProbability),
  };
}

/**
 * Parse optional goalBandCascade from a selections prediction payload.
 * Empty recommendedBands → absent (null).
 */
export function parseGoalBandCascade(raw: unknown): StatStrikeGoalBandCascade | null {
  const o = asRecord(raw);
  if (!o) return null;

  const recommendedBands = Array.isArray(o.recommendedBands)
    ? o.recommendedBands.filter((b): b is string => typeof b === 'string' && b.trim() !== '').map((b) => b.trim())
    : [];
  if (!recommendedBands.length) return null;

  const bandOddsRaw = o.bandOdds;
  const bandOdds = Array.isArray(bandOddsRaw)
    ? bandOddsRaw.map(parseBandOdds).filter((x): x is StatStrikeGoalBandCascadeBandOdds => x != null)
    : undefined;

  const qualifiers = Array.isArray(o.qualifiers)
    ? o.qualifiers.filter((q): q is string => typeof q === 'string')
    : undefined;

  return {
    source: asString(o.source) ?? '',
    recommendedBands,
    forecasterConfidence: asNumber(o.forecasterConfidence) ?? 0,
    bandOdds: bandOdds?.length ? bandOdds : undefined,
    qualifiers: qualifiers?.length ? qualifiers : undefined,
  };
}
