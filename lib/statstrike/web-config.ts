/**
 * StatStrike Web runtime config in RTDB (public read, admin write).
 * Same pattern as hubVideo — flip Coming Soon blur without redeploy.
 *
 * Suggested Firebase rules:
 * ```json
 * "statstrikeWebConfig": {
 *   ".read": true,
 *   ".write": false
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
  /** When true, Coming Soon blur + App Store CTA on hero + /statstrike. */
  blur: boolean;
  updatedAt: string | null;
};

/** Missing RTDB node → blur on (safe teaser default for production). */
export const DEFAULT_STATSTRIKE_WEB_CONFIG: StatStrikeWebConfig = {
  blur: true,
  updatedAt: null,
};

export function parseStatStrikeWebConfig(raw: unknown): StatStrikeWebConfig {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_STATSTRIKE_WEB_CONFIG };
  }
  const o = raw as Record<string, unknown>;
  let blur = true;
  if (typeof o.blur === 'boolean') {
    blur = o.blur;
  } else if (typeof o.blur === 'string') {
    const s = o.blur.trim().toLowerCase();
    if (s === 'false' || s === '0') blur = false;
    else if (s === 'true' || s === '1') blur = true;
  } else if (typeof o.blur === 'number') {
    blur = o.blur !== 0;
  }
  const updatedAt =
    typeof o.updatedAt === 'string' && o.updatedAt.trim() ? o.updatedAt.trim() : null;
  return { blur, updatedAt };
}

export function normalizeStatStrikeWebConfigInput(
  body: Record<string, unknown>,
): { ok: true; record: StatStrikeWebConfig } | { ok: false; error: string } {
  if (!Object.prototype.hasOwnProperty.call(body, 'blur')) {
    return { ok: false, error: 'blur is required (boolean).' };
  }
  if (typeof body.blur !== 'boolean') {
    return { ok: false, error: 'blur must be a boolean.' };
  }
  return {
    ok: true,
    record: {
      blur: body.blur,
      updatedAt: new Date().toISOString(),
    },
  };
}
