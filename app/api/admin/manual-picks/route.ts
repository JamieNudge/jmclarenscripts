import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import type { PickRecord } from '@/lib/best-picks-firebase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function manualRoot(): string {
  return (
    process.env.FIREBASE_MANUAL_EXPORTS_ROOT?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_MANUAL_EXPORTS_ROOT?.trim() ||
    'manualExports'
  );
}

function authorized(req: NextRequest): boolean {
  const key = process.env.ADMIN_MANUAL_PICKS_KEY?.trim();
  if (!key) return false;
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ')) return false;
  return h.slice(7).trim() === key;
}

function normalizeForecastsList(raw: unknown): PickRecord[] {
  if (!Array.isArray(raw)) return [];
  const t = Date.now();
  return raw.map((item, i) => {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) {
      return { _bestPicksManualEditor: true as const, id: `manual-${t}-${i}` };
    }
    const p = item as PickRecord;
    return {
      ...p,
      _bestPicksManualEditor: true as const,
      id: p.id ?? `manual-${t}-${i}`,
    };
  });
}

function misconfigured() {
  return NextResponse.json(
    { error: 'Admin API not configured (set ADMIN_MANUAL_PICKS_KEY and FIREBASE_SERVICE_ACCOUNT_JSON)' },
    { status: 503 },
  );
}

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const date = req.nextUrl.searchParams.get('date');
  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json({ error: 'Query ?date=YYYY-MM-DD required' }, { status: 400 });
  }
  try {
    const app = getFirebaseAdminApp();
    const db = getDatabase(app);
    const snap = await db.ref(`${manualRoot()}/${date}`).once('value');
    return NextResponse.json({ data: snap.val() ?? null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) return misconfigured();
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const date = body.date;
  if (typeof date !== 'string' || !DATE_RE.test(date)) {
    return NextResponse.json({ error: 'Body field date (YYYY-MM-DD) required' }, { status: 400 });
  }

  const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

  if (!has('overForecasts') && !has('underForecasts') && !has('youtubeId') && !has('videoTitle')) {
    return NextResponse.json(
      { error: 'Provide at least one of: overForecasts, underForecasts, youtubeId, videoTitle' },
      { status: 400 },
    );
  }

  try {
    const app = getFirebaseAdminApp();
    const db = getDatabase(app);
    const r = db.ref(`${manualRoot()}/${date}`);
    const snap = await r.once('value');
    const cur = (snap.val() as Record<string, unknown> | null) ?? {};
    const next: Record<string, unknown> = { ...cur };

    if (has('overForecasts')) {
      next.overForecasts = normalizeForecastsList(body.overForecasts);
    }
    if (has('underForecasts')) {
      next.underForecasts = normalizeForecastsList(body.underForecasts);
    }
    if (has('youtubeId')) {
      const y = body.youtubeId;
      if (y === null || y === '') {
        next.youtubeId = null;
      } else if (typeof y === 'string' && y.trim()) {
        next.youtubeId = y.trim();
      } else {
        return NextResponse.json({ error: 'youtubeId must be string, empty string, or null' }, { status: 400 });
      }
    }
    if (has('videoTitle')) {
      const vt = body.videoTitle;
      if (vt === null || vt === '') {
        next.videoTitle = null;
      } else if (typeof vt === 'string') {
        next.videoTitle = vt.trim() || null;
      } else {
        return NextResponse.json({ error: 'videoTitle must be string or null' }, { status: 400 });
      }
    }

    await r.set(next);
    return NextResponse.json({ ok: true, path: `${manualRoot()}/${date}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
