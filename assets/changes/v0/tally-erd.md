# Tally — Boardgames Manager — Implementation Plan

## Resolved Decisions Summary

- No rank ties; ranks are always unique integers
- Player soft-delete cascades to their `SessionResult` rows only; other players' points unaffected → `SessionResult` gets a `deleted_at` column
- File management decoupled: `POST /games/:id/cover`, `POST /games/:id/attachments`, `POST /players/:id/avatar`
- Express serves `/files/*` as static from `/app/data` subdirs; API returns ready-to-use relative URLs
- Dev: Vite (port 5173) + Express (port 3001) via `concurrently`, Vite proxies `/api`
- Drizzle versioned migrations run at startup
- Dashboard makes 3 separate API calls
- Sort via `?sort=<field>&order=asc|desc`, default `sort=name&order=asc`
- No pagination in v1
- TypeScript throughout

---

## Updated API Surface

### Games

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/games` | List with `?search=`, `?sort=`, `?order=`, `?minPlayers=`, `?maxPlayers=` |
| GET | `/api/v1/games/:id` | Game + attachments + session summary |
| POST | `/api/v1/games` | Create (JSON, no files) |
| PUT | `/api/v1/games/:id` | Update metadata (JSON only) |
| DELETE | `/api/v1/games/:id` | Soft-delete game + cascade sessions, results, attachments |
| POST | `/api/v1/games/:id/cover` | Upload/replace cover image |
| POST | `/api/v1/games/:id/attachments` | Add PDF attachment (label + file) |
| DELETE | `/api/v1/games/:id/attachments/:aid` | Soft-delete attachment |

### Players

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/players` | List all players |
| GET | `/api/v1/players/:id` | Player with aggregated stats |
| POST | `/api/v1/players` | Create player (JSON, name only) |
| PUT | `/api/v1/players/:id` | Update player (JSON) |
| DELETE | `/api/v1/players/:id` | Soft-delete player + cascade their SessionResult rows |
| POST | `/api/v1/players/:id/avatar` | Upload/replace avatar |

### Sessions

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/sessions` | List all sessions |
| GET | `/api/v1/sessions/:id` | Session with results + player names |
| POST | `/api/v1/sessions` | Create session + results (calculates points) |
| DELETE | `/api/v1/sessions/:id` | Soft-delete session |

### Stats

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/stats/leaderboard` | Global points leaderboard |
| GET | `/api/v1/stats/leaderboard/game/:gameId` | Per-game leaderboard |
| GET | `/api/v1/stats/most-played` | Games ranked by session count |
| GET | `/api/v1/stats/head-to-head?player1=:id&player2=:id` | Head-to-head comparison |

---

## Project Structure

```
tally/
├── client/                        # React (Vite)
│   ├── src/
│   │   ├── components/            # shadcn/ui + shared UI
│   │   ├── pages/                 # Route-level components
│   │   ├── hooks/                 # Data-fetching hooks
│   │   └── lib/                   # API client, utils
│   ├── vite.config.ts             # Proxy /api → localhost:3001
│   └── package.json
├── server/                        # Express
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts          # Drizzle table definitions
│   │   │   └── migrations/        # Numbered SQL migration files
│   │   ├── routes/                # One file per resource
│   │   ├── middleware/            # Multer, error handler
│   │   └── index.ts               # App entry, runs migrations at startup
│   └── package.json
├── Dockerfile                     # Multi-stage: build client, run server
├── docker-compose.yml
└── package.json                   # Root: concurrently dev script
```

---

## Data Model

### `games`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT | Required |
| `description` | TEXT | Optional |
| `quick_rules` | TEXT | Optional |
| `min_players` | INTEGER | |
| `max_players` | INTEGER | |
| `purchase_at` | DATE | |
| `price` | DECIMAL | |
| `cover_image_path` | TEXT | Relative URL e.g. `/files/covers/abc.jpg` |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |
| `deleted_at` | DATETIME | NULL if active |

### `game_attachments`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `game_id` | INTEGER FK | References `games` |
| `label` | TEXT | e.g. "Rulebook" |
| `file_path` | TEXT | Relative URL e.g. `/files/attachments/abc.pdf` |
| `created_at` | DATETIME | |
| `deleted_at` | DATETIME | NULL if active |

### `players`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `name` | TEXT | Unique |
| `avatar_path` | TEXT | Relative URL e.g. `/files/avatars/abc.jpg` |
| `created_at` | DATETIME | |
| `deleted_at` | DATETIME | NULL if active |

### `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `game_id` | INTEGER FK | References `games` |
| `played_at` | DATE | |
| `notes` | TEXT | Optional |
| `created_at` | DATETIME | |
| `deleted_at` | DATETIME | NULL if active |

### `session_results`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `session_id` | INTEGER FK | References `sessions` |
| `player_id` | INTEGER FK | References `players` |
| `rank` | INTEGER | 1 = first place, unique per session |
| `points_awarded` | INTEGER | Calculated at log time, immutable |
| `deleted_at` | DATETIME | NULL if active; set on player soft-delete |

