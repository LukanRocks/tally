# Product Requirements Document
## Tally — Boardgames Manager — Self-Hosted Web Application

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 2026-04-18

---

## 1. Overview

### 1.1 Product Summary

Tally is a lightweight, self-hosted web application for personal board game library management and session tracking. It enables users to catalogue their collection, log play sessions with friends, and track a dynamic leaderboard based on a points-rewarding ranking system.

The application is designed to run in a single Docker container with no external dependencies, using SQLite as its database. It requires no authentication and is intended for personal or small-group use on a private network.

### 1.2 Goals

- Provide a clean, fast interface for managing a personal board game library.
- Allow structured logging of play sessions including participants and rankings.
- Aggregate player performance into a meaningful leaderboard using a points-based model.
- Remain easy to self-host with minimal setup overhead.

### 1.3 Non-Goals

- Multi-user authentication or access control.
- Real-time collaboration or multiplayer sync.
- Integration with external platforms (BGG integration is a future nice-to-have, not in v1).
- Mobile native apps.

---

## 2. Architecture

### 2.1 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (LTS) |
| Backend Framework | Express.js |
| Frontend Framework | React (Vite build tool) |
| UI Component Library | shadcn/ui |
| Styling | Tailwind CSS |
| Database | SQLite via `better-sqlite3` |
| File Storage | Local filesystem (within container volume) |
| Containerisation | Docker (single container) |
| ORM / Query Builder | Drizzle ORM |

### 2.2 Deployment Model

The application ships as a single Docker image. Users run it with a single `docker run` command, mounting a local volume for persistent data (database file + uploaded assets).

```bash
docker run -d \
  -p 3000:3000 \
  -v ./tally-data:/app/data \
  tally:latest
```

All user-uploaded files (images, PDFs) are stored on the mounted volume alongside the SQLite database file, ensuring data persists across container restarts and upgrades.

### 2.3 High-Level Architecture

```
┌─────────────────────────────────────────────┐
│                Docker Container             │
│                                             │
│  ┌──────────┐     ┌──────────────────────┐  │
│  │  React   │────▶│    Express.js API    │  │
│  │ Frontend │◀────│    (REST endpoints)  │  │
│  └──────────┘     └──────────┬───────────┘  │
│                              │              │
│                   ┌──────────▼───────────┐  │
│                   │  SQLite + /data vol  │  │
│                   │  (db + file uploads) │  │
│                   └──────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 3. Data Models

### 3.1 Game

Represents a board game in the user's collection.

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT | Required |
| `description` | TEXT | Optional long-form description |
| `quick_rules` | TEXT | Optional rules summary |
| `min_players` | INTEGER | Minimum supported players |
| `max_players` | INTEGER | Maximum supported players |
| `purchase_at` | DATE | When the game was purchased |
| `price` | DECIMAL | Purchase price |
| `cover_image_path` | TEXT | Path to stored image file |
| `created_at` | DATETIME | Record creation timestamp |
| `updated_at` | DATETIME | Record update timestamp |
| `deleted_at` | DATETIME | Soft-delete timestamp; NULL if active |

**Relationships:** One Game has many `GameAttachment` records (see 3.2), linked via `game_id`. Deleting a Game cascades to its attachments.

### 3.2 GameAttachment

PDF files (manuals, rulebooks) linked to a game.

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `game_id` | INTEGER FK | References Game |
| `label` | TEXT | e.g. "Rulebook", "Expansion 1 Rules" |
| `file_path` | TEXT | Path to stored PDF |
| `created_at` | DATETIME | Upload timestamp |
| `deleted_at` | DATETIME | Soft-delete timestamp; NULL if active |

### 3.3 Player

An individual who participates in game sessions.

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT | Display name (unique) |
| `avatar_path` | TEXT | Optional profile image |
| `created_at` | DATETIME | Record creation timestamp |
| `deleted_at` | DATETIME | Soft-delete timestamp; NULL if active |

### 3.4 Session

A single play session of a board game.

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `game_id` | INTEGER FK | References Game |
| `played_at` | DATE | Date the game was played |
| `notes` | TEXT | Optional session notes |
| `created_at` | DATETIME | Record creation timestamp |
| `deleted_at` | DATETIME | Soft-delete timestamp; NULL if active |

### 3.5 SessionResult

Stores each player's ranking within a session.

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `session_id` | INTEGER FK | References Session |
| `player_id` | INTEGER FK | References Player |
| `rank` | INTEGER | 1 = first place, 2 = second, etc. |
| `points_awarded` | INTEGER | Calculated at log time (see scoring model) |

---

## 4. Scoring Model

Points are awarded per session based on finish position and total player count. The formula is designed to reward winning while still giving losers meaningful progress.

### 4.1 Formula

For a session with **N** total players, a player finishing in position **P** (1-indexed, 1 = winner) receives:

```
points = (N - P) + bonus

