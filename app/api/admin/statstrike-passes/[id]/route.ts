import { NextRequest, NextResponse } from 'next/server';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import {
  redactPassPii,
  withdrawPassMarketingConsent,
} from '@/lib/statstrike/pass-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function validId(id: string): boolean {
  return /^pass_[A-Za-z0-9_-]{8,80}$/.test(id);
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  if (!process.env.ADMIN_MANUAL_PICKS_KEY?.trim()) {
    return NextResponse.json({ error: 'Admin API not configured' }, { status: 503 });
  }
  if (!isManualPicksAdminAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!validId(context.params.id)) {
    return NextResponse.json({ error: 'Invalid pass id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const action =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>).action
      : null;
  if (action !== 'withdraw_marketing' && action !== 'redact_pii') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    const found =
      action === 'withdraw_marketing'
        ? await withdrawPassMarketingConsent(context.params.id)
        : await redactPassPii(context.params.id);
    if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, action });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 },
    );
  }
}
