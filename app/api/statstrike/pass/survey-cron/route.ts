import { NextRequest } from 'next/server';
import { isPassActive } from '@/lib/statstrike/pass';
import {
  listPassesForSurveySweep,
  markSurveyEmailSent,
} from '@/lib/statstrike/pass-store';
import { sendStatStrikePassSurveyEmail } from '@/lib/send-statstrike-pass-email';
import { jsonNoStore } from '@/lib/statstrike/pass-session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Cron / manual sweep: send survey emails for expired passes with surveyConsent.
 * Protect with CRON_SECRET or ADMIN_MANUAL_PICKS_KEY Bearer.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const cronHeader = req.headers.get('x-vercel-cron');
  const secret =
    process.env.CRON_SECRET?.trim() ||
    process.env.STATSTRIKE_PASS_CRON_SECRET?.trim() ||
    process.env.ADMIN_MANUAL_PICKS_KEY?.trim() ||
    '';

  const allowed =
    Boolean(cronHeader) || (secret && (bearer === secret || req.nextUrl.searchParams.get('key') === secret));
  if (!allowed) {
    return jsonNoStore({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  let candidates: Awaited<ReturnType<typeof listPassesForSurveySweep>> = [];
  try {
    candidates = await listPassesForSurveySweep(300);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Store failed';
    return jsonNoStore({ error: msg }, { status: 503 });
  }

  let sent = 0;
  let skipped = 0;
  for (const pass of candidates) {
    if (!pass.surveyConsent || pass.surveyEmailSentAt || !pass.email) {
      skipped += 1;
      continue;
    }
    if (isPassActive(pass, now)) {
      skipped += 1;
      continue;
    }
    // Only within ~3 days after expiry to avoid blasting ancient records.
    const exp = Date.parse(pass.expiresAt);
    if (!Number.isFinite(exp) || now - exp > 3 * 24 * 60 * 60 * 1000) {
      skipped += 1;
      continue;
    }
    try {
      const ok = await sendStatStrikePassSurveyEmail({ to: pass.email, passId: pass.passId });
      if (ok) {
        await markSurveyEmailSent(pass.passId, new Date().toISOString());
        sent += 1;
      } else {
        skipped += 1;
      }
    } catch (e) {
      console.error('[statstrike-pass] survey email failed', pass.passId, e);
    }
  }

  return jsonNoStore({ ok: true, sent, skipped, scanned: candidates.length });
}
