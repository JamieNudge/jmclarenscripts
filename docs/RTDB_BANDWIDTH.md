# RTDB bandwidth

Firebase Realtime Database **outgoing bandwidth** is the bill (not Cloud Functions). Browsers should not read RTDB directly — public data belongs behind CDN-cached API routes. Do not add new client `get()` / `onValue` on fat nodes (`selections`, `unanimousExports`, `blogPosts`) without a reason that cannot be an API.

Website cuts shipped 2026-09-21 live in this repo. Native apps and the Mac uploader are **not** changed here. Measure on a high-fixture weekend before deciding what to do next.

## What the website changed

- Homepage owns one `useStatStrikeBoard()` and passes it into the hero (no second fat fetch).
- Board fetch is skipped when `NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED` is off.
- `GET /api/statstrike/homepage-metrics` persists a snapshot at `footballPredictions/homepageMetrics`. Today’s figures refresh from **one** day-node every 5 minutes; the 30-day aggregate every 60 minutes. Response: `s-maxage=300`. The homepage polls that API every 5 minutes (no cache-buster).
- `GET /api/statstrike/web-config` is CDN-cached (`s-maxage=60`). The client no longer holds an `onValue` on that node; it polls the API every 5 minutes.
- Blog list/category hooks use `/api/blog/previews` and `/api/blog/categories` (summaries only). The Insights index was already server-fetched.

## Remaining direct client reads (later)

- [`GoalLabV2FixturesList.tsx`](../components/goallab/v2/GoalLabV2FixturesList.tsx) — `unanimousExports/{date}`
- [`BestPicksResearchAlgorithmPanel.tsx`](../components/best-picks/BestPicksResearchAlgorithmPanel.tsx) — `dailyConsensusSelections` + `goalBandCascadeSelections`
- [`GoalLabV2FixtureDetail.tsx`](../components/goallab/v2/GoalLabV2FixtureDetail.tsx) / [`FixtureDetailView.tsx`](../components/fixtures/FixtureDetailView.tsx)
- [`useStatStrikeHistoryWindow.ts`](../hooks/useStatStrikeHistoryWindow.ts) — 7 days × (`selections` + `bttsSelections`) on the Best Performing tab
- Homepage `onValue` on `unanimousExports` when StatStrike web is **off**

Per-day metric summaries (`footballPredictions/metricsDaily/{date}`) would make the 30-day aggregate cheap without a fat-node scan.

## Measure later (high-fixture weekend)

Capture Saturday or Sunday match hours, roughly 12:00–19:00 UK. Verify flags with `firebase database:profile --help`.

```bash
npm i -g firebase-tools
firebase login
firebase use stat-strike-firebase

# Run during peak, stop with Ctrl+C (or use -d <seconds>)
firebase database:profile -o ~/Desktop/rtdb-profile-$(date +%F).json
```

What to read:

- **Outgoing bandwidth grouped by path.** Is `/selections/{date}` dominant?
- **Operation type is the tell.** `listener-broadcast` bytes are fan-out to subscribed clients (native apps). REST / Admin one-shot gets are the website.
- If `listener-broadcast` dominates, phone apps are the bill and the website pass will not move it much.
- If REST/Admin reads on `/selections/*` dominate, the metrics endpoint was the driver.

Also check Firebase console → Realtime Database → Usage: bandwidth per day and peak concurrent connections.

## Follow-ups (not in this repo yet)

### Scoreboard sidecar (highest leverage if listeners dominate)

Score refresh in the Mac uploader reuses `uploadDailySelection`, which `setValue`s the **entire** `selections/{date}` node (and often yesterday too). Every iOS/Android `.observe(.value)` then re-downloads that payload.

A `scoreboard/{date}` node of `{ fixtureId, status, elapsed, homeScore, awayScore }` is a few KB. Apps observe that for live churn and fetch the day’s data once. This is smaller work than `selectionsLite` and is the right first native/Mac change if the profiler shows `listener-broadcast`.

### `selectionsLite/{date}`

The fat node’s `stats[]` carries match arrays and a duplicated `Fixture` per row. The website uses eleven scalars (`WebFixtureStatsSummary` already exists on the Mac). A lite mirror without those arrays would cut per-read cost for the website **and** both phone apps.

Shape:

```
selectionsLite/{date}:
  date, lastUpdated, version
  fixtures[]:    id, homeTeam, awayTeam, league, country, kickoffUtc, status, homeScore, awayScore
  predictions[]: fixtureId, level, confidence, recommendedLevel?, goalBandCascade?
  stats[]?:      fixture: { id }, plus the eleven WebFixtureStatsSummary scalars
```

Work: Mac `toLite()` + `uploadSelectionLite` from **every** path that currently calls `uploadDailySelection` (including score refresh), website path switch with fat-node fallback, iOS listener on lite (full fetch only for Analysis), Android the same. Drift if any write path is missed.

Do this after the profiler, not before.

### Native apps today

- iOS `observeSelection` in StatStrike canonical `FirebaseService.swift` listens to whole `/selections/{date}` including stats. It already has a `MinimalSelection` fallback if stats are missing.
- Android `SelectionRepository.observeSelection` uses `addValueEventListener` on the same node.

### Abuse ceiling

RTDB paths are publicly readable, so scrapers can put bandwidth on the bill. **App Check** is the eventual answer; it needs native app changes.

## Suggested RTDB rules for the new snapshot

Admin SDK bypasses rules. Optional public read is unused (the site reads via Admin):

```json
"footballPredictions": {
  "homepageMetrics": {
    ".read": false,
    ".write": false
  }
}
```
