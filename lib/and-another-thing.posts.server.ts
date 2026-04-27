import 'server-only';

import { unstable_noStore as noStore } from 'next/cache';
import { getDatabase } from 'firebase-admin/database';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';
import {
  andAnotherThingPostsPath,
  type AnotherThingPost,
  parsePostsMap,
} from '@/lib/and-another-thing';

/** Public micro-feed: read from RTDB on the server (no `fetch` / CDN cache to fight). */
export async function loadAndAnotherThingPostsForPublic(): Promise<AnotherThingPost[]> {
  noStore();
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return [];
  }
  try {
    const app = getFirebaseAdminApp();
    const ref = getDatabase(app).ref(andAnotherThingPostsPath());
    const snap = await ref.once('value');
    return parsePostsMap(snap.val());
  } catch {
    return [];
  }
}
