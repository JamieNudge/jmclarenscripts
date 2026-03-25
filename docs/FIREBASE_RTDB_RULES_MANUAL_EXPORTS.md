# Realtime Database rules: `manualExports`

Manual picks and the best-picks video are written **only** by your Vercel API (`firebase-admin`), not by browsers. Client apps (the public site and the admin form) **read** the same paths they already use for `unanimousExports`.

## Suggested rules fragment

Merge this with your existing rules. Adjust if your tree uses different parents.

```json
{
  "rules": {
    "manualExports": {
      ".read": true,
      ".write": false
    }
  }
}
```

- **`.read": true`** — Same openness as typical public `unanimousExports` reads; tighten to `auth != null` if you ever lock down the site.
- **`.write": false`** — Blocks all client writes. The Admin SDK bypasses these rules, so `POST /api/admin/manual-picks` still works when `FIREBASE_SERVICE_ACCOUNT_JSON` is set on the server.

If you prefer stricter read access, replace `.read` with a condition that matches how you secure `unanimousExports`.

## Root key

Default path: `manualExports/{YYYY-MM-DD}`. Override with `NEXT_PUBLIC_FIREBASE_MANUAL_EXPORTS_ROOT` (and optional server-only `FIREBASE_MANUAL_EXPORTS_ROOT`) if you use a different root name.
