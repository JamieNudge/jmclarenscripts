import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import {
  normalizePredictionIdeaEmail,
  predictionIdeaBlockedEmailsRoot,
  predictionIdeaEmailBlocklistKey,
} from '@/lib/prediction-idea-server';
import { sendStatstrikeBetaFeedbackNotifyEmail } from '@/lib/send-statstrike-beta-feedback-email';
import { statstrikeBetaFeedbackSubmissionsRoot } from '@/lib/statstrike-beta-feedback-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_LEN = {
  short: 500,
  medium: 4000,
} as const;

const VALID_TOPICS = new Set(['question', 'feedback', 'bug']);

function trimStr(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

function misconfigured() {
  return NextResponse.json(
    {
      error:
        'Submissions are not available right now (server email/database not configured). Please use the email link below.',
    },
    { status: 503 },
  );
}

/** Public POST: stores one StatStrike Android beta feedback submission under RTDB. */
export async function POST(req: NextRequest) {
  let app;
  try {
    app = getFirebaseAdminApp();
  } catch {
    return misconfigured();
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const o = body as Record<string, unknown>;

  if (trimStr(o.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = trimStr(o.name, MAX_LEN.short);
  const email = trimStr(o.email, MAX_LEN.short);
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter your name and a valid email.' }, { status: 400 });
  }

  const topic = trimStr(o.topic, 32);
  if (!VALID_TOPICS.has(topic)) {
    return NextResponse.json({ error: 'Please select a topic.' }, { status: 400 });
  }

  const message = trimStr(o.message, MAX_LEN.medium);
  if (!message) {
    return NextResponse.json({ error: 'Please enter a message.' }, { status: 400 });
  }

  const payload = {
    name,
    email,
    topic,
    message,
    submittedAt: Date.now(),
    userAgent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
  };

  try {
    const db = getDatabase(app);
    const norm = normalizePredictionIdeaEmail(email);
    const blockKey = predictionIdeaEmailBlocklistKey(norm);
    const blockedSnap = await db.ref(`${predictionIdeaBlockedEmailsRoot()}/${blockKey}`).once('value');
    if (blockedSnap.exists()) {
      return NextResponse.json({ ok: true });
    }

    const ref = db.ref(statstrikeBetaFeedbackSubmissionsRoot()).push();
    await ref.set(payload);
    try {
      await sendStatstrikeBetaFeedbackNotifyEmail(payload);
    } catch (err) {
      console.error('[statstrike-beta-feedback] notify email failed', err);
    }
    return NextResponse.json({ ok: true, id: ref.key });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
