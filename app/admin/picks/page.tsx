'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { PickRecord } from '@/lib/best-picks-firebase';
import {
  mergeManualPickLists,
  picksDateStringInTimeZone,
  picksTimeZoneFromEnv,
  rtdbValueToPickList,
} from '@/lib/best-picks-firebase';
import { AdminPredictionEmailBlocklist } from '@/components/admin/AdminPredictionEmailBlocklist';
import { AdminPredictionSubmissions } from '@/components/admin/AdminPredictionSubmissions';
import { parseYoutubeIdFromInput } from '@/lib/youtube-embed';
import { normalizePicksCalendarDateInput } from '@/lib/picks-date-input';

const STORAGE_KEY = 'bestpicks_admin_bearer';

type Band = 'over' | 'under';

function emptyPick(): PickRecord {
  return {
    homeTeam: '',
    awayTeam: '',
    league: '',
    country: '',
    kickoff: '',
  };
}

function pickLabel(p: PickRecord, i: number) {
  const h = typeof p.homeTeam === 'string' ? p.homeTeam : '';
  const a = typeof p.awayTeam === 'string' ? p.awayTeam : '';
  if (h && a) return `${h} vs ${a}`;
  return `Pick ${i + 1}`;
}

function draftFromPick(p: PickRecord): PickRecord {
  return {
    homeTeam: String(p.homeTeam ?? p.home ?? ''),
    awayTeam: String(p.awayTeam ?? p.away ?? ''),
    league: String(p.league ?? ''),
    country: String(p.country ?? ''),
    kickoff: String(p.kickoff ?? p.time ?? p.date ?? ''),
  };
}

function buildRowFromDraft(draft: PickRecord, base?: PickRecord): PickRecord {
  const home = String(draft.homeTeam ?? '').trim();
  const away = String(draft.awayTeam ?? '').trim();
  const row: PickRecord = {
    ...(base ?? {}),
    homeTeam: home,
    awayTeam: away,
    league: String(draft.league ?? '').trim(),
    country: String(draft.country ?? '').trim(),
  };
  const ko = String(draft.kickoff ?? '').trim();
  if (ko) row.kickoff = ko;
  else delete row.kickoff;
  return row;
}

