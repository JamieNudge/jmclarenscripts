import type { StatStrikePrediction, StatStrikePredictionLevel } from '@/lib/statstrike/models';

export const BTTS_YES: StatStrikePredictionLevel = 'BTTS Yes';
export const BTTS_NO: StatStrikePredictionLevel = 'BTTS No';

export type BTTSSelectionPick = {
  fixtureId: number;
  level: typeof BTTS_YES | typeof BTTS_NO;
  confidence: number;
};

export type BTTSSelectionsPayload = {
  schemaVersion: string | null;
  date: string | null;
  source: string | null;
  picksByFixtureId: Map<number, BTTSSelectionPick>;
};

function isBTTSLevel(level: unknown): level is typeof BTTS_YES | typeof BTTS_NO {
  return level === BTTS_YES || level === BTTS_NO;
}

/**
 * Parse RTDB `/bttsSelections/{date}` payload.
 * One pick per fixtureId (last wins if duplicates).
 */
export function parseBTTSSelectionsPayload(raw: unknown): BTTSSelectionsPayload | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const picksRaw = o.picks;
  if (!Array.isArray(picksRaw)) {
    return {
      schemaVersion: typeof o.schemaVersion === 'string' ? o.schemaVersion : null,
      date: typeof o.date === 'string' ? o.date : null,
      source: typeof o.source === 'string' ? o.source : null,
      picksByFixtureId: new Map(),
    };
  }

  const picksByFixtureId = new Map<number, BTTSSelectionPick>();
  for (const item of picksRaw) {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) continue;
    const p = item as Record<string, unknown>;
    const fixtureId =
      typeof p.fixtureId === 'number'
        ? p.fixtureId
        : typeof p.fixtureId === 'string'
          ? Number(p.fixtureId)
          : NaN;
    if (!Number.isFinite(fixtureId)) continue;
    if (!isBTTSLevel(p.level)) continue;
    const confidence =
      typeof p.confidence === 'number' && Number.isFinite(p.confidence)
        ? Math.min(1, Math.max(0, p.confidence))
        : 0;
    picksByFixtureId.set(fixtureId, {
      fixtureId,
      level: p.level,
      confidence,
    });
  }

  return {
    schemaVersion: typeof o.schemaVersion === 'string' ? o.schemaVersion : null,
    date: typeof o.date === 'string' ? o.date : null,
    source: typeof o.source === 'string' ? o.source : null,
    picksByFixtureId,
  };
}

/** Mirror iOS: confidence 0–1 → matchedCriteria on an 11-point scale. */
export function predictionFromBTTSPick(pick: BTTSSelectionPick): StatStrikePrediction {
  const criteria = Math.max(1, Math.min(11, Math.round(pick.confidence * 11)));
  return {
    level: pick.level,
    recommendedLevel: pick.level,
    matchedCriteria: criteria,
    totalCriteria: 11,
    significantStats: ['BTTS'],
    sourceLabel: 'BTTS selections',
  };
}

export function isBTTSPredictionLevel(
  level: StatStrikePredictionLevel | null | undefined,
): boolean {
  return level === BTTS_YES || level === BTTS_NO;
}
