<div align="center">
  <img src="./client/public/favicon.svg" alt="Tally Logo" width="100" height="100" />
  <h1>Tally</h1>
  <p><strong>Self-hosted board game collection manager & session tracker</strong></p>
  <p>Log play sessions, rank players, and track your group's leaderboard on your own hardware.</p>
</div>

<div align="center">
  <a href="https://github.com/LukanRocks/tally/actions/workflows/docker-publish.yml">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/LukanRocks/tally/docker-publish.yml" />
  </a>
  <a href="https://github.com/LukanRocks/tally/releases">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/LukanRocks/tally" />
  </a>
  <a href="https://github.com/LukanRocks/tally/stargazers">
    <img alt="GitHub Stars" src="https://img.shields.io/github/stars/LukanRocks/tally?style=flat&logo=github" />
  </a>
  <img alt="Docker" src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat&logo=docker&logoColor=white" />
</div>

---

## Docs

- [About this project](assets/docs/about.md)
- [Scoring model](assets/docs/scoring-model.md)
- [Using BoardGameGeek Data](assets/docs/board-game-geek-data.md)

---

## Features

- 🎲 Manage your board game collection with cover images, rulebooks, player count, price, and more.
- 📋 Log play sessions and rank players with drag-and-drop.
- 🏆 Global and per-game leaderboards with points, wins, and win rate.
- 📊 Head-to-head comparison between any two players.
- 🔎 Filter and sort your library by name, player count, owner, or date added.
- 🔗 Optional BoardGameGeek integration for game name autocomplete.
- ⏱️ Countdown timer, dice roller, and "Who Goes First" randomizer.
- 🌙 Light, dark, and system theme.
- 💾 Self-hosted — all data stays on your machine.
- 🌐 [WIP] English and Portuguese language support.

⚠️ This app is under heavy development.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| Frontend | React + Vite |
| UI | Some shadcn/ui + Tailwind CSS |
| Database | SQLite (default) or PostgreSQL, via Drizzle ORM |
| Container | Docker (single container) |

## Running with Docker

### Simple — one container, no configuration

Tally uses its built-in SQLite database. There is nothing else to run and nothing to configure.

```bash
docker compose up -d
```

Or without Compose:

```bash
docker run -d -p 3000:3000 -v tally_data:/app/data ghcr.io/lukanrocks/tally:latest
```

