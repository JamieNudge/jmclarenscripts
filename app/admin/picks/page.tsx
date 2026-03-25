'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { PickRecord } from '@/lib/best-picks-firebase';
import { picksDateStringInTimeZone, picksTimeZoneFromEnv } from '@/lib/best-picks-firebase';
import { parseYoutubeIdFromInput } from '@/lib/youtube-embed';

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
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/manual-picks?date=${encodeURIComponent(date)}`, {
        headers: { Authorization: `Bearer ${adminKey.trim()}` },
      });
      const json = (await res.json()) as { data?: unknown; error?: string };
      if (!res.ok) {
        setStatus(json.error || res.statusText);
        return;
      }
      const d = json.data;
      if (d && typeof d === 'object' && !Array.isArray(d)) {
        const o = d as Record<string, unknown>;
        setOverPicks(Array.isArray(o.overForecasts) ? (o.overForecasts as PickRecord[]) : []);
        setUnderPicks(Array.isArray(o.underForecasts) ? (o.underForecasts as PickRecord[]) : []);
        setYoutubeRaw(typeof o.youtubeId === 'string' ? o.youtubeId : '');
        setVideoTitle(typeof o.videoTitle === 'string' ? o.videoTitle : '');
      } else {
        setOverPicks([]);
        setUnderPicks([]);
        setYoutubeRaw('');
        setVideoTitle('');
      }
      setStatus('Loaded from Firebase.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [adminKey, date]);

  const addDraft = () => {
    const home = String(draft.homeTeam ?? '').trim();
    const away = String(draft.awayTeam ?? '').trim();
    if (!home || !away) {
      setStatus('Home and away team names are required to add a pick.');
      return;
    }
    const row: PickRecord = {
      homeTeam: home,
      awayTeam: away,
      league: String(draft.league ?? '').trim(),
      country: String(draft.country ?? '').trim(),
    };
    const ko = String(draft.kickoff ?? '').trim();
    if (ko) row.kickoff = ko;
    if (band === 'over') setOverPicks((p) => [...p, row]);
    else setUnderPicks((p) => [...p, row]);
    setDraft(emptyPick());
    setStatus('Pick added in the list below. Click Save to publish to Firebase.');
  };

  const save = async () => {
    setStatus(null);
    if (!adminKey.trim()) {
      setStatus('Admin key required.');
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
      const body = {
        date,
        overForecasts: overPicks,
        underForecasts: underPicks,
        youtubeId,
        videoTitle: videoTitle.trim() || null,
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
      setStatus(`Saved to ${json.path ?? 'manualExports'}.`);
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
      <div className="max-w-2xl mx-auto space-y-8">
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
          <label className="block text-xs font-medium text-white/45 uppercase tracking-wide">Calendar key (YYYY-MM-DD)</label>
          <input
            type="text"
            className={inputCls}
            value={date}
            onChange={(e) => setDate(e.target.value.trim())}
            pattern="\d{4}-\d{2}-\d{2}"
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
          <h2 className="text-lg font-semibold">3. Add picks</h2>
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
          <button
            type="button"
            onClick={addDraft}
            className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-4 py-2 text-sm font-medium"
          >
            Add pick to list
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-white/50 mb-2">Over 2.5 ({overPicks.length})</p>
              <ul className="space-y-2 text-sm">
                {overPicks.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg bg-black/25 px-3 py-2 border border-white/10"
                  >
                    <span className="truncate">{pickLabel(p, i)}</span>
                    <button
                      type="button"
                      className="text-red-300 text-xs shrink-0 hover:underline"
                      onClick={() => setOverPicks((x) => x.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-white/50 mb-2">Under 2.5 ({underPicks.length})</p>
              <ul className="space-y-2 text-sm">
                {underPicks.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-lg bg-black/25 px-3 py-2 border border-white/10"
                  >
                    <span className="truncate">{pickLabel(p, i)}</span>
                    <button
                      type="button"
                      className="text-red-300 text-xs shrink-0 hover:underline"
                      onClick={() => setUnderPicks((x) => x.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
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
    </main>
  );
}
