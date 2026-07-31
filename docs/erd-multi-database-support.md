# ERD — Multi-Database Support (SQLite default, Postgres opt-in)

**Status:** Draft
**Target release:** Release 1 (the first official release train)
**Author:** Lukan Vanderlinde
**Last updated:** 2026-07-30

---

## 1. Summary

Tally currently persists everything to a single SQLite file. This ERD adds opt-in Postgres
support driven purely by environment variables, plus a guarded one-time import path for users
who already have SQLite data and later point the container at Postgres.

The product constraint that drives every decision below: **the zero-config, single-container
default must not regress.** A user who runs `docker compose up` with no database env vars gets
SQLite and never learns Postgres exists. Advanced users add `DATABASE_URL` and get Postgres.
Handholding by default, power on request.

### Goals

- No database env vars → SQLite at `DATA_DIR`, exactly as today. Single container, no sidecar.
- `DATABASE_URL` (or a complete discrete set) → Postgres, same feature set, same API contract.
- Existing SQLite data + newly-added Postgres config → the app detects it, blocks writes, and
  asks the user whether to import. Never migrates silently.
- Misconfiguration fails loudly at boot rather than silently falling back to SQLite.

### Non-goals

- Migrating **away** from Postgres back to SQLite. One direction only.
- Moving uploaded files into the database. Covers, attachments, and avatars stay on the local
  volume in both modes (see §12, Risk 4).
- MySQL/MariaDB or any third dialect.
- Multi-tenancy, connection pooling beyond driver defaults, or read replicas.

---

## 2. Decision record

### Chosen: Option A — dual dialect, one codebase

Two Drizzle schema files and two migration sets; the driver is resolved at boot from env.

### Rejected: Option B — PGlite as the default

PGlite (embedded WASM Postgres) would collapse this to one dialect, one schema, one migration
set. Rejected on data-safety maturity, not on repo health:

- Still `0.5.4` after ~2.5 years of active, funded development — the maintainers have not
  declared API stability.
