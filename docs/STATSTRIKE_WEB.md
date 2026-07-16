# StatStrike Web

Early browser version of StatStrike inside Portfolio-site / GoalLab.

## Kill switches

### Product on/off (Vercel env — redeploy)

```bash
NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED=1
```

- **Unset / `0`:** GoalLab hero right cell stays the featured fixture card; `/statstrike` app routes return 404. Policy pages still work.
- **`1`:** Hero shows `StatStrikeHeroPanel`; full board at `/statstrike`.

### Coming Soon blur (admin — live, no redeploy)

Stored in RTDB at `statstrikeWebConfig` → `{ blur: boolean, updatedAt }`.

- Toggle on **`/admin/picks`** → section **StatStrike Web — Coming Soon blur** (same Bearer key as picks).
- Public clients subscribe live; missing node defaults to **blur ON** (safe teaser).
- **Blur OFF** while building / reviewing the interactive board.
- **Blur ON** when you want the App Store teaser again before Stripe.

Suggested Firebase rules (write only via Admin SDK):

```json
"statstrikeWebConfig": {
  ".read": true,
  ".write": false
}
```

## Routes

| Path | Role |
|------|------|
| GoalLab `/` hero right | Live StatStrike panel when enabled |
| `/statstrike` | Full board (filters, day nav, tabs) |
| `/statstrike/settings` | Legal + premium stubs |
| `/admin/picks` | Blur kill-switch (+ other owner tools) |
| `/statstrike/content-rating` | App Store rating page (always on) |

## Data

- Reads Firebase RTDB `selections/{yyyy-MM-dd}` (UK / `Europe/London` business day).
- Merges yesterday **live carry-over** only (iOS-aligned).
- Filters: All / Live / AM–PM–Night / Custom; Best / Upper / Minor; team search.
- GoalLab “Today’s forecasts” still uses `unanimousExports` — unchanged.

## Not wired yet

- Stripe / paywall (premium UI stubs → App Store)
- FCM web push
- IndexedDB personal track record
- Login / accounts

## Local

1. Copy Firebase vars from `.env.example`.
2. Set `NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED=1`.
3. `npm run dev` → `/statstrike` and `/admin/picks` (turn blur OFF to work interactively).
