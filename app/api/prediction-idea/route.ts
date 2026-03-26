import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { predictionIdeaSubmissionsRoot } from '@/lib/prediction-idea-server';
import { sendPredictionIdeaNotifyEmail } from '@/lib/send-prediction-idea-email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_LEN = {
  short: 500,
  medium: 4000,
  long: 12000,
} as const;

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

/** Public POST: stores one submission under RTDB for the owner to read in the console. */
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

  // Honeypot
  if (trimStr(o.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = trimStr(o.name, MAX_LEN.short);
  const email = trimStr(o.email, MAX_LEN.short);
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter your name and a valid email.' }, { status: 400 });
  }

  const ideaDescribe = trimStr(o.ideaDescribe, MAX_LEN.long);
  if (!ideaDescribe) {
    return NextResponse.json({ error: 'Please describe your prediction idea.' }, { status: 400 });
  }

  const payload = {
    name,
    email,
    ideaDescribe,
    dataRelies: trimStr(o.dataRelies, MAX_LEN.medium),
    expectedOutput: trimStr(o.expectedOutput, MAX_LEN.medium),
    frequency: trimStr(o.frequency, 64),
    frequencyOther: trimStr(o.frequencyOther, MAX_LEN.short),
    leaguesFilters: trimStr(o.leaguesFilters, MAX_LEN.medium),
    hasApi: trimStr(o.hasApi, 32),
    duration: trimStr(o.duration, 32),
    hopingToLearn: trimStr(o.hopingToLearn, MAX_LEN.long),
    testedBefore: trimStr(o.testedBefore, 32),
    testedBeforeDescribe: trimStr(o.testedBeforeDescribe, MAX_LEN.medium),
    anythingElse: trimStr(o.anythingElse, MAX_LEN.long),
    submittedAt: Date.now(),
    userAgent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
  };

  try {
    const db = getDatabase(app);
    const ref = db.ref(predictionIdeaSubmissionsRoot()).push();
    await ref.set(payload);
    void sendPredictionIdeaNotifyEmail(payload).catch((err) => {
      console.error('[prediction-idea] notify email failed', err);
    });
    return NextResponse.json({ ok: true, id: ref.key });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
