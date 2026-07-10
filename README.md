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

## Docs


## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js |
| Frontend | React + Vite |
| UI | Some shadcn/ui + Tailwind CSS |
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

---

<div align="center">
  
**⭐ If you find Tally useful, please consider giving it a star!**

[![Stars](https://img.shields.io/github/stars/LukanRocks/tally?style=social&logo=github)](https://github.com/LukanRocks/tally/stargazers)

Made with 💛 for the board game and homelabbing community

</div>
