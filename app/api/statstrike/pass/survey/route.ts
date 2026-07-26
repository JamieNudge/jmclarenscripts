import { NextRequest } from 'next/server';
import { clientIpFromRequest } from '@/lib/statstrike/checkout-rate-limit';
import {
  createSurveyResponse,
  getPassById,
} from '@/lib/statstrike/pass-store';
import { jsonNoStore } from '@/lib/statstrike/pass-session';
import { allowSurveyPost } from '@/lib/statstrike/survey-rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function validPassId(value: string): boolean {
  return /^pass_[A-Za-z0-9_-]{8,80}$/.test(value);
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
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  if (!validPassId(passId)) {
    return jsonNoStore({ error: 'Invalid pass' }, { status: 400 });
  }
  if (message.length < 3 || message.length > 2_000) {
    return jsonNoStore(
      { error: 'Feedback must be between 3 and 2,000 characters.' },
      { status: 400 },
    );
  }

  try {
    const pass = await getPassById(passId);
    if (!pass) return jsonNoStore({ error: 'Pass not found' }, { status: 404 });
    if (!pass.surveyConsent || pass.piiRedactedAt) {
      return jsonNoStore({ error: 'Survey access is not available for this pass.' }, { status: 403 });
    }
    await createSurveyResponse({ passId, message });
    return jsonNoStore({ ok: true });
  } catch (e) {
    return jsonNoStore(
      { error: e instanceof Error ? e.message : 'Could not save feedback' },
      { status: 500 },
    );
  }
}
