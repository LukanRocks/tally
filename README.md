# Tally

A lightweight, self-hosted web application for managing your board game collection and tracking play sessions with friends.

## What it does

- **Game library** — catalogue your collection with cover images, rulebook PDFs, player count, and purchase info
- **Session logging** — record play sessions with drag-and-drop ranking and live points preview
- **Leaderboard** — global and per-game rankings, win rates, and head-to-head comparisons
- **Player profiles** — per-player stats including session history, win count, and per-game breakdown

## Scoring model

Points are awarded based on how many players play and how many you lost to. This way competition is kept alive but also make participation meaningful:

```
points = N - (P - 1) + (P === 1 ? 1 : 0)
```

Where **N** = total players in the session, **P** = finish position (1 = winner).

The formula breaks down into three parts:

- **Base:** `N - (P - 1)` — you earn points based on the total number of players but you loose points for each player that beat you.
- **Win bonus:** +1 extra point for finishing 1st, so the winner always outscores second place by more than one.
- **Minimum 2 players:** sessions with fewer than 2 participants award 0 points to everyone.

The net effect is that **last place always scores 1 point** (participation reward) and **first place always scores extra**.

### Example — 4-player game

| Place | Calculation | Points |
|---|---|---|
| 1st | 4 − 0 + 1 (win bonus) | **5** |
| 2nd | 4 − 1 | **3** |
| 3rd | 4 − 2 | **2** |
| 4th | 4 − 3 | **1** |

### Design rationale

The original idea was a pure "players you beat" model, but that left last place at 0 every time. Over a long series of play dates, a player who shows up consistently but rarely wins would fall far behind someone who appeared once and won — which discourages regular participation. The +1 floor ensures that just showing up is always worth something (having fun is more important), while the win bonus preserves a meaningful gap at the top.

Scores are stored at log time, so historical results are unaffected by any future formula changes.

## BoardGameGeek data (optional)

Tally supports importing the [BGG board game rankings CSV](https://boardgamegeek.com/data_dumps/bg_ranks) to power name autocomplete when adding games to your library. This is entirely optional — the app works without it, and any game not in the dataset can always be entered manually.

**To set it up:**

1. Download the CSV from [boardgamegeek.com/data_dumps/bg_ranks](https://boardgamegeek.com/data_dumps/bg_ranks) (free account required).
2. Go to **Settings → BGG Data** in the app and upload the file.
3. The dataset is imported locally — no BGG API calls are ever made at runtime.

**What it does:**

- When adding or editing a game, typing in the name field shows matching suggestions from the BGG catalog.
- Selecting a suggestion fills in the game name and publication year; all other data (cover image, description, player count, etc.) still needs to be added manually.
- The data is stored in your local SQLite database. You can delete it or re-import an updated CSV at any time from Settings.

**A note on the BGG dataset:** The CSV data is provided by BoardGameGeek under their [Terms of Use](https://boardgamegeek.com/terms) and [XML API & Data Terms of Use](https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use#). Use is permitted for non-commercial purposes. Tally does not modify or redistribute the data — it is imported and stored locally by the user.

## About this project

Tally is being built entirely with the aid of AI (Claude) as a deliberate learning exercise. The goal is to observe and understand the qualities, patterns, and failure modes of AI-assisted development on a relatively low-risk personal project — where experimenting freely is safe and the feedback loop is fast.

The development follows a structured process designed to keep AI-generated code intentional and maintainable:

1. **PRD** — a new context window collaborates with the developer to write a Product Requirements Document, stored in `changes/vN/`.
2. **ERD** — a separate context reads the PRD and produces an Engineering Requirements Document for the same version.
3. **Implementation** — another agent reads both documents and implements the feature against those definitions.

Each major change gets its own version folder under `changes/`, creating a clear record of what was planned and why. The separation between planning contexts is intentional: it forces decisions to be made explicitly rather than letting the implementation agent run wild and make choices that are bug-prone or hard to maintain.

The code isn't perfect — but every part of it was written with deliberate intent.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| Frontend | React + Vite |
| UI | shadcn/ui + Tailwind CSS |
| Database | SQLite via Drizzle ORM |
| Container | Docker (single container) |

## Running with Docker

```bash
docker run -d \
  -p 3000:3000 \
  -v ./tally-data:/app/data \
  tally:latest
```

Or with Docker Compose:

```bash
docker compose up -d
```

The app starts on [http://localhost:3000](http://localhost:3000). On first run, the database schema is initialised automatically. All data (SQLite file + uploaded files) is persisted in the mounted `/app/data` volume.

## Local development

```bash
# Install all dependencies
npm run install:all

# Start both server and client in watch mode
npm run dev
```

The API server runs on port `3001` and the Vite dev server on port `5173` by default.

## Project structure

```
tally/
├── server/          # Express.js API + Drizzle ORM
├── client/          # React + Vite frontend
├── docker-compose.yml
└── Dockerfile
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port the server listens on |

No other environment variables are required.
