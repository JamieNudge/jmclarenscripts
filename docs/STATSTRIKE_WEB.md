# StatStrike Web

Early browser version of StatStrike inside Portfolio-site / GoalLab.

## Kill switch

```bash
NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED=1
```

- **Unset / `0`:** GoalLab hero right cell stays the featured fixture card; `/statstrike` app routes return 404. Policy pages (`/privacy/statstrike`, `/statstrike/content-rating`, etc.) still work.
- **`1`:** Hero shows branded `StatStrikeHeroPanel` (logo + wordmark + live board). Full board at `/statstrike`.

Flip the env on Vercel and redeploy to roll back without code revert.

## Routes

| Path | Role |
|------|------|
| GoalLab `/` (thegoallab.net) hero right | Live StatStrike panel when enabled |
| `/statstrike` | Full board |
| `/statstrike/settings` | Legal + preview notes |
| `/statstrike/content-rating` | Existing App Store rating page (always on) |

Hub middleware passthrough keeps `/statstrike` on `thegoallab.net` (same as `/blog`).

## Data

- Reads Firebase RTDB `selections/{yyyy-MM-dd}` (UK / `Europe/London` business day).
- Merges yesterday **live carry-over** only (iOS-aligned).
- GoalLab “Today’s forecasts” still uses `unanimousExports` — unchanged.

## Not in this pass

- Stripe / paywall (no Stripe account yet)
- FCM web push
- Login / blur gate
- IndexedDB track record (next phase after board sign-off)

## Local

1. Copy Firebase vars from `.env.example`.
2. Set `NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED=1`.
3. `npm run dev` → open `/football-predictions` (or thegoallab rewrite) and `/statstrike`.
