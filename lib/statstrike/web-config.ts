/**
 * GoalLab / StatStrike runtime config in RTDB (public read via Admin API, admin write).
 * Same pattern as hubVideo — flip Coming Soon blurs / pass sales without redeploy.
 *
 * Path: `statstrikeWebConfig`
 * ```json
 * {
 *   "blur": true,
 *   "forecastsBlur": true,
 *   "supporterPassSalesEnabled": false,
 *   "updatedAt": "…"
 * }
 * ```
 */

export const STATSTRIKE_WEB_CONFIG_ROOT = 'statstrikeWebConfig';

export function statStrikeWebConfigRtdbPath(): string {
  return (
    process.env.NEXT_PUBLIC_STATSTRIKE_WEB_CONFIG_ROOT?.trim() ||
    process.env.STATSTRIKE_WEB_CONFIG_ROOT?.trim() ||
    STATSTRIKE_WEB_CONFIG_ROOT
  );
}

export type StatStrikeWebConfig = {
  /** When true, Coming Soon blur on StatStrike hero + /statstrike. */
  blur: boolean;
  /** When true, blur overflow fixtures on GoalLab /fixtures (Forecasts). */
  forecastsBlur: boolean;
  /** When true, Stripe 24h Supporter Pass checkout is offered. Missing → false. */
  supporterPassSalesEnabled: boolean;
  /** When true, show High firepower research chip/badge. Missing → false. */
  researchTagsUiEnabled: boolean;
  updatedAt: string | null;
};

/** Missing RTDB node → blurs ON, pass sales OFF (safe defaults). */
export const DEFAULT_STATSTRIKE_WEB_CONFIG: StatStrikeWebConfig = {
  blur: true,
  forecastsBlur: true,
  supporterPassSalesEnabled: false,
  researchTagsUiEnabled: false,
  updatedAt: null,
};

function parseBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    if (s === 'false' || s === '0') return false;
    if (s === 'true' || s === '1') return true;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
}

export function parseStatStrikeWebConfig(raw: unknown): StatStrikeWebConfig {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_STATSTRIKE_WEB_CONFIG };
  }
  const o = raw as Record<string, unknown>;
  const updatedAt =
    typeof o.updatedAt === 'string' && o.updatedAt.trim() ? o.updatedAt.trim() : null;
  return {
    blur: parseBool(o.blur, DEFAULT_STATSTRIKE_WEB_CONFIG.blur),
    forecastsBlur: parseBool(o.forecastsBlur, DEFAULT_STATSTRIKE_WEB_CONFIG.forecastsBlur),
    supporterPassSalesEnabled: parseBool(
      o.supporterPassSalesEnabled,
      DEFAULT_STATSTRIKE_WEB_CONFIG.supporterPassSalesEnabled,
    ),
    researchTagsUiEnabled: parseBool(
      o.researchTagsUiEnabled,
      DEFAULT_STATSTRIKE_WEB_CONFIG.researchTagsUiEnabled,
    ),
    updatedAt,
  };
}

type WebConfigBoolKey =
  | 'blur'
  | 'forecastsBlur'
  | 'supporterPassSalesEnabled'
  | 'researchTagsUiEnabled';

/**
 * Partial update: send any of blur / forecastsBlur / supporterPassSalesEnabled / researchTagsUiEnabled.
 * Caller merges onto existing RTDB record before write.
 */
export function normalizeStatStrikeWebConfigPatch(
  body: Record<string, unknown>,
):
  | { ok: true; patch: Partial<Pick<StatStrikeWebConfig, WebConfigBoolKey>> }
  | { ok: false; error: string } {
  const patch: Partial<Pick<StatStrikeWebConfig, WebConfigBoolKey>> = {};

  if (Object.prototype.hasOwnProperty.call(body, 'blur')) {
    if (typeof body.blur !== 'boolean') {
      return { ok: false, error: 'blur must be a boolean.' };
    }
    patch.blur = body.blur;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'forecastsBlur')) {
    if (typeof body.forecastsBlur !== 'boolean') {
      return { ok: false, error: 'forecastsBlur must be a boolean.' };
    }
    patch.forecastsBlur = body.forecastsBlur;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'supporterPassSalesEnabled')) {
    if (typeof body.supporterPassSalesEnabled !== 'boolean') {
      return { ok: false, error: 'supporterPassSalesEnabled must be a boolean.' };
    }
    patch.supporterPassSalesEnabled = body.supporterPassSalesEnabled;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'researchTagsUiEnabled')) {
    if (typeof body.researchTagsUiEnabled !== 'boolean') {
      return { ok: false, error: 'researchTagsUiEnabled must be a boolean.' };
    }
    patch.researchTagsUiEnabled = body.researchTagsUiEnabled;
  }

  if (
    patch.blur === undefined &&
    patch.forecastsBlur === undefined &&
    patch.supporterPassSalesEnabled === undefined &&
    patch.researchTagsUiEnabled === undefined
  ) {
    return {
      ok: false,
      error:
        'Provide blur, forecastsBlur, supporterPassSalesEnabled, and/or researchTagsUiEnabled (boolean).',
    };
  }

  return { ok: true, patch };
}
