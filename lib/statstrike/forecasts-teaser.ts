import type { FixtureListItem } from '@/lib/fixtures-browser';
import { isLiveStatus } from '@/lib/statstrike/parse-selection';

export const FORECASTS_FREE_PREVIEW_LIMIT = 6;

function fixtureStatus(fixture: FixtureListItem): string | null {
  const raw = fixture.pick.status ?? fixture.pick.displayStatus ?? fixture.pick.fixtureStatus;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

function byKickoffAsc(a: FixtureListItem, b: FixtureListItem): number {
  const ta = a.kickoffMs;
  const tb = b.kickoffMs;
  if (ta == null && tb == null) return String(a.fixtureId).localeCompare(String(b.fixtureId));
  if (ta == null) return 1;
  if (tb == null) return -1;
  if (ta !== tb) return ta - tb;
  return String(a.fixtureId).localeCompare(String(b.fixtureId));
}

/**
 * IDs of the fixtures that stay fully public on the Forecasts teaser:
 * live fixtures first (earliest kickoff), then earliest kickoff overall,
 * up to `limit`. Everything else is gated behind the 24h pass.
 */
export function freeForecastFixtureIds(
  fixtures: FixtureListItem[],
  limit: number = FORECASTS_FREE_PREVIEW_LIMIT,
): Set<string> {
  const out = new Set<string>();
  if (limit <= 0 || fixtures.length === 0) return out;

  const live = fixtures.filter((f) => isLiveStatus(fixtureStatus(f))).sort(byKickoffAsc);
  const rest = fixtures.filter((f) => !isLiveStatus(fixtureStatus(f))).sort(byKickoffAsc);

  for (const fixture of [...live, ...rest]) {
    if (out.size >= limit) break;
    out.add(String(fixture.fixtureId));
  }
  return out;
}
