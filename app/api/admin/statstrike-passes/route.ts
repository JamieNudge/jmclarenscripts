import { NextRequest, NextResponse } from 'next/server';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import { listPassesForAdmin } from '@/lib/statstrike/pass-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) {
    return NextResponse.json({ error: 'Admin API not configured' }, { status: 503 });
  }
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const filter = req.nextUrl.searchParams.get('filter') || 'all';
  if (!['all', 'email', 'marketing', 'survey'].includes(filter)) {
    return NextResponse.json({ error: 'Invalid filter' }, { status: 400 });
  }

  try {
    let passes = await listPassesForAdmin(300);
    if (filter === 'email') passes = passes.filter((p) => Boolean(p.email));
    if (filter === 'marketing') {
      passes = passes.filter((p) => Boolean(p.email && p.marketingConsent));
    }
    if (filter === 'survey') passes = passes.filter((p) => Boolean(p.email && p.surveyConsent));

    const entries = passes.map(({ tokenHash: _tokenHash, ...safe }) => safe);
    return NextResponse.json(
      { entries },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 },
    );
  }
}
