import { NextRequest } from 'next/server';
import { clientIpFromRequest } from '@/lib/statstrike/checkout-rate-limit';
import {
  createSurveyResponse,
  getPassById,
  type StatStrikeWouldBuyAgain,
} from '@/lib/statstrike/pass-store';
import { jsonNoStore } from '@/lib/statstrike/pass-session';
import { allowSurveyPost } from '@/lib/statstrike/survey-rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WOULD_BUY_AGAIN = new Set<StatStrikeWouldBuyAgain>(['yes', 'maybe', 'no']);

function validPassId(value: string): boolean {
  return /^pass_[A-Za-z0-9_-]{8,80}$/.test(value);
}

function parseOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

export async function POST(req: NextRequest) {
  if (!allowSurveyPost(clientIpFromRequest(req))) {
    return jsonNoStore(
      { error: 'Too many survey submissions. Please try again later.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonNoStore({ error: 'Invalid body' }, { status: 400 });
  }
  const data = body as Record<string, unknown>;
  const passId = typeof data.passId === 'string' ? data.passId.trim() : '';
  if (!validPassId(passId)) {
    return jsonNoStore({ error: 'Invalid pass' }, { status: 400 });
  }

  const ratingRaw = data.rating;
  const rating =
    typeof ratingRaw === 'number'
      ? ratingRaw
      : typeof ratingRaw === 'string'
        ? Number(ratingRaw)
        : NaN;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return jsonNoStore({ error: 'Rating must be an integer from 1 to 5.' }, { status: 400 });
  }

  const wouldBuyAgainRaw =
    typeof data.wouldBuyAgain === 'string' ? data.wouldBuyAgain.trim().toLowerCase() : '';
  if (!WOULD_BUY_AGAIN.has(wouldBuyAgainRaw as StatStrikeWouldBuyAgain)) {
    return jsonNoStore(
      { error: 'Please choose whether you would buy another pass.' },
      { status: 400 },
    );
  }
  const wouldBuyAgain = wouldBuyAgainRaw as StatStrikeWouldBuyAgain;

  const worked = parseOptionalText(data.worked);
  const improve = parseOptionalText(data.improve);
  if ((worked && worked.length > 2_000) || (improve && improve.length > 2_000)) {
    return jsonNoStore(
      { error: 'Each feedback field must be at most 2,000 characters.' },
      { status: 400 },
    );
  }

  try {
    const pass = await getPassById(passId);
    if (!pass) return jsonNoStore({ error: 'Pass not found' }, { status: 404 });
    if (!pass.surveyConsent || pass.piiRedactedAt) {
      return jsonNoStore({ error: 'Survey access is not available for this pass.' }, { status: 403 });
    }
    await createSurveyResponse({
      passId,
      rating,
      wouldBuyAgain,
      worked,
      improve,
    });
    return jsonNoStore({ ok: true });
  } catch (e) {
    return jsonNoStore(
      { error: e instanceof Error ? e.message : 'Could not save feedback' },
      { status: 500 },
    );
  }
}
