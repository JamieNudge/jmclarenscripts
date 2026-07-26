import type { StatStrikeTrackRecord } from '@/lib/statstrike/track-record';

const DB_NAME = 'statstrike-web';
const DB_VERSION = 1;
const STORE = 'personalPicks';

/** Composite key: selectionDateKey + fixtureId */
export function personalPickKey(selectionDateKey: string, fixtureId: number): string {
  return `${selectionDateKey}:${fixtureId}`;
}

export type PersonalPickRecord = StatStrikeTrackRecord & {
  id: string;
  savedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('fixtureId', 'fixtureId', { unique: false });
        store.createIndex('selectionDateKey', 'selectionDateKey', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

export async function listPersonalPicks(): Promise<PersonalPickRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as PersonalPickRecord[]) ?? [];
      rows.sort((a, b) => b.kickoffMs - a.kickoffMs);
      resolve(rows);
    };
    req.onerror = () => reject(req.error ?? new Error('listPersonalPicks failed'));
  });
}

export async function getPersonalPick(
  selectionDateKey: string,
  fixtureId: number,
): Promise<PersonalPickRecord | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(personalPickKey(selectionDateKey, fixtureId));
    req.onsuccess = () => resolve((req.result as PersonalPickRecord) ?? null);
    req.onerror = () => reject(req.error ?? new Error('getPersonalPick failed'));
  });
}

export async function upsertPersonalPick(
  record: Omit<PersonalPickRecord, 'id' | 'savedAt'> & { savedAt?: string },
): Promise<PersonalPickRecord> {
  const row: PersonalPickRecord = {
    ...record,
    id: personalPickKey(record.selectionDateKey, record.fixtureId),
    savedAt: record.savedAt ?? new Date().toISOString(),
  };
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(row);
  await txDone(tx);
  return row;
}

export async function removePersonalPick(selectionDateKey: string, fixtureId: number): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).delete(personalPickKey(selectionDateKey, fixtureId));
  await txDone(tx);
}

export async function clearPersonalPicks(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).clear();
  await txDone(tx);
}

export async function exportPersonalPicksJson(): Promise<string> {
  const rows = await listPersonalPicks();
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), picks: rows }, null, 2);
}

export async function importPersonalPicksJson(raw: string): Promise<number> {
  const parsed = JSON.parse(raw) as { picks?: unknown };
  if (!Array.isArray(parsed.picks)) throw new Error('Invalid personal picks export');
  let count = 0;
  for (const item of parsed.picks) {
    if (item == null || typeof item !== 'object') continue;
    const r = item as Partial<PersonalPickRecord>;
    if (typeof r.fixtureId !== 'number' || typeof r.selectionDateKey !== 'string') continue;
    if (typeof r.homeTeam !== 'string' || typeof r.awayTeam !== 'string') continue;
    await upsertPersonalPick({
      fixtureId: r.fixtureId,
      homeTeam: r.homeTeam,
      awayTeam: r.awayTeam,
      league: typeof r.league === 'string' ? r.league : 'League',
      country: typeof r.country === 'string' ? r.country : '',
      kickoffMs: typeof r.kickoffMs === 'number' ? r.kickoffMs : 0,
      tipBand: (r.tipBand as PersonalPickRecord['tipBand']) || 'Over 2.5 Goals',
      homeScore: r.homeScore ?? null,
      awayScore: r.awayScore ?? null,
      isCorrect: r.isCorrect ?? null,
      bestPerformingLeague: Boolean(r.bestPerformingLeague),
      hasGoalBandCascade: Boolean(r.hasGoalBandCascade),
      decimalOdds: r.decimalOdds ?? null,
      selectionDateKey: r.selectionDateKey,
      savedAt: typeof r.savedAt === 'string' ? r.savedAt : undefined,
    });
    count += 1;
  }
  return count;
}

/** Debug unlock: `NEXT_PUBLIC_STATSTRIKE_PERSONAL_ENABLED=1` (default off). */
export function isStatStrikePersonalEnvEnabled(): boolean {
  return process.env.NEXT_PUBLIC_STATSTRIKE_PERSONAL_ENABLED === '1';
}

/** @deprecated Prefer isStatStrikePersonalEnvEnabled + pass session. */
export function isStatStrikePersonalEnabled(): boolean {
  return isStatStrikePersonalEnvEnabled();
}
