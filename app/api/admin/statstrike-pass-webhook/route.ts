import { NextRequest, NextResponse } from 'next/server';
import { isManualPicksAdminAuthorized } from '@/lib/admin-manual-picks-auth';
import { ensureStatStrikePassWebhookEndpoint } from '@/lib/statstrike/stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function misconfigured() {
  return NextResponse.json(
    { error: 'Admin API not configured (set ADMIN_MANUAL_PICKS_KEY and STRIPE_SECRET_KEY)' },
    { status: 503 },
  );
}

/**
 * Point the Stripe pass webhook at production (or an explicit url).
 * POST { "url"?: "https://thegoallab.net/api/statstrike/pass/webhook" }
 */
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return misconfigured();
  }
  const adminKey = process.env.ADMIN_MANUAL_PICKS_KEY?.trim();
  const testSecret = process.env.STATSTRIKE_PASS_TEST_SECRET?.trim();
  const auth = req.headers.get('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const ok =
    (adminKey && isManualPicksAdminAuthorized(req)) ||
    (Boolean(testSecret) && bearer === testSecret);
  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { url?: string } = {};
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    body = {};
  }

  const target =
    (typeof body.url === 'string' && body.url.trim()) ||
    'https://thegoallab.net/api/statstrike/pass/webhook';

  if (!target.startsWith('https://') || !target.includes('/api/statstrike/pass/webhook')) {
    return NextResponse.json({ error: 'Invalid webhook url' }, { status: 400 });
  }

  try {
    const result = await ensureStatStrikePassWebhookEndpoint(target);
    return NextResponse.json({
      ok: true,
      id: result.id,
      url: result.url,
      action: result.action,
      // Only returned on create so Vercel STRIPE_WEBHOOK_SECRET can be rotated.
      signingSecret: result.signingSecret,
      note:
        result.action === 'created'
          ? 'New endpoint created — set STRIPE_WEBHOOK_SECRET in Vercel to signingSecret, then redeploy.'
          : result.action === 'updated'
            ? 'Existing endpoint URL updated; existing STRIPE_WEBHOOK_SECRET remains valid.'
            : 'Webhook already pointed at target.',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
