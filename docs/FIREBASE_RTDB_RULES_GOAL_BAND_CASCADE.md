# Realtime Database rules: `goalBandCascadeSelections`

The GoalLab **Research** page reads **`goalBandCascadeSelections/{YYYY-MM-DD}`** in the browser (same Firebase project as `dailyConsensusSelections` / `researchAlgorithmSelections`). If rules omit this path, the Goal Band Cascade section shows `permission_denied`.

## Suggested rules fragment

Merge with your existing rules (same pattern as `dailyConsensusSelections`).

```json
{
  "rules": {
    "goalBandCascadeSelections": {
      ".read": true,
      ".write": false
    }
  }
}
```

- **`.read": true`** — Unauthenticated clients can load cascade picks for the visible calendar day.
- **`.write": false`** — Only trusted writers (**All Models Best Forecaster** with a service account / Admin SDK) should write.

## Root key

Default path: `goalBandCascadeSelections/{date}`. Override with **`NEXT_PUBLIC_FIREBASE_GOAL_BAND_CASCADE_ROOT`** if you use a different root name.

Uploaded by AMBF `ResearchSelectionsSync` together with research + daily consensus.
