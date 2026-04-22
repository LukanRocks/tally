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
