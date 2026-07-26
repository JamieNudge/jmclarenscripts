import { NextRequest, NextResponse } from 'next/server';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import { listSurveyResponses } from '@/lib/statstrike/pass-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) {
    return NextResponse.json({ error: 'Admin API not configured' }, { status: 503 });
  }
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const entries = await listSurveyResponses(300);
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
