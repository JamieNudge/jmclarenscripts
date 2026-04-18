/**
 * Storage bucket for Admin uploads (blog images). Prefer explicit env; else `{project_id}.appspot.com`.
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