The app starts on [http://localhost:3000](http://localhost:3000) and creates its schema on first run. The database and every uploaded cover, avatar and rulebook live in the `/app/data` volume — **that volume is your backup.**

### Advanced — your own PostgreSQL server

For anyone already running Postgres who would rather have one database to back up than one more file to remember.

```bash
docker compose -f docker-compose.postgres.yml up -d
```

Edit the connection details in that file before starting it, or copy `.env.example` to `.env` and fill it in. Every variable is documented in [Database configuration](#database-configuration) below.

Keep the data volume mounted on this path too: uploads are files rather than rows, so they live there either way.

Already running Tally on SQLite? Keep the same volume and Tally will notice your existing data and offer to move it — see [Migrating from SQLite to Postgres](#migrating-from-sqlite-to-postgres).

## Database configuration

**By default Tally needs no database configuration at all.** With no database variables set it uses SQLite, storing `tally.db` inside `DATA_DIR` (`/app/data` in the container). One container, one volume, nothing to run alongside it. If that is what you want, skip this section.

If you already run a PostgreSQL server — a homelab with one central database to back up, for instance — Tally can use it instead. Configure it one of two ways, never both.

**A connection string:**

```yaml
environment:
  - DATABASE_URL=postgres://tally:secret@db.lan:5432/tally
```

**Or discrete variables:**

```yaml
environment:
  - DB_HOST=db.lan
  - DB_NAME=tally
  - DB_USER=tally
  - DB_PASSWORD=secret
```

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | — | — | Full connection string. Cannot be combined with the `DB_*` variables below. |
| `DB_HOST` | with the set | — | All four of `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` must be set together. |
| `DB_NAME` | with the set | — | The database must already exist; Tally creates its tables, not the database. |
| `DB_USER` | with the set | — | |
| `DB_PASSWORD` | with the set | — | |
| `DB_PORT` | no | `5432` | |
| `DB_SSL` | no | `disable` | See [Database SSL](#database-ssl). |
| `DATA_DIR` | no | `/app/data` | Uploads always live here, on both databases. |

Uploaded images and rulebooks are files, not rows — they stay in `DATA_DIR` whichever database you use, so **keep the volume mounted even on Postgres**.

### Tally refuses to start on a partial configuration

Setting some of the discrete variables but not all of them is an error, and so is setting `DATABASE_URL` alongside them. Tally will not start.

This is deliberate. The alternative — quietly falling back to SQLite — means a typo in `DB_HOST` lands you in a fresh empty database that looks like data loss, while your real rows sit untouched in a file Tally is no longer reading. Splitting your data across two stores without telling you is far worse than refusing to boot.

When this happens the container **stays up and serves an explanation in the browser**, because a compose typo is something you find by opening the app, not by reading logs. The same explanation is printed to `docker logs`.

Every other kind of failure — the database being unreachable, credentials being rejected — exits instead, so your restart policy can recover once the database comes back.

### Database SSL

`DB_SSL` accepts three modes:

| Mode | Encrypted | Server certificate verified |
|---|---|---|
| `disable` (default) | no | no |
| `require` | yes | no |
| `verify-full` | yes | yes |

Use `disable` when Postgres is on the same host or a private Docker network — the default, and the right one for most self-hosted setups.

Use `verify-full` when the connection crosses a network you do not control. It validates the server's certificate against the system trust store, which means **it will reject a self-signed certificate**. If your Postgres uses one — common in a homelab — `verify-full` fails with a certificate error at startup and `require` is the usable middle ground: the connection is encrypted, but Tally does not confirm which server is on the other end.

## Migrating from SQLite to Postgres

If you have been running on SQLite and later add Postgres configuration, Tally will not lose your data and will not silently ignore it.

On the next start it finds your populated `tally.db` and an empty Postgres database, and instead of serving normally it shows a screen telling you what it found and asking what to do. Nothing is written until you answer — serving normally here would let you enter new sessions into the empty Postgres while your real data sat in the file.

**To migrate**, confirm on that screen. Tally copies every game, player and session across, **preserving their original IDs**, in a single transaction. When it succeeds, the SQLite file is renamed to `tally.db.migrated-<timestamp>` and left in `DATA_DIR` — it is never deleted. If it fails, the transaction rolls back, Postgres is left untouched, the file stays exactly where it was, and the error is shown on screen.

**To go back instead**, remove the database variables from your compose file and restart. Tally returns to the SQLite file, unchanged.

Once an import has completed Tally records it and starts normally from then on. It also starts normally — with no prompt — if the Postgres database already contains data, so pointing a second instance at a shared database does not re-trigger anything.

The archived file is your backup. Keep it until you are confident the migration went well; deleting it is the only irreversible step in this process, and it is one you take yourself.

## Local development

Tally is a pnpm workspace. Corepack picks up the pinned pnpm version from `package.json`, so there is nothing to install globally.

```bash
corepack enable
pnpm install
pnpm dev
```

`pnpm dev` starts both halves in watch mode. The API server runs on port `3001` and the Vite dev server on port `5173`, which proxies `/api` and `/files` to the backend.

### Tests

```bash
pnpm -C backend test
```

That is the SQLite pass. The suite also has to pass against Postgres, which needs a database running:

```bash
docker compose -f docker-compose.test.yml up -d --wait
pnpm -C backend test:all
```

`test:all` runs both dialects in sequence. CI runs the same matrix on every pull request, plus the frontend suite:

```bash
pnpm -C web test
```

### Changing the database schema

Every schema change has to be written twice — once per dialect — and the compiler will not catch a missed one. [docs/adding-a-migration.md](docs/adding-a-migration.md) is the checklist.

---

<div align="center">
  
**⭐ If you find Tally useful, please consider giving it a star!**

[![Stars](https://img.shields.io/github/stars/LukanRocks/tally?style=social&logo=github)](https://github.com/LukanRocks/tally/stargazers)

Made with 💛 for the board game and homelabbing community

</div>
