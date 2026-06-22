# Realtime Database rules: `fixtureContexts`

The GoalLab fixtures detail page reads **`fixtureContexts/{YYYY-MM-DD}/{fixtureId}`** (uploaded by Stat Strike Firebase on Mac after analysis).

If this path is not readable, the site still shows key-signal **percentages** from `selections/{date}.stats`, but **not** game counts or date spans.

## Suggested rules fragment

Merge with your existing rules (same openness as `unanimousExports` / `selections`):

```json
{
  "rules": {
    "fixtureContexts": {
      ".read": true,
      ".write": false
    }
  }
}
```

- **`.read": true`** — Public read for the web fixtures detail page (client Firebase SDK).
- **`.write": false`** — Only the Mac uploader (Admin SDK or authenticated Mac app) should write.

## Verify upload

In Firebase Console → Realtime Database, after Mac upload:

- `fixtureContexts/2026-06-22/1549303` (or the day node with child keys per fixture id)

Mac console should log: `Fixture contexts uploaded: {date} (N fixtures)`.

If you see `No fixture context rows to upload`, re-run **full fixture analysis** (not re-upload only) so `webMatchSlices` are built.
