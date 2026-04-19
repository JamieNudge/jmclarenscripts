/**
 * Storage bucket for Admin uploads (blog images).
 * Prefer **`FIREBASE_STORAGE_BUCKET`** (or `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`) with the exact name from Firebase.
 * If unset, falls back to **`{project_id}.appspot.com`** from the service account JSON — that default is wrong for some
 * newer Firebase projects, which use **`{project_id}.firebasestorage.app`** until you set the env explicitly.
 */
export function firebaseAdminStorageBucket(): string | null {
  const fromEnv =
    process.env.FIREBASE_STORAGE_BUCKET?.trim() || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (fromEnv) return fromEnv;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!json) return null;
  try {
    const cred = JSON.parse(json) as { project_id?: string; projectId?: string };
    const pid = cred.project_id ?? cred.projectId;
    if (pid) return `${pid}.appspot.com`;
  } catch {
    return null;
  }
  return null;
}
