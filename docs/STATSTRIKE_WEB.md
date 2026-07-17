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

Stored in RTDB at `statstrikeWebConfig`:

```json
{ "blur": true, "forecastsBlur": true, "updatedAt": "…" }
```

- Toggle on **`/admin/picks`** → **GoalLab blurs (StatStrike + Forecasts)** (same Bearer key as picks).
  - **StatStrike Web blur** — hero + `/statstrike`
  - **Forecasts** (`/fixtures`) — full-day compact board (fixture + goal band); no overflow blur. `forecastsBlur` may still exist in RTDB unused.
- Public site reads via **`GET /api/statstrike/web-config`** (Admin SDK).
- Missing StatStrike blur defaults to **ON**.

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

### Goal Band Cascade (GBC)

Optional metadata on a `/selections/{date}` prediction (same shape as iOS Desktop handoff). Consumer tip stays **Over 2.5** (`level` / `recommendedLevel`); cascade bands (usually O2.5 / O3.5 / O4.5 + optional decimal odds) are shown as a board badge + expand section only. Not a separate tip type. WIN/FT uses the tip band, not the ladder.

Research’s separate `goalBandCascadeSelections/{date}` feed is unrelated to the StatStrike board.

## Not wired yet

- Stripe / paywall (premium UI stubs → App Store)
- FCM web push
- IndexedDB personal track record
- Login / accounts

## Local

1. Copy Firebase vars from `.env.example`.
2. Set `NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED=1`.
3. `npm run dev` → `/statstrike` and `/admin/picks` (turn blur OFF to work interactively).
