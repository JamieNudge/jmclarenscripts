# Realtime Database rules: `dailyConsensusSelections`

The public **`/football-predictions`** page reads **`dailyConsensusSelections/{YYYY-MM-DD}`** in the browser (same Firebase project as `unanimousExports` / `researchAlgorithmSelections`). If rules omit this path, the Daily consensus panel shows:

`permission_denied at /dailyConsensusSelections/…`

## Suggested rules fragment

Merge with your existing rules (same pattern as `manualExports` / public reads).

```json
{
  "rules": {
    "dailyConsensusSelections": {
      ".read": true,
      ".write": false
    }
  }
}
```

- **`.read": true`** — Unauthenticated clients can load consensus for the visible calendar day. Match how you expose `unanimousExports` / `researchAlgorithmSelections`.
- **`.write": false`** — Only trusted writers (e.g. **All Models Best Forecaster** with a service account, or Admin SDK) should write; client apps must not.

The Admin SDK bypasses these rules for server-side jobs.

## Root key

Default path: `dailyConsensusSelections/{date}`. Override with **`NEXT_PUBLIC_FIREBASE_DAILY_CONSENSUS_ROOT`** if you use a different root name.

See also **`BEST_PICKS_SETUP_GUIDE.md`** (Part E) and **`docs/FIREBASE_RTDB_RULES_MANUAL_EXPORTS.md`**.