where bonus = 1 if P == 1, else 0
```

### 4.2 Example — 4-Player Game

| Place | Calculation | Points |
|---|---|---|
| 1st | (4 - 1) + 1 win bonus | **4** |
| 2nd | (4 - 2) + 0 | **2** |
| 3rd | (4 - 3) + 0 | **1** |
| 4th | (4 - 4) + 0 | **0** |

### 4.3 Rationale

- The winner always earns more than any other single player.
- Last place always earns 0, incentivising competitive play.
- Playing in larger games yields higher potential points, rewarding participation.
- `points_awarded` is stored on `SessionResult` at log time so historical scores are unaffected by future formula changes.

---

## 5. Features & Requirements

### 5.1 Dashboard (Home Page)

The default landing page provides a high-level summary of activity.

**Requirements:**

- Display a **condensed leaderboard** showing the top 5 players by total points, with name and points visible at a glance. Includes a link to the full leaderboard page.
- Display a **Recently Added Games** row showing the last 5 games added to the library, with cover image and name.
- Display a **Most Played Games** row showing the top 5 games by total session count.
- Each game card links to its detail page.
- Dashboard data refreshes on page load (no real-time polling required).

---

### 5.2 Game Library

A browsable catalogue of all board games in the collection.

**Requirements:**

- Display games in a **grid layout** with cover image, name, player count range, and session count.
- Support **text search** by game name.
- Support **filtering** by minimum/maximum player count.
- Support **sorting** by: name (A–Z), date added (newest first), most played, price.
- Each game card links to the Game Detail page.

---

### 5.3 Game Detail Page

Full information view for a single game.

**Requirements:**

- Display all game fields: name, description, quick rules, player count, acquisition date, price, cover image.
- Display a list of attached PDFs with download links.
- Display a **session history table** for this game: date played, participants, finish order, points awarded per player.
- Include an **Add Session** button scoped to this game.
- Include **Edit** and **Delete** actions for the game entry. Deletion requires confirmation and soft-deletes the game and its associated sessions and attachments (data is retained but hidden from all views).

---

### 5.4 Add / Edit Game Form

Form for creating or updating a game entry.

**Requirements:**

- Fields: name (required), description, quick rules, min players, max players, purchase date, price, cover image upload, PDF attachment uploads (multiple allowed, each with a label field).
- Image upload: accepts JPG, PNG, WebP. Stored server-side under the mounted data volume.
- PDF upload: accepts PDF only. Multiple files can be attached. Each attachment has a user-defined label.
- On edit, existing attachments are listed with individual delete options.
- Form validates required fields and file types client-side before submission.

---

### 5.5 Session Logger

Form for recording a play session against a specific game.

**Requirements:**

- Fields: game (pre-selected if launched from Game Detail), date played, optional notes.
- **Player selection:** Search and select from existing players. Minimum 2 players required.
- **Ranking input:** Players are ordered via a drag-and-drop list (1st at top, last at bottom). Rank determines points calculation.
- Points awarded per player are previewed live as players are added and reordered.
- On submission, `SessionResult` rows are created and `points_awarded` is calculated and stored.
- Option to **create a new player inline** from the session logger without navigating away.

---

### 5.6 Player Management

A dedicated section for managing the player roster.

**Requirements:**

- List all players with name, optional avatar, total points, and total sessions played.
- **Add Player** form: name (required, must be unique), optional avatar image upload.
- **Edit Player:** name and avatar.
- **Delete Player:** soft-prompt confirmation. Sessions where the player participated are retained but the player name is shown as "Deleted Player".
- Each player entry links to their Player Profile page.

---

### 5.7 Player Profile Page

Detailed stats view for an individual player.

**Requirements:**

- Display player name, avatar, total points, total sessions, and win count (times finishing 1st).
- Display **win rate** as a percentage (wins / sessions played).
- Display a **per-game breakdown table:** game name, sessions played, wins, total points earned in that game.
- Display a **session history** list: date, game played, finish position, points earned.

---

### 5.8 Leaderboard Page

Full global rankings view across all players and games.

**Requirements:**

- **Global Rankings table:** Rank, player name, avatar, total points, total wins, win rate %, total sessions. Sortable by any column.
- **Most Played Games table:** Game name, cover image, total sessions, unique players who have played it.
- **Per-Game Leaderboard:** A dropdown or tab selector to filter rankings to a specific game, showing each player's stats within that game only.
- **Head-to-Head Comparison:** Select any two players to see their direct record against each other — sessions they've shared, win/loss count between them, points exchanged.

---

---

## 6. API Design (REST)

All endpoints are prefixed with `/api/v1`.

### Games

| Method | Path | Description |
|---|---|---|
| GET | `/games` | List all games (supports `?search=`, `?sort=`, `?minPlayers=`, `?maxPlayers=`) |
| GET | `/games/:id` | Get single game with attachments and session summary |
| POST | `/games` | Create game (multipart form for image + PDFs) |
| PUT | `/games/:id` | Update game |
| DELETE | `/games/:id` | Soft-delete game and cascade soft-delete associated sessions and attachments |
| DELETE | `/games/:id/attachments/:attachmentId` | Delete a specific attachment |

### Sessions

| Method | Path | Description |
|---|---|---|
| GET | `/sessions` | List all sessions |
| GET | `/sessions/:id` | Get session with results |
| POST | `/sessions` | Create session + results |
| DELETE | `/sessions/:id` | Delete session and results |

### Players

| Method | Path | Description |
|---|---|---|
| GET | `/players` | List all players |
| GET | `/players/:id` | Get player with stats |
| POST | `/players` | Create player |
| PUT | `/players/:id` | Update player |
| DELETE | `/players/:id` | Soft-delete player |

### Stats

| Method | Path | Description |
|---|---|---|
| GET | `/stats/leaderboard` | Global points leaderboard |
| GET | `/stats/leaderboard/game/:gameId` | Per-game leaderboard |
| GET | `/stats/head-to-head?player1=:id&player2=:id` | Head-to-head comparison |
| GET | `/stats/most-played` | Games ranked by session count |

---

## 7. UI & UX Requirements

- The UI should be fully responsive and usable on tablet and desktop screen sizes. Mobile is a best-effort secondary target.
- Navigation: persistent sidebar or top nav with links to Dashboard, Library, Leaderboard, and Players.
- All destructive actions (delete game, delete player, delete session) require a confirmation dialog before execution.
- File uploads show a progress indicator.
- Empty states (no games, no sessions, no players) must include a clear call-to-action.
- Error states from the API must be surfaced to the user with a readable message, not a blank screen.

---

## 8. Docker & Deployment Requirements

- The application must be distributable as a single Docker image published to Docker Hub or GitHub Container Registry.
- The image must expose a configurable port (default: `3000`) via the `PORT` environment variable.
- All persistent data (SQLite file and uploaded files) must be written to `/app/data` inside the container so a single volume mount covers everything.
- The container must start with a single `docker run` command with no required environment variables beyond optional port configuration.
- On first run, the application must automatically initialise the SQLite schema if the database file does not exist.
- A `docker-compose.yml` example file must be included in the repository for convenience.

```yaml
# docker-compose.yml (example)
version: "3.8"
services:
  tally:
    image: tally:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time | < 1s for dashboard on local network |
| Session log submission | < 500ms round-trip |
| Image upload size limit | 5 MB per file |
| PDF upload size limit | 20 MB per file |
| SQLite WAL mode | Enabled by default for concurrent reads |
| Node.js version | LTS (20+) |
| Browser support | Last 2 versions of Chrome, Firefox, Safari, Edge |

---

## 10. Out of Scope (v1)

- User accounts or authentication of any kind.
- Multi-instance / networked database support.
- Email or push notifications.
- Export to CSV or PDF reports (future consideration).
- BGG auto-import (future consideration).
- Mobile native application.
- Dark mode (future nice-to-have).

---

## 11. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Should ties in rank be supported (two players sharing 2nd place)? | Product | Open |
| 2 | Should sessions support more than one game per sitting, or always one game per session? | Product | Assumed one game per session |
| 3 | What happens to session history if a game is deleted — cascade delete or orphan? | Engineering | **Resolved:** cascade soft-delete |
| 4 | Should the player deletion be a true soft-delete (hidden) or hard-delete with name replacement? | Product | **Resolved:** soft-delete; player is hidden from all views but session history is retained |

---

*End of Document*
