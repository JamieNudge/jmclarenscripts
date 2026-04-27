import { NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { andAnotherThingPostsPath, parsePostsMap } from '@/lib/and-another-thing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const noCache = { 'Cache-Control': 'no-store' } as const;

export async function GET() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ posts: [] }, { headers: noCache });
  }
  try {
    const app = getFirebaseAdminApp();
    const ref = getDatabase(app).ref(andAnotherThingPostsPath());
    const snap = await ref.once('value');
    const posts = parsePostsMap(snap.val());
    return NextResponse.json({ posts }, { headers: noCache });
  } catch {
    return NextResponse.json({ posts: [] }, { headers: noCache });
  }
}
