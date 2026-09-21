# Portfolio-site

One Next.js 14 app (Vercel project **jmclarenscripts**). Two public faces, plus a DGC subdomain.

Do not restate architecture in chat. Read this file, then wait for the user’s task. Details live in [README.md](README.md) and the pointers below.

## Hosts

| Face | Host | What `/` is |
|------|------|-------------|
| GoalLab hub | `thegoallab.net`, `www.thegoallab.net` | Rewrites to `/football-predictions` (short public URLs) |
| Portfolio | `jmclarenscripts.vercel.app` | Jamie’s apps list |
| DGC | `dgc.jmclarenscripts.vercel.app` | Field of Wealth editor |

Football paths on the portfolio host 308 to thegoallab.net. Unmatched paths on the hub 308 back to the portfolio. Routing is [middleware.ts](middleware.ts) + [lib/hub-football-routes.ts](lib/hub-football-routes.ts).

## Do not treat as a carousel starter

[START_HERE.md](START_HERE.md), [SETUP.md](SETUP.md), [OVERVIEW.txt](OVERVIEW.txt), and [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md) describe the original 3D carousel template. Ignore them unless the user is editing the portfolio home UI (`app/page.tsx`).

## Where to read next

| Area | Path |
|------|------|
| Portfolio app cards | [lib/apps-data.ts](lib/apps-data.ts) |
| Live GoalLab UI | [components/goallab/v2/](components/goallab/v2/) |
| StatStrike in the browser | [docs/STATSTRIKE_WEB.md](docs/STATSTRIKE_WEB.md) |
| RTDB bandwidth | [docs/RTDB_BANDWIDTH.md](docs/RTDB_BANDWIDTH.md) |
| Store / legal URLs | [POLICY_LINKS.md](POLICY_LINKS.md) |
| Env and Firebase | [.env.example](.env.example) |
| Picks / admin setup | [BEST_PICKS_SETUP_GUIDE.md](BEST_PICKS_SETUP_GUIDE.md) |

Canonical GoalLab routes in code are `/football-predictions/...`. On the hub those appear as `/`, `/fixtures`, `/blog`, `/about`, and so on.

## Gotchas

- StatStrike supporter-pass cookies must stay on thegoallab.net (not `*.vercel.app`). Keep `/admin` and pass claim on the hub host.
- `NEXT_PUBLIC_STATSTRIKE_WEB_ENABLED` is a deploy-time kill switch. Coming Soon blur is live on `/admin/picks` (RTDB `statstrikeWebConfig`), not an env flag.
- Business dates are UK / `Europe/London`.
- Do not add new browser `get()` / `onValue` on fat RTDB nodes (`selections`, `unanimousExports`, `blogPosts`). Public data goes through CDN-cached API routes. See [docs/RTDB_BANDWIDTH.md](docs/RTDB_BANDWIDTH.md).

## New chat

1. Read this file.
2. Do not dump a recap unless asked.
3. Prefer the smallest diff. Do not edit upload pipelines, Firebase rules, or host routing unless the user asked in this conversation.
