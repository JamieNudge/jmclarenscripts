import {
  msUntilNextPicksCalendarDateKeyChange,
  picksDateStringInTimeZone,
  picksTimeZoneFromEnv,
} from '@/lib/best-picks-firebase';

export const STATSTRIKE_UK_TZ = 'Europe/London';

export function statStrikeTimeZone(): string {
  return picksTimeZoneFromEnv() || STATSTRIKE_UK_TZ;
}

/** UK business day key for `/selections/{yyyy-MM-dd}` (matches iOS SelectionBucketKey). */
export function ukSelectionDateKey(when: Date = new Date()): string {
  return picksDateStringInTimeZone(statStrikeTimeZone(), when);
}

/** Previous UK calendar day key (yesterday carry-over for live fixtures). */
export function ukSelectionDateKeyOffset(days: number, when: Date = new Date()): string {
  const tz = statStrikeTimeZone();
  const today = picksDateStringInTimeZone(tz, when);
  // Walk by UTC noon anchors so DST edges stay on the intended calendar day.
  const [y, m, d] = today.split('-').map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  anchor.setUTCDate(anchor.getUTCDate() + days);
  return picksDateStringInTimeZone(tz, anchor);
}

export function ukYesterdaySelectionDateKey(when: Date = new Date()): string {
  return ukSelectionDateKeyOffset(-1, when);
}

export function msUntilNextUkSelectionDay(from: Date = new Date()): number {
  return msUntilNextPicksCalendarDateKeyChange(statStrikeTimeZone(), from);
}

export function selectionsPathForDateKey(dateKey: string): string {
  const root = process.env.NEXT_PUBLIC_FIREBASE_SELECTIONS_ROOT?.trim() || 'selections';
  return `${root}/${dateKey}`;
}
