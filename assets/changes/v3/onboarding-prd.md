# PRD: Tally — Onboarding Flow

## Context

Tally currently has no first-run experience. A fresh install (or a workspace reset) drops the user onto `/home` with an empty state and no guidance. This PRD introduces a multi-step onboarding wizard that fires on first launch and after any workspace reset, guiding the user to create a host identity, add frequent players, and seed the game library before entering the app.

The inverse guard is equally important: once onboarded, the `/onboarding` route must be inaccessible so the wizard cannot be revisited or looped back into accidentally.

---

## Decisions Made

| Topic | Decision |
|---|---|
| Onboarded detection | Dedicated `onboarded` boolean in `settings` table (new migration) |
| Step 1 — host creation | Name (required) + optional avatar upload |
| Step 2 — add friends | Name-only per player; skippable |
| Step 3 — add games | Full game form (same fields as Library > Add Game); skippable |
| Post-reset redirect | Client navigates to `/onboarding` after reset (guard handles the rest) |
| Route guard direction | `!onboarded` → redirect to `/onboarding`; already onboarded + at `/onboarding` → redirect to `/home` |
| Guard loading state | Show nothing (or a spinner) while settings are loading to avoid redirect flicker |

---

## Architecture

### DB Changes

**Migration: `server/src/db/migrations/0003_onboarding.sql`**

```sql
ALTER TABLE settings ADD COLUMN onboarded INTEGER NOT NULL DEFAULT 0;
```

**Updated `settings` schema (`server/src/db/schema.ts`)**

Add field:
```ts
onboarded: integer('onboarded').notNull().default(0),
```

---

### Server Changes

**`server/src/routes/settings.ts`**

| Change | Detail |
|---|---|
| `PUT /api/v1/settings` | Accept `onboarded` (0 or 1); validate it is 0 or 1 |
| `DELETE /api/v1/settings/reset` | Re-seed SQL already uses `INSERT INTO settings (id) VALUES (1)` — the new column defaults to `0`, so reset automatically marks the workspace as not onboarded. No change needed beyond the migration. |

**`server/src/db/schema.ts`** — add `onboarded` field (see above).

---

### Client Changes

| File | Change |
|---|---|
| `client/src/lib/api.ts` | Add `onboarded: number` to `Settings` type; add `onboarded` to settings update payload type |
| `client/src/contexts/SettingsContext.tsx` | Expose derived `isOnboarded: boolean` (`settings.onboarded === 1`) |
| `client/src/App.tsx` | Add `/onboarding` route (outside `<Layout>`); add `<RequireOnboarded>` wrapper around all existing routes; add redirect from `/onboarding` when already onboarded |
| `client/src/pages/Onboarding.tsx` | New multi-step wizard (see spec below) |
| `client/src/pages/Settings.tsx` | After reset API call succeeds, navigate to `/onboarding` instead of `/home` |

---

## Feature Specifications

### 1. Route Guard — `RequireOnboarded`

A wrapper component used in `App.tsx` that:
- While `isLoading === true`: renders `null` (or a minimal full-screen spinner) to prevent redirect flicker
- When `isLoading === false && !isOnboarded`: renders `<Navigate to="/onboarding" replace />`
- Otherwise: renders `<Outlet />`

The `/onboarding` route itself should check the inverse:
- If `isLoading === false && isOnboarded`: renders `<Navigate to="/home" replace />`
- Otherwise: renders `<Onboarding />`

```tsx
// App.tsx structure (simplified)
<Routes>
  <Route path="onboarding" element={<OnboardingGuard />} />
  <Route element={<RequireOnboarded />}>
    <Route element={<Layout />}>
      {/* all existing routes */}
    </Route>
  </Route>
</Routes>
```

---

### 2. Onboarding Page (`/onboarding`)

**Layout**: Full-screen, no sidebar, no bottom nav. Clean centered card or two-column layout. Step progress indicator at the top (three dots or `Step X of 3`).

---

#### Step 1 — Create Host

**Heading**: "Welcome to Tally. Who's hosting?"
**Subtext**: "This is you. You'll be set as the default game owner."

**Fields:**
- Name (text input, required, `placeholder="Your name"`) — validated on submit; shows inline error if blank or duplicate
- Avatar (file input, optional) — same upload behavior as `POST /api/v1/players/:id/avatar`; preview the selected image before submitting

**Submit button**: "Next →"

**On submit:**
1. `POST /api/v1/players` with `{ name }`
2. If avatar selected: `POST /api/v1/players/:id/avatar`
3. `PUT /api/v1/settings` with `{ default_owner_id: player.id }`
4. Advance to Step 2

**Error handling**: Name uniqueness conflict (HTTP 400/409 from server) shows inline error under the name field.

---

#### Step 2 — Add Frequent Players

**Heading**: "Who do you usually play with?"
**Subtext**: "Add your crew. You can always add more later."