- [#1065](https://github.com/electric-sql/pglite/issues/1065) (open, unanswered): `transaction()`
  skips `syncToFs()` on commit, so `await db.transaction(...)` can resolve before data reaches
  disk. Container stop, OOM kill, or host reboot loses committed writes — precisely our
  deployment model.
- [#1046](https://github.com/electric-sql/pglite/issues/1046): concurrent extended-protocol
  batches can interleave prepared statements, yielding silently wrong rows. Drizzle uses
  prepared statements.
- [#1068](https://github.com/electric-sql/pglite/issues/1068): multi-row INSERT under
  DELETE+INSERT churn hangs — the exact shape of our BGG CSV import.

Revisit at 1.0, specifically once #1065 is closed. **Do** adopt PGlite for test fixtures
regardless (see §11) — that is its genuine sweet spot.

### Rejected: Option C — Postgres sidecar in the default compose file

One dialect, battle-tested storage, no dual-dialect tax. Rejected because it makes the default
path a two-container deployment. That is a real regression against the "dumb-proof, single
container, spin it up and go" product property, which is a deliberate differentiator.

### Accepted cost of Option A

Every future schema change needs two migration files and must be tested against both dialects.
If that tax becomes painful after a few features, Option C is a strictly cheaper escape hatch
than it is today, because the Postgres path will already exist and be exercised.

---

## 3. Current state

| Area | State |
|---|---|
| Driver | `better-sqlite3` 12.11.1, synchronous |
| ORM | Drizzle 0.45.2, `sqliteTable` schema |
| Migrations | 5 hand-written `.sql` files, raw SQLite DDL, applied by a bespoke runner in `db/index.ts` |
| Routes | 5 files, ~950 lines |
| Sync terminal calls | **52** `.get()` / `.all()` / `.run()` across routes — SQLite-dialect-only Drizzle methods |
| Raw driver usage | **17** lines of `sqlite.*` in 3 transaction blocks (`settings.ts`, `bgg.ts`, `sessions.ts`) |
| Tests | **None.** No test runner in either package. |

The refactor is tractable — ~97% of data access already goes through Drizzle, and query
*construction* (`eq`, `and`, `isNull`, `select().from()`) is already dialect-portable. What is
not portable is the terminal execution method and the raw transaction blocks.

---

## 4. Architecture

### 4.1 File layout

```
backend/src/db/
  config.ts            env → DatabaseConfig, validation, redacted logging
  index.ts             resolves driver + schema, exports `db`, `schema`, `DATA_DIR`
  schema.sqlite.ts     existing sqliteTable definitions (moved from schema.ts)
  schema.pg.ts         pgTable equivalents, identical column names
  schema.ts            re-exports resolved schema + canonical row types
  migrations/
    sqlite/            existing 0001–0005 + future
    postgres/          hand-authored equivalents
  search.ts            searchLike() — dialect-aware case-insensitive match
  transaction.ts       withTransaction() — see §5.1
  import-sqlite.ts     one-time SQLite → Postgres importer
  state.ts             boot state machine, _tally_meta accessors
```

As built, the migration runner stayed in `index.ts` rather than moving to `migrate/runner.ts`;
it is ~60 lines and splitting it bought nothing.

### 4.2 Config resolution

```yaml
# docker-compose.yml — advanced users only
environment:
  - DATABASE_URL=postgres://tally:pw@postgres:5432/tally
  # or discrete:
  # - DB_HOST=postgres
  # - DB_PORT=5432
  # - DB_NAME=tally
  # - DB_USER=tally
  # - DB_PASSWORD=...
  # - DB_SSL=require        # disable | require | verify-full
```

Resolution rules, in order:

1. `DATABASE_URL` set and parseable → Postgres.
2. All of `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` set → Postgres (`DB_PORT` defaults
   5432, `DB_SSL` defaults `disable`).
3. **Some but not all** discrete vars set → **fatal error, exit non-zero.** A typo'd `DB_HOST`
   silently falling back to SQLite is the worst failure mode available; it would let a user
   write into a fresh empty SQLite file while believing they are on Postgres.
4. Neither → SQLite at `join(DATA_DIR, 'tally.db')`.

`DATABASE_URL` and discrete vars both set → fatal error; ambiguity is not resolved by
precedence. Passwords are never logged; the startup line prints
`postgres://tally:***@postgres:5432/tally`.

### 4.3 The typing boundary

Drizzle cannot type a single client across two dialects — `PgTable` and `SQLiteTable` do not
unify, so `db.select().from(schema.games)` will not typecheck against a union type.

Resolution: resolve driver and schema together at boot in `db/index.ts` and cast **once**, at
that single boundary. `schema.ts` re-exports the SQLite schema's inferred row types as
canonical, since both dialects produce structurally identical row shapes. Everything downstream
of `db/index.ts` stays fully typed and dialect-unaware.

This is one deliberate `as` in the codebase. It must carry a comment explaining why, and it is
the reason §11's dual-dialect test matrix is non-optional — the type system is not checking
this seam for us.

---

## 5. Dialect differences to handle

| Concern | SQLite | Postgres | Resolution |
|---|---|---|---|
| Terminal call | `.get()` / `.all()` / `.run()` | `await` the builder | Drop terminal methods everywhere; `await`. `.get()` → `.limit(1)` + destructure |
| Transactions | `sqlite.transaction(syncFn)` — callback **must** be sync | `db.transaction(asyncFn)` — callback **must** be async | **Not portable.** `withTransaction()` in `db/transaction.ts` — see §5.1 |
| Autoincrement | `INTEGER PRIMARY KEY AUTOINCREMENT` | `GENERATED BY DEFAULT AS IDENTITY` | Per-dialect DDL |
| `LIKE` casing | Case-**insensitive** for ASCII | Case-**sensitive** | Dialect-aware `searchLike()` helper → `ilike` on PG. **Silent behavior change if missed** — affects [games.ts:45](../backend/src/routes/games.ts#L45) and [bgg.ts:84](../backend/src/routes/bgg.ts#L84) |
| Booleans | `integer(mode:'boolean')` | `boolean` | Per-dialect column; importer coerces `0/1` → `false/true` |
| Timestamps | `text` ISO strings | Keep as `text` | **Do not** switch to `timestamptz` — it would ripple into the API contract and frontend types for no gain |
| `datetime('now')` default | `(datetime('now'))` | `to_char(now() AT TIME ZONE 'UTC', ...)` | Per-dialect DDL, same ISO-8601 output format |
| `real` price | `REAL` | `double precision` | Direct equivalent |
| `COUNT()` / `SUM()` return type | JS `number` | **String** — node-postgres returns int8/numeric as strings to avoid precision loss | `setTypeParser` for INT8 + NUMERIC in `db/index.ts`. **Silent API contract change if missed** — every aggregate would become `"0"` instead of `0` |
| Sequences after import | n/a | Start at 1 | `setval` after import or the first insert dies on duplicate key. Verified: reproduces as a duplicate-key error on the first insert after an explicit-id import |

`stats.ts` raw SQL fragments (`COALESCE`, `CASE`, `SUM`, `EXISTS`) are portable as written —
fortunate, and the file to re-test hardest.

### 5.1 Transactions are not portable — corrected 2026-07-30

This document originally claimed Drizzle's `db.transaction()` worked on both dialects. **It does
not**, and Phase 2 (#104) found out the hard way. Verified against the installed versions:

```
db.transaction(syncFn)   → OK
db.transaction(asyncFn)  → FAIL: "Transaction function cannot return a promise"
```

- **better-sqlite3 requires a synchronous callback.** An `async` callback returns a promise
  *before its body runs*, so the driver would `COMMIT` before the work happened. It refuses
  rather than corrupt data.
- **node-postgres requires an async callback**, because every query is real network I/O.

No single `db.transaction()` call satisfies both, and a wrapper cannot bridge them: the callback
arrives from route code already shaped, and JavaScript has no way to synchronously unwrap the
promise an `async` function returns. Branching on dialect inside the wrapper does not help —
the branch would have to live in the routes, duplicating every transactional operation.

Contrast Phase 1, which went smoothly: `.get()` / `.all()` / `.run()` were SQLite-only *method
names* with a genuine common denominator in `await`. Transactions disagree about **control
flow**, which has none.

**Resolution:** `db/transaction.ts` exports `withTransaction(async (tx) => …)`. Route code uses
one shape — the async one, since Postgres cannot do otherwise — and the SQLite branch drives
`BEGIN` / `COMMIT` / `ROLLBACK` itself rather than delegating to better-sqlite3's wrapper. Phase
3 adds the Postgres branch, a single `if`, and touches no route.

A promise queue serializes SQLite transactions. better-sqlite3's own `transaction()` got
mutual exclusion for free by blocking the thread; allowing awaits inside gives that up, and
without the queue two overlapping callers both issue `BEGIN` and SQLite rejects the nested one.
Verified load-bearing by bypassing the queue and watching two tests fail.

**Known limitation, documented in the helper:** each `await` inside a transaction yields to the
microtask queue, so a *non-transactional* write from another in-flight request can land between
`BEGIN` and `COMMIT` and be rolled back alongside a failing transaction. Acceptable for a
single-user deployment with short transactions. Revisit if Tally ever grows concurrent writers.

---

## 6. Boot state machine

```
1. Resolve config → dialect
2. Connect. On Postgres: acquire pg_advisory_lock (guards two containers racing)
3. Run target-dialect migrations. Release lock.
4. Ensure _tally_meta (key TEXT PRIMARY KEY, value TEXT) exists
5. Determine state:

   READY           dialect is sqlite
                 | target has domain rows
                 | _tally_meta.imported_from_sqlite_at is set
                 | target empty AND no SQLite file with rows (fresh install)

   PENDING_IMPORT  dialect is postgres
                   AND target has no domain rows
                   AND _tally_meta.imported_from_sqlite_at is unset
                   AND a SQLite file exists at DATA_DIR with ≥1 domain row
```

The `_tally_meta` marker is load-bearing: row-counting alone would re-prompt forever for a user
who migrates and then deletes all their data.

### Divergence guard

While `PENDING_IMPORT`, **every `/api/v1/*` route except the two system endpoints returns
`503`** with the status payload. Not a dismissible banner — a hard gate. Without it a user could
add a game into the empty Postgres database, and neither store would be authoritative.

---

## 7. API surface

Both exempt from the 503 gate:

**`GET /api/v1/system/db-status`**
```jsonc
{
  "state": "READY" | "PENDING_IMPORT",
  "dialect": "sqlite" | "postgres",
  "source": { "games": 42, "players": 6, "sessions": 118 },  // when PENDING_IMPORT
  "lastError": null
}
```

**`POST /api/v1/system/import-from-sqlite`**

1. Reject unless state is `PENDING_IMPORT` (409 otherwise).
2. **Checkpoint the WAL** (`PRAGMA wal_checkpoint(TRUNCATE)`), then open the SQLite file
   **read-only**. Tally runs SQLite in WAL mode, so skipping this archives a near-empty file —
   see §11.1.
3. In a single Postgres transaction, insert in FK order, preserving IDs:
   `players → games → game_attachments → sessions → session_results → bgg_games → settings`.
   **`settings` replaces rather than inserts** — migration 0002 seeds the singleton, so every
   target created by our own migrations already holds `id=1` and a plain insert collides.
4. `setval` every sequence to `max(id)`.
5. Write `_tally_meta.imported_from_sqlite_at` in the same transaction.
6. Commit, then rename `tally.db` → `tally.db.migrated-<ISO8601>`, moving any surviving
   `-wal` / `-shm` sidecars alongside so the archive stays self-contained. **Rename, never
   delete.**
7. Flip in-memory state to `READY`.

Any throw rolls the transaction back; the app stays `PENDING_IMPORT` and surfaces the error via
`lastError`. The SQLite file is untouched on failure, so the user can retry or revert.

The "no thanks" path needs no server state — it is instructions to remove the env vars and
restart.

---

## 8. Frontend

A single full-page decision screen, rendered instead of the app whenever `db-status` reports
`PENDING_IMPORT`. Checked once on app mount, before the router renders.

- Explain plainly: existing SQLite data was found, the container is now pointed at Postgres.
- Show the row counts from `source` so the user recognises their own data.
- **Import my data** → `POST` the import endpoint, show progress, then reload into the app.
- **No, I'll revert** → static instructions to remove the DB env vars and restart.
- On import failure, show `lastError` verbatim and keep both buttons available.

Components follow the standard project pattern (`docs` in [CLAUDE.md](../CLAUDE.md)) — `data-slot`,
`cn()`-composed `classes` variable, `text-ink-*` / `bg-paper-*` tokens.

---

## 9. Phases

Each phase is independently reviewable and independently revertible.

| # | Phase | Scope | Acceptance |
|---|---|---|---|
| **0** | Test harness | Vitest in `backend`; in-memory SQLite fixture; route-level integration tests covering all 6 route files. No product change. | Suite green; meaningful coverage of every route's happy path + soft-delete behavior |
| **1** | Async query refactor | Drop `.get()`/`.all()`/`.run()`; `await` throughout. **SQLite only.** *As landed (#102): 50 of 52 sites — the 2 inside sessions.ts's `sqlite.transaction()` callback cannot be awaited (better-sqlite3 requires a sync callback) and moved to Phase 2's scope.* | Phase 0 suite green, unmodified. Zero behavior change |
| **2** | Transaction portability | Remove raw `sqlite` usage from routes; the 3 blocks move behind `withTransaction()`, converting the 2 call sites deferred from Phase 1. *As landed (#104): `db.transaction()` turned out not to be portable — see §5.1.* | Suite green. `grep -r "sqlite\." src/routes` returns nothing |
| **3** | Dialect layer | `config.ts`, `schema.pg.ts`, `migrations/pg/`, boot-time driver resolution, `searchLike()` helper | Suite runs green against **both** dialects. Fresh Postgres boot works end to end |
| **4** | Import + gate | `_tally_meta`, state machine, both system endpoints, 503 gate, importer with `setval`. *As landed (#108): also needed a settings-singleton replace and a WAL checkpoint before archiving — see §11.1.* | Test: seeded SQLite + empty PG → import → row-for-row parity incl. IDs; insert-after-import succeeds |
| **5** | Frontend | Decision screen, mount-time status check, first frontend test harness. *As landed (#113): the manual run turned up two defects the suite could not — see §11.1.* | Manual: full flow both answers. Failure path surfaces the error |
| **6** | Docs + packaging | README, compose examples, `.env.example`, Dockerfile audit, **agent-facing migration guide** | A stranger can follow the README for both modes; an agent can add a dual-dialect migration without reading this ERD |
| **7** | E2E scenario suite | Automate the migration scenarios currently run by hand: real built binaries, real Postgres, real HTTP. See §11.1 | `pnpm test:e2e` green locally and in CI; each scenario in §11.1 covered and asserted, not just executed |

Phases 0–2 are **dialect-agnostic pure refactors with no behavior change**. See §10.2 — they
target `main` via their own PRs, not `release-1`.

**Phase 7 is required before Release 1 closes, not optional polish.** §11.1 explains why: every
bug that reached a user-visible state in this project was found by an end-to-end run, not by
the unit suite.

---

## 10. Branch strategy

### 10.1 Structure

Tally uses **release trains**, not version-driven branches. A train is a named batch of
features that ship together. This ERD is part of **Release 1**, the first official release; the
next batch of features boards `release-2`, and so on. The number identifies the train, not a
semver level — nothing about Release 2 implies a breaking change.

```
main                              always releasable
 │
 ├─ refactor/00-test-harness      ─┐
 ├─ refactor/01-async-queries      ├─ one PR each into main, reviewed and merged serially
 ├─ refactor/02-transaction-portability ─┘
 │
 └─ release-1                     long-lived integration branch for the Release 1 train
     │
     ├─ feat/multi-db             this ERD's feature branch
     │   ├─ feat/multi-db-03-dialect-layer
     │   ├─ feat/multi-db-04-import-gate
     │   ├─ feat/multi-db-05-frontend
     │   └─ feat/multi-db-06-docs
     │
     └─ feat/design-language      ← the former v2---official-redesign branch
```

Feature branches are named for what they do (`feat/multi-db`), never for their train. A feature
that slips Release 1 boards Release 2 by merging into `release-2` instead — no rename, no
history rewrite.

> **Naming gotcha:** do **not** name the feature branch `feat/multi-database` and the phase
> branches `feat/multi-database/01-...`. Git stores refs as files, so a ref named
> `feat/multi-database` and a directory `feat/multi-database/` cannot coexist — you get a
> directory/file conflict at the worst possible moment. Hence the flat
> `feat/multi-db-03-dialect-layer` form above.

### 10.2 Phases 0–2 go to `main`, not `release-1`

Phases 0–2 introduce tests and mechanical refactors with **zero behavior change and zero
Postgres code**. Landing them on `main`:

- gets test coverage onto the default branch immediately, where it protects current users too;
- shrinks the release-1↔main drift that makes long-lived branches painful;
- means the risky, train-bound work (phases 3–6) starts from a tested base.

`release-1` picks them up through the routine sync in §10.4.

**Each phase is its own PR into `main`, opened for review — never a direct push.** Three
branches, three PRs:

| Branch | PR title | Reviewable claim |
|---|---|---|
| `refactor/00-test-harness` | Add Vitest harness and route integration tests | New tests only; no `src/` behavior touched |
| `refactor/01-async-queries` | Replace SQLite-only terminal calls with awaited queries | 52 call sites; Phase 0 suite passes **unmodified** |
| `refactor/02-transaction-portability` | Move transactions to Drizzle, drop the raw sqlite export | 3 transaction blocks; `grep -r "sqlite\." src/routes` returns nothing |

**Run them serially, not stacked.** Each depends on the one before, so the next branch is cut
from `main` *after* the previous PR merges. Stacking three PRs would force a rebase of every
descendant each time you merge or request changes — for three sequential refactors that cost
buys nothing.

The review value is concentrated in PR 01. It is a large diff, but it is the same edit repeated
52 times, and the strongest signal that it is correct is that PR 00's tests pass **without being
modified**. If a test had to change to accommodate 01, that is a behavior change and it needs
justifying in the PR description. Worth stating that expectation explicitly in the PR body.

Squash-merge each, matching the existing convention on `main`. After all three land, sync
`main` → `release-1` (§10.4) before starting Phase 3.

> Status: phases 0–2 all landed on `main` — #98, #102, #104. The `main`-side groundwork is
> complete; the route layer is dialect-agnostic and Phase 3 opens on `release-1`.

### 10.3 Reconciling the old redesign branch — done 2026-07-30

`v2---official-redesign` existed only locally, 89 commits ahead of main. Executed
reconciliation:

```bash
git checkout main && git pull
git checkout -b release-1 && git push -u origin release-1   # clean integration branch off main
git branch -m v2---official-redesign feat/design-language
git push -u origin feat/design-language                     # feature branch; PRs into release-1
```

This makes the redesign the first feature *into* the Release 1 train rather than being the
train itself, which is what lets each feature be validated in isolation. Since the branch had
never been pushed, the rename cost nothing.

### 10.4 Merge and sync policy

| From → To | Method | Why |
|---|---|---|
| `refactor/0N-*` → `main` | **Squash, via PR** | §10.2. Reviewed and merged by the maintainer; serial, never stacked |
| phase branch → `feat/multi-db` | **Squash** | Matches existing convention (`e22f32b`, `24fa17b` — linear, squashed, PR-numbered). One commit per phase |
| `feat/multi-db` → `release-1` | **Merge `--no-ff`** | Preserves phase boundaries inside the train so you can bisect a regression to a phase |
| `main` → `release-1` | **Merge, weekly** | Dependabot is active on `main`. Never rebase — `release-1` is pushed and has branches built on it |
| `release-1` → feature branches | **Merge, after each main→release-1 sync** | Keeps feature branches current |
| `release-1` → `main` | **Single merge at release**, then tag | The release event. Note: the `Protect Main` ruleset enforces squash-only + linear history, so this lands as a squash via PR unless the ruleset is relaxed for release merges — decide before the first release |

**Never rebase anything already pushed.** With phase branches stacked on a feature branch
stacked on `release-1`, a rebase upstream rewrites every descendant.

### 10.5 Release

The repo currently has **no tags at all**. Introduce them with the first train:

- Pre-releases from `release-1` as work lands: `release-1-beta.1`, `-beta.2`, …
- Publish those as `ghcr.io/lukanrocks/tally:next` so you can dogfood the Postgres path on your
  own homelab against real data before it reaches users. Given this change's blast radius, that
  soak time is the highest-value safety measure in this document.
- Final: merge `release-1` → `main`, tag `release-1`, `:latest` follows from `main` as it does
  today.
- The train branch is then done. `release-2` is cut fresh from `main` when the next batch of
  features starts — trains are sequential, not parallel; only one is open at a time.

### 10.6 Required CI changes (do this first — it is currently a blocker)

[docker-publish.yml](../.github/workflows/docker-publish.yml) triggers only on `main`:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**PRs into `release-1` would get no CI at all.** Two batches, needed at different times:

**Before Phase 0's PR into `main`** — add a `test` job running the Vitest suite. ✅ Done in
PR #98; `main` now also gates on a `format` job (#100/#101), and both are required checks in
the `Protect Main` ruleset.

**Before any `release-1` work starts:**

1. ✅ Add `release-*` to both `push` and `pull_request` branch lists.
2. ✅ Make the image tag conditional — `main` → `:latest`, any train → `:next`. Publishing train
   builds over `:latest` would ship unreleased code to every user running it.
3. ✅ Add a `postgres:17` service container to the `test` job and matrix it over both dialects
   (§11), so the §4.3 cast is exercised on every PR. Done in Phase 3; `docker-compose.test.yml`
   runs the same image locally on the same port, so `pnpm test:pg` is identical either side.
4. ⬜ Extend branch protection to `release-*` (same required checks, squash-only), so features
   merging into a train meet the same bar as `main`. Repo settings; owner action.

Merge-method note: `Protect Main` allows `["squash", "rebase"]` as of 2026-07-30. Ordinary PRs
squash; the `release-N` → `main` merge uses **rebase** so each feature stays a distinct commit
on `main` rather than collapsing the whole train into one (§10.4).

---

## 11. Testing

Phase 0 is the prerequisite for everything else — 52 mechanical edits plus a `as`-cast typing
seam is not something to verify by hand.

- **Runner:** Vitest in `backend`.
- **SQLite fixture:** `better-sqlite3` in-memory, migrations applied per test file.
- **Postgres fixture:** `postgres:17`, as a CI service container and via
  `docker-compose.test.yml` locally — same image, same port, so `DATABASE_URL` matches. The
  Postgres pass shares one database, so `fileParallelism` is disabled for it; SQLite keeps a
  temp file per test file and stays parallel.
- **Matrix:** from Phase 3, the whole suite runs twice, once per dialect. This is what guards
  the §4.3 cast.
- **Import test:** seed SQLite from a fixture, import into empty Postgres, assert row-for-row
  parity including IDs, then assert a subsequent insert succeeds (catches a missing `setval`).
- **Explicit case-sensitivity test** for game and BGG search on both dialects — this is the
  bug most likely to ship silently.
- **Frontend (from Phase 5):** Vitest + Testing Library + jsdom in `web`, run as a step in the
  existing `test` job so the required-check list does not change. Deliberately thin: only the
  screens that carry state — the error screen's MISCONFIGURED routing, the decision screen's
  import lifecycle, and the provider that chooses between them. It exists mainly to pin the
  one destructive control in the product, and the double-click guard on it. It is **not** a
  substitute for §11.1 — every Phase 5 defect above got past it.

### 11.1 End-to-end scenario tests (Phase 7)

**Why this is its own phase.** Every defect in this project that would have reached a user was
found by running the real thing, not by the unit suite. The record so far:

| Found by | Defect | Would have caused |
|---|---|---|
| E2E (Phase 5) | A failed import returned Drizzle's message — the whole statement plus every bound parameter, i.e. the user's own rows — as the on-screen explanation | Player names and session notes rendered as a wall of SQL where an explanation belonged |
| E2E (Phase 5) | A failed import was never logged; the only record was a screen the user could navigate away from | Nothing in `docker logs` to debug a failed migration with |
| E2E (Phase 5) | `/system/db-status` carried no `docsUrl`, unlike every other payload describing a blocked state | Decision screen rendered with nowhere to send someone unsure what an import does |
| E2E (Phase 4) | Importing `settings` collided with the singleton seeded by migration 0002 | **Every real migration fails.** Unit tests missed it because their fixtures did not carry the seeded row |
| E2E (Phase 4) | Archive contained only `tally.db`, not the WAL — a 4 KB snapshot beside a 290 KB orphaned `tally.db-wal` | User's revert path silently empty, discovered only when they needed it |
| E2E (Phase 4) | `tsc` failing while `dist` looked healthy from a previous build | Broken image shipped; the missing migration would surface as a crash on boot |
| E2E (Phase 3) | Aggregates returned as strings by node-postgres | Every count in the API becomes `"0"`; frontend does string arithmetic |

The common thread: these live at seams the unit suite cannot see — real migrations against a
real server, real driver type coercion, the build pipeline, the filesystem. Mocking any of
them reproduces the assumption rather than the behaviour.

**What the suite must do.** Drive built artifacts (`dist`, not `src`), a real Postgres, and
real HTTP. No mocking of the database, filesystem, or transport. Scenarios:

1. **Fresh SQLite install** — boot, create data, verify it reads back.
2. **Fresh Postgres install** — boot against an empty database, migrations apply, data round-trips.
3. **Migration, accepted** — populate on SQLite, restart pointed at empty Postgres, assert
   `PENDING_IMPORT`, assert the data API returns 503, import, assert **byte-identical**
   leaderboard output before and after, assert an insert afterwards succeeds.
4. **Migration, declined** — assert the gate holds indefinitely and that removing the env vars
   restores the SQLite install unharmed.
5. **Archive integrity** — the archived file opens standalone and contains every row.
6. **Failed import** — Postgres untouched, source file still present, state still
   `PENDING_IMPORT`, error surfaced through `db-status`.
7. **Config refusal** — a partial `DB_*` set exits non-zero rather than falling back to SQLite.
8. **Frontend flow** (after Phase 5) — load the app against a `PENDING_IMPORT` backend and
   click through both answers in a browser.

**Assertions, not smoke.** Scenario 3's value is the byte-identical comparison; running the
steps without comparing output would have passed while the settings collision was live.

**Where it runs.** Its own CI job — slower than the unit matrix and should not gate on it.
Docker is available on the maintainer's machine as of 2026-07-30, so local and CI runs are
equivalent.

---

## 12. Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | Silent partial-config fallback to SQLite; user writes into the wrong store | **High** | §4.2 rule 3 — fatal error on incomplete discrete config |
| 2 | Divergence: writes land in empty Postgres while SQLite still holds real data | **High** | §6 hard 503 gate, not a banner |
| 3 | `LIKE` case-sensitivity flips silently on Postgres | Medium | `searchLike()` helper + explicit dual-dialect test |
| 4 | User assumes central Postgres centralises backups, but uploads are still on the local volume | Medium | Document prominently in README and on the import screen. Both modes keep files on disk |
| 5 | Missing `setval` → first post-import insert fails on duplicate key | Medium | Covered by the import parity test |
| 6 | `release-1` drifts from `main` under weekly Dependabot traffic | Medium | Phases 0–2 target `main`; weekly `main`→`release-1` merge |
| 7 | The §4.3 cast hides a real dialect mismatch from the compiler | Medium | Dual-dialect test matrix is the only check — treat as non-optional |
| 8 | Async transactions allow interleaving that better-sqlite3's sync ones did not | Low | Single-user homelab workload; Phase 1–2 soak on `main` before Postgres lands |
| 9 | A defect lives at a seam the unit suite cannot see — real migrations, driver coercion, the build pipeline, the filesystem | **High** | §11.1 E2E scenario suite (Phase 7). Four such defects have already occurred; treating this as hypothetical would be ignoring the evidence |
| 10 | The archived SQLite file is incomplete, so a revert loses data | **High** | WAL checkpointed before archiving and sidecars moved alongside; §11.1 scenario 5 asserts the archive opens standalone with every row |

---

## 13. Documentation deliverables (Phase 6)

### 13.1 User-facing

- README: two clearly separated setup paths — **Simple** (copy compose, `docker compose up`,
  done) and **Advanced** (external Postgres). The simple path must remain visually first and
  obviously the default.
- `docker-compose.postgres.yml` example.
- `.env.example` with every supported variable and its default.
- Migration/import walkthrough including the revert instructions.
- Explicit note that uploaded files remain on the local volume in both modes (Risk 4).
- Dockerfile audit: `python3 make g++` stay — `better-sqlite3` still needs them for the default
  path.

### 13.2 Agent-facing: `docs/adding-a-migration.md`

Once this ships, **every future schema change needs two migration files that stay in lockstep**.
That is exactly the kind of invariant an agent (or a future you) breaks by writing only the
SQLite half and watching the SQLite-only tests pass. This doc is the guardrail.

Required contents:

1. **The rule up front:** every migration is two files with the same numeric prefix —
   `migrations/sqlite/00NN_name.sql` and `migrations/postgres/00NN_name.sql`. Never one without the
   other. Never edit a migration that has already been applied; add a new one.
2. **Both schema files** (`schema.sqlite.ts`, `schema.pg.ts`) must be updated together, with
   identical column names — the §4.3 cast means the compiler will not catch a mismatch.
3. **Dialect translation table** — the §5 table, restated as a practical checklist:
   `AUTOINCREMENT` ↔ `GENERATED BY DEFAULT AS IDENTITY`, `integer(mode:'boolean')` ↔ `boolean`,
   `(datetime('now'))` ↔ the `to_char(now() AT TIME ZONE 'UTC', …)` form, `REAL` ↔
   `double precision`, timestamps stay `text`.
4. **Query-layer rules:** no `.get()` / `.all()` / `.run()`; transactions only via
   `withTransaction()` from `db/transaction.ts` — never `db.transaction()` directly, which is
   dialect-specific (§5.1); text search only via the `searchLike()` helper, never a bare
   `like()`.
5. **Verification:** the command that runs the suite against both dialects, stated as a
   mandatory pre-PR step.
6. **A worked example** — one real dual-file migration, both dialects, start to finish.

### 13.3 Wiring it into agent context

A file in `docs/` is invisible to an agent that never opens it. [CLAUDE.md](../CLAUDE.md) is
auto-loaded into context every session, so Phase 6 must also add a short **Database** section
there containing the non-negotiables inline — dual-dialect migrations, no SQLite-only terminal
methods, `searchLike()` for search — plus a pointer to `docs/adding-a-migration.md` for the
full procedure.

Keep that CLAUDE.md section to a handful of lines. It is a signpost with the load-bearing rules
inlined, not a copy of the guide.
