import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';
import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import { andAnotherThingPostsPath, parsePostsMap } from '@/lib/and-another-thing';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

export async function GET() {
  noStore();
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ posts: [] }, { headers: noCacheHeaders });
  }
  try {
    const app = getFirebaseAdminApp();
    const ref = getDatabase(app).ref(andAnotherThingPostsPath());
    const snap = await ref.once('value');
    const posts = parsePostsMap(snap.val());
    return NextResponse.json({ posts }, { headers: noCacheHeaders });
  } catch {
    return NextResponse.json({ posts: [] }, { headers: noCacheHeaders });
  }
}