**Interaction:**
- A name input + "Add" button
- Added players appear as a list of chips/cards below the input (name only — no avatar in this step)
- Players are created immediately on "Add" (eager, not batched) via `POST /api/v1/players`
- Name uniqueness errors show inline under the input

**Navigation buttons:**
- "Skip" (text link or secondary button) — advances to Step 3 without creating any players
- "Continue →" (primary) — advances to Step 3 (enabled whether or not any players were added)

**Back button**: "← Back" returns to Step 1. The host player already created is not undone.

---

#### Step 3 — Add Games

**Heading**: "What games do you have?"
**Subtext**: "Add your first game, or skip and do it later."

**Interaction:**
- A collapsed "Add a game" form — same fields as `Library > Add Game` (`name`, `description`, `quick_rules`, `min_players`, `max_players`, `purchase_at`, `price`, `cover_image_path`, `owner_id`)
- Only the game `name` field is required; all others are optional
- On "Add Game" submit: calls `POST /api/v1/games`; the added game appears in a list below; the form resets for another entry
- `owner_id` is pre-filled from `settings.default_owner_id` (the host just created), matching existing `GameForm` behavior

**Navigation buttons:**
- "Skip" — advances to completion without creating any games
- "Finish →" (primary) — completes onboarding

**Back button**: "← Back" returns to Step 2.

---

#### Completion

On "Finish" or "Skip" from Step 3:
1. `PUT /api/v1/settings` with `{ onboarded: 1 }`
2. `navigate('/home', { replace: true })`

The `SettingsContext` updates `isOnboarded` to `true`, so the guard will pass on all subsequent navigations.

---

### 3. Post-Reset Redirect

In `client/src/pages/Settings.tsx`, the delete-all-data flow currently ends with:
```ts
navigate('/home')
```

Change to:
```ts
navigate('/onboarding')
```

The `RequireOnboarded` guard will also catch any navigation to `/home` or other guarded routes since settings will be refetched (or the context should be invalidated after reset). The explicit navigate to `/onboarding` is belt-and-suspenders and avoids a flash of the guarded redirect.

The `SettingsContext` must re-fetch (or reset to the default state) after the reset call to ensure `isOnboarded` reflects the server truth before the guard evaluates.

---

## Holes / Deferred Decisions

1. **Back navigation undoability**: Players created in Step 2 are not deleted if the user hits "← Back" and re-enters Step 2. Duplicate name entries will produce errors. This is acceptable for now but should be surfaced clearly (e.g., the added player list is preserved if the user goes back).

2. **Step 3 embedded form complexity**: The full `GameForm` is currently a routed page that uses `useParams` and `useNavigate` internally. For onboarding, it needs to be either extracted into a standalone component or substantially adapted. This is the highest implementation complexity in the feature.

3. **Settings context invalidation after reset**: `SettingsContext` fetches settings once on mount. After `DELETE /api/v1/settings/reset`, the context holds stale `isOnboarded: true`. The context needs to expose a `refetch` or `reset` function that `Settings.tsx` calls after the reset completes.

4. **Step progress indicator accessibility**: The step dots/indicator should be `aria-label`-ed for screen readers.

5. **Mobile avatar picker**: File input behavior on iOS/Android differs from desktop. Avatar upload in Step 1 should be tested on mobile Safari.

---

## Out of Scope

- Animated transitions between steps
- The ability to edit the host player's name within the onboarding wizard (use Players page after onboarding)
- Multi-device sync (onboarding is per-workspace/device)
- Language or currency configuration during onboarding (those live in Settings)

---

## Critical Files

| File | Role |
|---|---|
| `server/src/db/schema.ts` | Add `onboarded` field to settings schema |
| `server/src/db/migrations/0003_onboarding.sql` | New migration |
| `server/src/routes/settings.ts` | Accept `onboarded` in PUT |
| `client/src/lib/api.ts` | Add `onboarded` to Settings type |
| `client/src/contexts/SettingsContext.tsx` | Expose `isOnboarded`, add `refetch` for post-reset |
| `client/src/App.tsx` | Route guard + onboarding route |
| `client/src/pages/Onboarding.tsx` | New — multi-step wizard |
| `client/src/pages/Settings.tsx` | Update reset navigate target + call context refetch |

---

## Verification

| Scenario | Expected result |
|---|---|
| Fresh DB (no players, `onboarded = 0`), navigate to `/home` | Redirected to `/onboarding` |
| Already onboarded, navigate to `/onboarding` | Redirected to `/home` |
| Complete step 1 with a valid name | Player created, `default_owner_id` set, advance to step 2 |
| Complete step 1 with a duplicate name | Inline error shown, no navigation |
| Skip step 2, skip step 3 | `onboarded = 1`, land on `/home` |
| Add 2 friends in step 2, continue | 2 players created, all visible on `/players` after onboarding |
| Add a game in step 3, finish | Game visible in `/library` after onboarding |
| Delete all data in Settings | `onboarded` resets to `0`, redirect to `/onboarding` |
| Reload app after delete | Onboarding shown again from step 1 |
| Complete onboarding again after reset | New host and data created correctly |