---

## Scoring Model

```
points = (N - P) + (P === 1 ? 1 : 0)
```

Where **N** = total players in session, **P** = finish position (1-indexed).

| Place | Example (4 players) | Points |
|---|---|---|
| 1st | (4 - 1) + 1 | **4** |
| 2nd | (4 - 2) + 0 | **2** |
| 3rd | (4 - 3) + 0 | **1** |
| 4th | (4 - 4) + 0 | **0** |

`points_awarded` is stored at write time and never recalculated, ensuring historical scores are unaffected by future formula changes.

---

## Implementation Phases

### Phase 1 — Project Scaffolding & Infrastructure

- Init monorepo with root `package.json` (`dev` script runs client + server via `concurrently`)
- **Server:** Express + TypeScript + `better-sqlite3` + Drizzle ORM + `multer`
- **Client:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- Define all 5 Drizzle schemas with `deleted_at` on all tables
- Generate initial migration, write migration runner that executes pending files at startup
- Mount `/app/data/covers`, `/app/data/attachments`, `/app/data/avatars` as Express static under `/files`
- Multi-stage Dockerfile + `docker-compose.yml`

### Phase 2 — Backend: Games API

- `GET /games` with search, sort (`name`, `date_added`, `most_played`, `price`), order, player count filter
- `GET /games/:id`, `POST /games`, `PUT /games/:id`, `DELETE /games/:id` with cascade soft-delete
- `POST /games/:id/cover` — multer → `/app/data/covers/`
- `POST /games/:id/attachments` — multer → `/app/data/attachments/`
- `DELETE /games/:id/attachments/:aid`

### Phase 3 — Backend: Players & Sessions API

**Players:**
- Full CRUD + `POST /players/:id/avatar`
- Player soft-delete cascades `deleted_at` to all their `session_results` rows

**Sessions:**
- `GET /sessions`, `GET /sessions/:id`, `DELETE /sessions/:id`
- `POST /sessions` — accepts `{ game_id, played_at, notes, results: [{ player_id, rank }] }`, calculates and stores `points_awarded` per result in a single transaction

### Phase 4 — Backend: Stats API

- Global leaderboard: sum `points_awarded` (excluding soft-deleted players and results), wins, win rate
- Per-game leaderboard: same scoped to one game
- Most played: games by non-deleted session count + unique player count
- Head-to-head: shared sessions between two players, win/loss record, points exchanged

### Phase 5 — Frontend: Shell, Routing & Shared Infrastructure

- React Router v6 with routes for all 8 pages
- Persistent sidebar nav: Dashboard, Library, Leaderboard, Players
- Typed API client (`fetch` wrapper)
- Shared data-fetching hooks
- Empty state components with CTAs
- Error boundary + shadcn/ui Toast notifications
- Confirmation dialog component (reused for all destructive actions)
- File upload component with progress indicator

### Phase 6 — Frontend: Game Flows

**Game Library page:**
- Grid layout (cover image, name, player count, session count)
- Search input, sort dropdown, player count filter
- Links to Game Detail

**Game Detail page:**
- All game fields displayed
- Cover image with inline replace button
- PDF attachments list (download + delete); add new PDF inline
- Session history table: date, participants, finish order, points
- Edit, Delete (with confirmation), Add Session buttons

**Add/Edit Game form:**
- Fields: name (required), description, quick rules, min/max players, purchase date, price
- Client-side validation before submit

### Phase 7 — Frontend: Session Logger

- Game selector (pre-populated from Game Detail)
- Date + notes fields
- Player search-and-select (minimum 2 required)
- Drag-and-drop ranking list using `dnd-kit` (1st at top)
- Live points preview updates as players are added/reordered
- Inline new player creation (modal, no navigation away)
- Submit: `POST /sessions` with ranked results array

### Phase 8 — Frontend: Players & Leaderboard

**Player Management page:**
- List: name, avatar, total points, total sessions
- Add Player (name → create → then avatar upload)
- Edit name; replace avatar inline
- Delete with confirmation

**Player Profile page:**
- Name, avatar, total points, total sessions, win count, win rate %
- Per-game breakdown table
- Session history list

**Leaderboard page:**
- Global rankings table (sortable by any column)
- Most Played Games table
- Per-game leaderboard (dropdown selector)
- Head-to-head comparison (two player pickers)

### Phase 9 — Frontend: Dashboard

- 3 API calls on load: `?sort=date_added&order=desc&limit=5`, `/stats/leaderboard?limit=5`, `/stats/most-played?limit=5`
- Top 5 players condensed leaderboard with link to full Leaderboard page
- Recently Added Games row (5 cards)
- Most Played Games row (5 cards)

### Phase 10 — Docker & Production Hardening

- Multi-stage Dockerfile: build `client/dist` → copy into server image → run Express
- `PORT` env var support (default `3000`)
- All data written to `/app/data`
- Migration runner fires before Express starts listening
- README with `docker run` and `docker-compose up` instructions
