# Leonida Trophy Guide — GTA 6 Trophy Guide & Tracker

[![GTA 6 Trophy Guide bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/slow-respon/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/slow-respon/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun](https://make.fun) bounty `gta6-trophy-guide-01`. No network, no account, no ads — just the list, the guides, and your progress.

## What it does

- **Tracker** — all 55 trophies with their official name, description and grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze). Tick one off and it saves instantly in your browser (localStorage). Progress bar, grade counts and a ~200-hour Platinum estimate up top.
- **Filters** — by kind (story, missable, collectibles, activities, platinum), by grade, by earned/remaining, plus text search. Counts shown per filter.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them. Saved with your progress.
- **Export / import** — download your progress as JSON and read it back later (validated, with confirmation before overwriting). Reset progress, also with confirmation.
- **Roadmap to the Platinum** — three stages in order: story (60–80 h), 100% Completion cleanup (~100 h), then Strangers & Freaks and the leftovers (10–20 h).
- **The one missable trophy** — Positive Mental Attitude is flagged at the top of the page and on its card: the balcony meditation with Lucia on the morning after the mission 'Down to Earth', before leaving Chapter 1, cannot be repeated (no mission replay). Every other trophy can be earned in free roam after the story.
- **Cited guidance** — every trophy's guide is written in our own words and names its sources beside it: PushSquare, KeenGamer, Mobalytics and Endgame Tools (citing PowerPyx), plus Exophase / PSNProfiles for the official list. One grade note: the official list grades "Maximum Withdrawal" Silver, matching KeenGamer, Mobalytics and Endgame Tools; PushSquare lists it Bronze and the official list overrules that.

## Run it

```sh
node serve.ts          # serves app/ on http://localhost:8080
# or: node serve.ts --port 8081
```

Open `http://localhost:8080` in desktop Chrome. It works with the network off: every file it loads lives under `app/`, and it makes no network request at run time.

## Deterministic screenshots

The app supports `?shot=checklist|roadmap|detail|spoiler`, which sets up a view (checks a few trophies, opens a guide, turns the spoiler setting on) and sets `window.__shotReady = true` once painted. `shots.json` lists the four shots in `screenshots/`.

## Hand it in (make.fun)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged from the kit).

## Files

- `app/index.html` — page skeleton: header with progress, missable banner, roadmap section, filters, trophy list.
- `app/app.js` — the tracker: rendering, filters, spoiler setting, save/export/import/reset, roadmap rendering, shot mode.
- `app/style.css` — the look: dark theme, trophy-gold accent, no external assets.
- `app/data/trophies.json` — the 55 official trophies with guides, steps, kinds, counts, roadmap stages and sources.
- `main.ts` — the hand-in program (Node 22, standard library only).
- `serve.ts` — a tiny static server for local development.
- `screenshots/` — four real renders of the app in a browser.
- `LICENSE` — MIT.

## Notes

- Unofficial fan guide. Grand Theft Auto and GTA are trademarks of Take-Two Interactive; this guide is not affiliated with or endorsed by Rockstar Games. No Rockstar logo, official artwork, box art or game screenshots are used anywhere here.
- Trophy names, descriptions and grades are the official PlayStation 5 list as published. Guide text is original to this entry.
