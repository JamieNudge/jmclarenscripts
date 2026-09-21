# Portfolio-site

Next.js 14 site for Jamie McLaren’s apps. One Vercel project (`jmclarenscripts`) serves three hosts.

Agents: start at [AGENTS.md](AGENTS.md). Do not follow the old carousel files (`START_HERE.md`, `SETUP.md`, `OVERVIEW.txt`, `CUSTOMIZATION_GUIDE.md`) unless you are editing the portfolio home UI.

## Hosts

| Site | URL | Role |
|------|-----|------|
| GoalLab | [https://thegoallab.net](https://thegoallab.net) | Football forecasting hub (fixtures, research, blog, StatStrike web) |
| Portfolio | [https://jmclarenscripts.vercel.app](https://jmclarenscripts.vercel.app) | App showcase |
| DGC | [https://dgc.jmclarenscripts.vercel.app](https://dgc.jmclarenscripts.vercel.app) | Field of Wealth editor |

Hub routing lives in `middleware.ts`. Canonical GoalLab paths in code are `/football-predictions/...`; thegoallab.net serves the same pages at short URLs (`/`, `/fixtures`, `/blog`).

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the portfolio. GoalLab pages are at `/football-predictions`. Tests: `npm test`. Copy `.env.example` to `.env.local` for Firebase and other secrets — never commit `.env*.local`.

## Docs

- [AGENTS.md](AGENTS.md) — new-chat orientation
- [docs/STATSTRIKE_WEB.md](docs/STATSTRIKE_WEB.md) — StatStrike browser board, blur, supporter pass
- [docs/RTDB_BANDWIDTH.md](docs/RTDB_BANDWIDTH.md) — Firebase RTDB bandwidth, profiler notes
- [POLICY_LINKS.md](POLICY_LINKS.md) — App Store / Play legal URLs
- [BEST_PICKS_SETUP_GUIDE.md](BEST_PICKS_SETUP_GUIDE.md) — Firebase picks and admin
- `.env.example` — env map
