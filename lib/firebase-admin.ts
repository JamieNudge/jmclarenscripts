import { cert, getApps, initializeApp, getApp, type App } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin/app';

function getDatabaseUrl(): string | null {
  return (
    process.env.FIREBASE_DATABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim() ||
    null
  );
}

/** Server-only Firebase Admin app (Realtime Database writes). */
export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) return getApp();

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const databaseURL = getDatabaseUrl();
  if (!json) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set');
  }
  if (!databaseURL) {
    throw new Error('FIREBASE_DATABASE_URL or NEXT_PUBLIC_FIREBASE_DATABASE_URL is not set');
  }

  let cred: ServiceAccount;
  try {
    cred = JSON.parse(json) as ServiceAccount;
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }

  return initializeApp({
    credential: cert(cred),
    databaseURL,
  });
}