export default function AdminPicksPage() {
  const today = useMemo(() => picksDateStringInTimeZone(picksTimeZoneFromEnv()), []);
  const [date, setDate] = useState(today);
  const [adminKey, setAdminKey] = useState('');
  const [rememberKey, setRememberKey] = useState(false);
  const [overPicks, setOverPicks] = useState<PickRecord[]>([]);
  const [underPicks, setUnderPicks] = useState<PickRecord[]>([]);
  const [youtubeRaw, setYoutubeRaw] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [band, setBand] = useState<Band>('over');
  const [draft, setDraft] = useState<PickRecord>(emptyPick);
  /** When set, Add/Update applies to this row (same or new band after you change the dropdown). */
  const [editing, setEditing] = useState<{ band: Band; index: number } | null>(null);
  /** After Load for `date`, Save replaces lists; otherwise Save merges local rows onto Firebase (avoids wiping the other band). */
  const [lastLoadedDateKey, setLastLoadedDateKey] = useState<string | null>(null);
  const prevDateNormRef = useRef<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [predictionBlocklistRefreshSignal, setPredictionBlocklistRefreshSignal] = useState(0);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) {
        setAdminKey(s);
        setRememberKey(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!rememberKey) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      if (adminKey) localStorage.setItem(STORAGE_KEY, adminKey);
    } catch {
      /* ignore */
    }
  }, [rememberKey, adminKey]);

  useEffect(() => {
    const n = normalizePicksCalendarDateInput(date);
    if (!n) return;
    if (prevDateNormRef.current !== null && prevDateNormRef.current !== n) {
      setLastLoadedDateKey(null);
    }
    prevDateNormRef.current = n;
  }, [date]);

  const authHeaders = (): HeadersInit => ({
    Authorization: `Bearer ${adminKey.trim()}`,
    'Content-Type': 'application/json',
  });

  const load = useCallback(async () => {
    setStatus(null);
    if (!adminKey.trim()) {
      setStatus('Paste your admin key first.');
      return;
    }
    const dateNorm = normalizePicksCalendarDateInput(date);
    if (!dateNorm) {
      setStatus(
        'Could not read that date. Try 2026-03-23 or 23/03/2026 (UK day/month/year).',
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/manual-picks?date=${encodeURIComponent(dateNorm)}`, {
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
      });
      const json = (await res.json()) as { data?: unknown; error?: string };
      if (!res.ok) {
        setStatus(json.error || res.statusText);
        return;
      }
      const used = (json as { dateUsed?: string }).dateUsed;
      if (used) setDate(used);
      const d = json.data;
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        const o = d as Record<string, unknown>;
        setOverPicks(rtdbValueToPickList(o.overForecasts));
        setUnderPicks(rtdbValueToPickList(o.underForecasts));
        setYoutubeRaw(typeof o.youtubeId === 'string' ? o.youtubeId : '');
        setVideoTitle(typeof o.videoTitle === 'string' ? o.videoTitle : '');
      } else {
        setOverPicks([]);
        setUnderPicks([]);
        setYoutubeRaw('');
        setVideoTitle('');
      }
      setLastLoadedDateKey(used ?? dateNorm);
      setEditing(null);
      setDraft(emptyPick());
      setStatus('Loaded from Firebase.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [adminKey, date]);

  const cancelEdit = () => {
    setEditing(null);
    setDraft(emptyPick());
    setStatus(null);
  };

  const startEdit = (b: Band, index: number) => {
    const list = b === 'over' ? overPicks : underPicks;
    const p = list[index];
    if (!p) return;
    setBand(b);
    setDraft(draftFromPick(p));
    setEditing({ band: b, index });
    setStatus('Editing a pick — change fields, then click Update pick. Or Cancel.');
  };

  const removePick = (b: Band, index: number) => {
    if (b === 'over') setOverPicks((x) => x.filter((_, j) => j !== index));
    else setUnderPicks((x) => x.filter((_, j) => j !== index));
    if (editing?.band === b && editing.index === index) cancelEdit();
    else if (editing?.band === b && editing.index > index) {
      setEditing({ band: editing.band, index: editing.index - 1 });
    }
    setStatus('Removed from the list. Save to Firebase to remove from the live site (e.g. P-P, A-B).');
  };

  const submitDraft = () => {
    const home = String(draft.homeTeam ?? '').trim();
    const away = String(draft.awayTeam ?? '').trim();
    if (!home || !away) {
      setStatus('Home and away team names are required.');
      return;
    }

    if (editing) {
      const { band: fromBand, index } = editing;
      const prevList = fromBand === 'over' ? overPicks : underPicks;
      const base = prevList[index];
      const row = buildRowFromDraft(draft, base);

      if (band === fromBand) {
        if (fromBand === 'over') {
          setOverPicks((x) => x.map((p, j) => (j === index ? row : p)));
        } else {
          setUnderPicks((x) => x.map((p, j) => (j === index ? row : p)));
        }
      } else {
        if (fromBand === 'over') {
          setOverPicks((x) => x.filter((_, j) => j !== index));
        } else {
          setUnderPicks((x) => x.filter((_, j) => j !== index));
        }
        if (band === 'over') setOverPicks((x) => [...x, row]);
        else setUnderPicks((x) => [...x, row]);
      }
      setEditing(null);
      setDraft(emptyPick());
      setStatus('Pick updated in the list. Save to publish to Firebase.');
      return;
    }

    const row = buildRowFromDraft(draft);
    if (band === 'over') setOverPicks((p) => [...p, row]);
    else setUnderPicks((p) => [...p, row]);
    setDraft(emptyPick());
    setStatus('Pick added. Save to publish to Firebase.');
  };

  const save = async () => {
    setStatus(null);
    if (!adminKey.trim()) {
      setStatus('Admin key required.');
      return;
    }
    const dateNorm = normalizePicksCalendarDateInput(date);
    if (!dateNorm) {
      setStatus(
        'Could not read that date. Try 2026-03-23 or 23/03/2026 (UK day/month/year).',
      );
      return;
    }
    const trimmedYt = youtubeRaw.trim();
    let youtubeId: string | null;
    if (trimmedYt === '') {
      youtubeId = null;
    } else {
      const parsed = parseYoutubeIdFromInput(trimmedYt);
      if (!parsed) {
        setStatus('YouTube field: paste a watch URL, youtu.be link, or an 11-character video ID (or clear the field).');
        return;
      }
      youtubeId = parsed;
    }

    setLoading(true);
    try {
      const loadRes = await fetch(
        `/api/admin/manual-picks?date=${encodeURIComponent(dateNorm)}`,
        { headers: { Authorization: `Bearer ${adminKey.trim()}` } },
      );
      const loadJson = (await loadRes.json()) as { data?: unknown; error?: string };
      if (!loadRes.ok) {
        setStatus(loadJson.error || loadRes.statusText || 'Could not read Firebase before save.');
        return;
      }
      const raw = loadJson.data;
      const existing =
        raw != null && typeof raw === 'object' && !Array.isArray(raw)
          ? (raw as Record<string, unknown>)
          : null;

      let finalOver = overPicks;
      let finalUnder = underPicks;
      let mergedNote = '';
      if (lastLoadedDateKey !== dateNorm && existing) {
        finalOver = mergeManualPickLists(rtdbValueToPickList(existing.overForecasts), overPicks);
        finalUnder = mergeManualPickLists(rtdbValueToPickList(existing.underForecasts), underPicks);
        mergedNote =
          ' Merged with what was already in Firebase for this date (use Load first if you want the lists on screen to fully replace the server).';
      }

      let youtubeIdOut = youtubeId;
      let videoTitleOut = videoTitle.trim() || null;
      if (lastLoadedDateKey !== dateNorm && existing) {
        if (
          youtubeIdOut === null &&
          typeof existing.youtubeId === 'string' &&
          existing.youtubeId.trim()
        ) {
          youtubeIdOut = existing.youtubeId.trim();
        }
        if (
          !videoTitleOut &&
          typeof existing.videoTitle === 'string' &&
          existing.videoTitle.trim()
        ) {
          videoTitleOut = existing.videoTitle.trim();
        }
      }

      const body = {
        date: dateNorm,
        overForecasts: finalOver,
        underForecasts: finalUnder,
        youtubeId: youtubeIdOut,
        videoTitle: videoTitleOut,
      };
      const res = await fetch('/api/admin/manual-picks', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string; path?: string };
      if (!res.ok) {
        setStatus(json.error || res.statusText);
        return;
      }
      const used = (json as { dateUsed?: string }).dateUsed;
      if (used) setDate(used);
      setLastLoadedDateKey(dateNorm);
      setOverPicks(finalOver);
      setUnderPicks(finalUnder);
      setStatus(`Saved to ${json.path ?? 'manualExports'}.${mergedNote}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/60';

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] to-[#1f2937] text-white px-4 py-10 md:py-14">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col xl:flex-row xl:gap-10 xl:items-start">
          <div className="flex-1 min-w-0 max-w-2xl xl:max-w-none space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/best-picks" className="text-sm text-white/70 hover:text-white underline-offset-2">
            ← Back to Best Picks
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white underline-offset-2">
            Home
          </Link>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Best picks — owner tools</h1>
          <p className="text-sm text-white/55 mt-2 leading-relaxed">
            This page is not linked from the public site. Save your admin key in a password manager. Never commit
            keys to git. After changing data, the live Best Picks page updates automatically (Firebase subscription).
          </p>
        </div>

        <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold">1. Admin key</h2>
          <p className="text-xs text-white/50">
            Same value as <code className="text-white/70">ADMIN_MANUAL_PICKS_KEY</code> on Vercel. Sent as{' '}
            <code className="text-white/70">Authorization: Bearer …</code> only to your own API.
          </p>
          <input
            type="password"
            autoComplete="off"
            className={inputCls}
            placeholder="Paste admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => setRememberKey(e.target.checked)}
              className="rounded border-white/30"
            />
            Remember key in this browser (localStorage)
          </label>
        </section>

        <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold">2. Date &amp; load</h2>
          <p className="text-xs text-white/45 leading-relaxed">
            Use <strong className="text-white/60">2026-03-23</strong> or UK style{' '}
            <strong className="text-white/60">23/03/2026</strong> (slashes, dots, or hyphens). If a date
            could be US or UK (both numbers ≤ 12), we use <strong className="text-white/60">day first</strong>.
          </p>
          <label className="block text-xs font-medium text-white/45 uppercase tracking-wide">
            Calendar key
          </label>
          <input
            type="text"
            className={inputCls}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => {
              const n = normalizePicksCalendarDateInput(date);
              if (n) setDate(n);
            }}
            placeholder="2026-03-23 or 23/03/2026"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => void load()}
            className="rounded-lg bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Load from Firebase
          </button>
        </section>

        <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold">3. Add or edit picks</h2>
          <p className="text-xs text-white/45 leading-relaxed">
            <strong className="text-white/55">Load from Firebase</strong> for this date before editing if you want the
            lists here to be the full source of truth. If you save without loading, new rows are{' '}
            <strong className="text-white/55">merged</strong> onto what is already stored (other band and video are
            kept). <strong className="text-white/55">Remove</strong> drops a row from the list;{' '}
            <strong className="text-white/55">Save everything to Firebase</strong> updates the live site.{' '}
            <strong className="text-white/55">Edit</strong> / <strong className="text-white/55">Update pick</strong> for
            changes; you can switch band to move Over ↔ Under.
          </p>
          {editing && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-amber-500/15 border border-amber-400/30 px-3 py-2 text-sm text-amber-100/95">
              <span>Editing pick #{editing.index + 1} ({editing.band === 'over' ? 'Over' : 'Under'})</span>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-xs underline underline-offset-2 hover:text-white"
              >
                Cancel edit
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/45">Band</label>
              <select
                className={`${inputCls} mt-1`}
                value={band}
                onChange={(e) => setBand(e.target.value as Band)}
              >
                <option value="over">Over 2.5</option>
                <option value="under">Under 2.5</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/45">Home team</label>
              <input
                className={`${inputCls} mt-1`}
                value={String(draft.homeTeam ?? '')}
                onChange={(e) => setDraft((d) => ({ ...d, homeTeam: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-white/45">Away team</label>
              <input
                className={`${inputCls} mt-1`}
                value={String(draft.awayTeam ?? '')}
                onChange={(e) => setDraft((d) => ({ ...d, awayTeam: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-white/45">League</label>
              <input
                className={`${inputCls} mt-1`}
                value={String(draft.league ?? '')}
                onChange={(e) => setDraft((d) => ({ ...d, league: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-white/45">Country (optional)</label>
              <input
                className={`${inputCls} mt-1`}
                value={String(draft.country ?? '')}
                onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/45">Kickoff (optional — ISO date, URL, or text)</label>
            <input
              className={`${inputCls} mt-1`}
              value={String(draft.kickoff ?? '')}
              onChange={(e) => setDraft((d) => ({ ...d, kickoff: e.target.value }))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submitDraft}
              className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-4 py-2 text-sm font-medium"
            >
              {editing ? 'Update pick' : 'Add pick to list'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-white/50 mb-2">Over 2.5 ({overPicks.length})</p>
              <ul className="space-y-2 text-sm">
                {overPicks.map((p, i) => (
                  <li
                    key={typeof p.id === 'string' ? `over-${p.id}` : `over-${i}`}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 border ${
                      editing?.band === 'over' && editing.index === i
                        ? 'bg-amber-500/10 border-amber-400/35'
                        : 'bg-black/25 border-white/10'
                    }`}
                  >
                    <span className="truncate min-w-0">{pickLabel(p, i)}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        className="text-cyan-300 text-xs hover:underline"
                        onClick={() => startEdit('over', i)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-300 text-xs hover:underline"
                        onClick={() => removePick('over', i)}
                      >
                        Remove
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/50 mb-2">Under 2.5 ({underPicks.length})</p>
              <ul className="space-y-2 text-sm">
                {underPicks.map((p, i) => (
                  <li
                    key={typeof p.id === 'string' ? `under-${p.id}` : `under-${i}`}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 border ${
                      editing?.band === 'under' && editing.index === i
                        ? 'bg-amber-500/10 border-amber-400/35'
                        : 'bg-black/25 border-white/10'
                    }`}
                  >
                    <span className="truncate min-w-0">{pickLabel(p, i)}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        className="text-cyan-300 text-xs hover:underline"
                        onClick={() => startEdit('under', i)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-300 text-xs hover:underline"
                        onClick={() => removePick('under', i)}
                      >
                        Remove
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/15 bg-white/5 p-6 space-y-4">
          <h2 className="text-lg font-semibold">4. Video (YouTube)</h2>
          <p className="text-xs text-white/50">
            Paste a full watch URL or the 11-character video ID. Leave empty and save to remove the video for this
            date.
          </p>
          <input
            className={inputCls}
            placeholder="https://www.youtube.com/watch?v=…"
            value={youtubeRaw}
            onChange={(e) => setYoutubeRaw(e.target.value)}
          />
          <div>
            <label className="text-xs text-white/45">Title (optional, shown above the player)</label>
            <input
              className={`${inputCls} mt-1`}
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => void save()}
            className="rounded-lg bg-cyan-600/90 hover:bg-cyan-600 px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            Save everything to Firebase
          </button>
        </div>

        {status && (
          <p
            className={`text-sm rounded-lg px-4 py-3 border ${
              status.startsWith('Saved') || status.includes('Loaded')
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-100'
                : 'bg-amber-500/10 border-amber-400/30 text-amber-100'
            }`}
            role="status"
          >
            {status}
          </p>
        )}
          </div>

          <aside className="w-full xl:w-[min(100%,22rem)] shrink-0 xl:sticky xl:top-6 space-y-4 mt-10 xl:mt-0">
            <AdminPredictionEmailBlocklist
              adminKey={adminKey}
              refreshSignal={predictionBlocklistRefreshSignal}
            />
            <AdminPredictionSubmissions
              adminKey={adminKey}
              onBlockedEmail={() => setPredictionBlocklistRefreshSignal((n) => n + 1)}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
