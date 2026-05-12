# Engineering Requirements Document
## Tally v10 — Mobile Client

**Version:** v10
**Status:** Draft
**Last Updated:** 2026-05-11
**Author:** Engineering

---

## 1. Scope

This document specifies the complete implementation plan for the Tally v10 mobile client. It covers every file to create or modify, the exact API calls each screen makes, state management strategy, cross-cutting concerns, and the server-side health-check addition. The companion PRD is `changes/v10/prd.md`.

No new database schema changes. The only server modification is adding `GET /api/health`.

---

## 2. Dependencies

### 2.1 Initialize the Project

```bash
npx create-expo-app@latest mobile --template blank-typescript
```

This creates `mobile/` with Expo SDK 52+, TypeScript, and no opinionated navigation scaffolding. After initialization, install dependencies below.

### 2.2 Dependency List

Run inside `mobile/`:

```bash
npx expo install \
  expo-router \
  expo-status-bar \
  expo-constants \
  @react-native-async-storage/async-storage \
  react-native-safe-area-context \
  react-native-screens \
  react-native-reanimated \
  react-native-gesture-handler \
  react-native-draggable-flatlist \
  react-native-toast-message \
  lucide-react-native \
  react-native-svg \
  @react-native-community/datetimepicker
```

> `react-native-svg` is required by `lucide-react-native`. `react-native-screens` is required by Expo Router / React Navigation.

### 2.3 Rationale for Key Choices

| Package | Reason |
|---|---|
| `expo-router` | File-based routing (PRD §5.1) — Expo Router v4 |
| `@react-native-async-storage/async-storage` | Server URL persistence. Not sensitive data — no need for SecureStore. |
| `react-native-reanimated` + `react-native-gesture-handler` | Required by `react-native-draggable-flatlist` and React Navigation |
| `react-native-draggable-flatlist` | Drag-to-reorder in Step 3. Wraps `reanimated` + `gesture-handler`; simpler than hand-rolling |
| `react-native-toast-message` | Non-blocking toasts — equivalent to Sonner in the web client |
| `lucide-react-native` | Same icon vocabulary as web client's `lucide-react` |
| `@react-native-community/datetimepicker` | Native date picker for `played_at` field in session logging. Expo managed workflow compatible. |

### 2.4 `app.json` Configuration

The Expo config must declare the Expo Router scheme and plugins:

```json
{
  "expo": {
    "name": "Tally",
    "slug": "tally",
    "scheme": "tally",
    "version": "1.0.0",
    "orientation": "portrait",
    "plugins": [
      "expo-router",
      "react-native-gesture-handler"
    ],
    "ios": {
      "bundleIdentifier": "app.papelada.tally",
      "supportsTablet": false
    },
    "android": {
      "package": "app.papelada.tally"
    }
  }
}
```

`orientation: portrait` enforces portrait-only at the app level (PRD §6).

### 2.5 `babel.config.js`

Required for `react-native-reanimated`:

```js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  }
}
```

The `reanimated/plugin` **must be last** in the plugins array.

---

## 3. Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx                     # Root layout — bootstrap logic
│   ├── setup.tsx                       # First-run: server URL entry
│   └── (tabs)/
│       ├── _layout.tsx                 # Bottom tab bar (5 tabs)
│       ├── (home)/
│       │   ├── _layout.tsx             # Stack navigator for Home tab
│       │   ├── index.tsx               # Leaderboard screen
│       │   └── player/
│       │       └── [id].tsx            # Player profile screen
│       ├── library/
│       │   ├── _layout.tsx             # Stack navigator for Library tab
│       │   ├── index.tsx               # Game library list
│       │   └── [id].tsx                # Game detail screen
│       ├── log/
│       │   ├── _layout.tsx             # Stack navigator + LogSessionContext provider
│       │   ├── index.tsx               # Step 1: Pick a Game
│       │   ├── players.tsx             # Step 2: Select Players
│       │   └── results.tsx             # Step 3: Record Results
│       ├── tools/
│       │   ├── _layout.tsx             # Stack navigator for Tools tab
│       │   ├── index.tsx               # Tool selector screen
│       │   ├── timer.tsx               # Turn Timer
│       │   ├── first-player.tsx        # Who Goes First?
│       │   └── dice.tsx                # Dice Roller
│       └── settings.tsx                # Settings tab (single screen)
├── components/
│   ├── CoverImage.tsx                  # Game cover with server-URL-prefixed src
│   ├── GameRow.tsx                     # Reusable game list row
│   ├── PlayerRow.tsx                   # Reusable player list row (leaderboard)
│   ├── LoadingScreen.tsx               # Centered ActivityIndicator
│   ├── ErrorScreen.tsx                 # Error message + Retry button
│   └── ToastConfig.tsx                 # react-native-toast-message custom config
├── context/
│   └── LogSessionContext.tsx           # Session flow state (game + players)
├── hooks/
│   ├── useApi.ts                       # Generic data-fetching hook with loading/error
│   └── useTimer.ts                     # Port of web client useTimer hook
├── lib/
│   ├── api.ts                          # Fetch wrapper — prefixes server URL
│   ├── storage.ts                      # AsyncStorage wrapper for server URL
│   ├── points.ts                       # calcPoints formula (mirrors server logic)
│   └── types.ts                        # Shared TypeScript types
├── data/
│   └── firstPlayerPrompts.ts           # Copy of web client data (pure data, no changes)
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## 4. Cross-Cutting Concerns

### 4.1 Server URL & Image Path Resolution

The `cover_image_path` and `avatar_path` fields returned by the API are relative paths in the form `/files/covers/filename.jpg`. The mobile app must prefix these with the saved server URL to form absolute URIs.

**Rule:** any time an image path from the server is displayed, pass it through `resolveAssetUrl(path)`:

```ts
// lib/storage.ts (exports serverUrl as a module-level string after bootstrap)
export function resolveAssetUrl(relativePath: string | null): string | null {
  if (!relativePath) return null
  return `${getServerUrl()}${relativePath}`
}
```

The `CoverImage` component wraps `Image` and calls `resolveAssetUrl` internally, so individual screens never need to manually prefix paths.

### 4.2 Points Calculation (Client-side Preview)

The server calculates `points_awarded` on insert. The mobile needs to replicate this formula for the live preview in Step 3 only.

```ts
// lib/points.ts
export function calcPoints(n: number, rank: number): number {
  if (n < 2) return 0
  return n - (rank - 1) + (rank === 1 ? 1 : 0)
}
```

This is the exact formula from `server/src/routes/sessions.ts:13`. The live preview is computed from the current ranked order: for a player at index `i` in the list, `rank = i + 1` and `points = calcPoints(totalPlayers, rank)`.

### 4.3 Error Handling Pattern

All data-fetching screens follow the same pattern:
- **Loading state:** render `<LoadingScreen />` (centered `ActivityIndicator`)
- **Error state:** render `<ErrorScreen message={...} onRetry={refetch} />` (message + "Retry" button)
- **Empty state:** render inline empty state text per PRD specs

Network errors (server unreachable) and HTTP errors (non-2xx responses) both surface through the `useApi` hook as an `error` string.

```ts
// hooks/useApi.ts
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetcher())
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}
```

### 4.4 Toasts

Use `react-native-toast-message`. The root layout renders `<Toast />` outside the navigation tree so it appears above all screens. Two call sites in v10:

- **Success:** `Toast.show({ type: 'success', text1: 'Session logged!' })` — after successful session POST
- **Error:** `Toast.show({ type: 'error', text1: 'Something went wrong — try again.' })` — after failed session POST

Configure auto-hide after 3 seconds (library default). No modal alerts anywhere in the app.

### 4.5 Safe Area

Every screen that renders its own container uses `<SafeAreaView>` from `react-native-safe-area-context`. The tab bar and stack headers handle their own safe area insets automatically via React Navigation / Expo Router.

### 4.6 Pull-to-Refresh

All data-fetching list screens support pull-to-refresh via `FlatList`'s `refreshControl` prop:

```tsx
<FlatList
  refreshControl={
    <RefreshControl refreshing={loading} onRefresh={refetch} />
  }
  ...
/>
```

`refetch` comes from the `useApi` hook.

---

## 5. Library Modules

### 5.1 `lib/types.ts`

Mirror the web client's type definitions from `client/src/lib/api.ts`. These types are consumed by all screens and the API client.

```ts
export interface Game {
  id: number
  name: string
  description: string | null
  quick_rules: string | null
  min_players: number | null
  max_players: number | null
  purchase_at: string | null
  price: number | null
  cover_image_path: string | null
  owner_id: number | null
  owner_name: string | null
  bgg_id: number | null
  year_published: number | null
  created_at: string
  session_count?: number
  attachments?: GameAttachment[]
}

export interface GameAttachment {
  id: number
  game_id: number
  label: string
  file_path: string
  created_at: string
}

export interface Player {
  id: number
  name: string
  avatar_path: string | null
  player_type: 'person' | 'shop'
  created_at: string
  total_points?: number
  total_sessions?: number
  wins?: number
  win_rate?: number
}

export interface Session {
  id: number
  game_id: number
  game_name?: string
  played_at: string
  notes: string | null
  created_at: string
  player_count?: number
  results?: SessionResult[]
}

export interface SessionResult {
  id: number
  player_id: number
  player_name: string
  rank: number
  points_awarded: number
}

export interface LeaderboardEntry {
  player_id: number
  player_name: string
  avatar_path: string | null
  total_points: number
  wins: number
  total_sessions: number
  win_rate: number
}

export interface SessionCreatePayload {
  game_id: number
  played_at: string       // ISO 8601: "YYYY-MM-DDTHH:MM:SS"
  notes?: string
  results: Array<{ player_id: number; rank: number }>
}
```

### 5.2 `lib/storage.ts`

Wraps `AsyncStorage` for the server URL. The bootstrap logic reads this once at app start. The URL is also held in a module-level variable for synchronous access after boot (e.g., in `resolveAssetUrl`).

```ts
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'tally_server_url'
let _serverUrl = ''

export async function loadServerUrl(): Promise<string> {
  const val = await AsyncStorage.getItem(KEY)
  _serverUrl = val ?? ''
  return _serverUrl
}

export async function saveServerUrl(url: string): Promise<void> {
  _serverUrl = url
  await AsyncStorage.setItem(KEY, url)
}

export function getServerUrl(): string {
  return _serverUrl
}

export function resolveAssetUrl(path: string | null): string | null {
  if (!path) return null
  return `${_serverUrl}${path}`
}
```

### 5.3 `lib/api.ts`

Thin fetch wrapper that reads the server URL from storage at call time. All methods throw `Error` with the server's `error` field on non-2xx responses.

```ts
import { getServerUrl } from './storage'
import type { Game, Player, Session, LeaderboardEntry, SessionCreatePayload } from './types'

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getServerUrl()
  const res = await fetch(`${base}/api/v1${path}`, options)

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? 'Request failed')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

function json(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export const api = {
  health: {
    check: () => {
      const base = getServerUrl()
      return fetch(`${base}/api/health`).then(r => {
        if (!r.ok) throw new Error('Server did not respond')
      })
    },
  },

  games: {
    list: (search?: string) => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ''
      return req<Game[]>(`/games${qs}`)
    },
    get: (id: number) => req<Game>(`/games/${id}`),
  },

  players: {
    list: () => req<Player[]>('/players'),
    get: (id: number) => req<Player>(`/players/${id}`),
  },

  sessions: {
    list: () => req<Session[]>('/sessions'),
    create: (payload: SessionCreatePayload) =>
      req<Session>('/sessions', json('POST', payload)),
  },

  stats: {
    leaderboard: () => req<LeaderboardEntry[]>('/stats/leaderboard'),
  },
}
```

**Note:** `api.health.check()` hits `/api/health` (no `/v1`), which matches the new server route described in §10.

---

## 6. Screen Specifications

### 6.1 Root Layout — `app/_layout.tsx`

**Purpose:** Bootstrap entry point. Loads the saved server URL from AsyncStorage on mount. Routes to either `setup` (no URL saved) or `(tabs)` (URL saved).

**State:**
- `ready: boolean` — false until `loadServerUrl()` resolves
- `hasServer: boolean` — true if a non-empty URL was found in storage

**Implementation:**

```tsx
import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { loadServerUrl, getServerUrl } from '../lib/storage'

export default function RootLayout() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadServerUrl().then(() => setReady(true))
  }, [])

  if (!ready) return null  // Splash screen shows during this gap

  const hasServer = getServerUrl().length > 0

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="setup" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
```

**Routing logic:** Expo Router uses the file system for routing. The root layout does not programmatically redirect — instead, the `setup.tsx` and `(tabs)/_layout.tsx` screens are both registered. The redirect is handled by calling `router.replace('/(tabs)')` inside `setup.tsx` on successful connection, and by checking `getServerUrl()` on any screen that needs it.

**However, the initial route must be decided.** Use `initialRouteName` prop on `<Stack>` conditionally:

```tsx
<Stack initialRouteName={hasServer ? '(tabs)' : 'setup'} screenOptions={{ headerShown: false }}>
```

> `GestureHandlerRootView` must be the outermost wrapper for `react-native-gesture-handler` to work (required by `react-native-draggable-flatlist`).

---

### 6.2 Setup Screen — `app/setup.tsx`

**Purpose:** First-run server URL entry. Validates the URL via health check before proceeding.

**API calls:** `api.health.check()` — direct fetch to `${enteredUrl}/api/health`

**State:**
- `url: string` — controlled input value
- `loading: boolean` — true while health check is in flight
- `error: string | null` — inline error message

**Behaviour:**
1. User enters a URL (e.g. `http://192.168.1.100:3001`) and taps "Connect"
2. Trim trailing slashes from the URL before storing
3. Temporarily set the module-level server URL via `saveServerUrl(trimmedUrl)` to allow `api.health.check()` to construct the request
4. If health check resolves: `router.replace('/(tabs)')` — app enters normally
5. If health check rejects: show inline error `"Could not reach the server — check the URL and try again."`, clear the saved URL

**UI:**
- Full-screen centered layout
- "Tally" title / logo
- URL `TextInput` with `keyboardType="url"` and `autoCapitalize="none"` and `autoCorrect={false}`
- "Connect" `TouchableOpacity` / `Pressable` button (disabled + spinner when `loading === true`)
- Inline error text below the button when `error` is set

---

### 6.3 Tab Bar — `app/(tabs)/_layout.tsx`

**Purpose:** Defines the 5-tab bottom navigation bar.

**Tabs (in order):**

| Tab | Name | Icon (`lucide-react-native`) | Route |
|---|---|---|---|
| Home | Home | `Home` | `(home)` |
| Library | Library | `BookOpen` | `library` |
| Log Session | Log | `PlusCircle` | `log` |
| Tools | Tools | `Wrench` | `tools` |
| Settings | Settings | `Settings` | `settings` |

**Log tab reset behavior:** When the user taps the Log tab icon, the stack must reset to Step 1. This is implemented via the `tabPress` listener:

```tsx
<Tabs.Screen
  name="log"
  listeners={({ navigation }) => ({
    tabPress: () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'log' }],
      })
    },
  })}
/>
```

**Style:** Tab bar uses the app's neutral palette: white/light background, slate-colored active icon, muted inactive icon. Active tab icon: `#0f172a` (slate-900). Inactive: `#94a3b8` (slate-400). No labels — icons only (the tab bar is compact).

> If labels are preferred: use short labels matching the tab names above.

---

### 6.4 Leaderboard — `app/(tabs)/(home)/index.tsx`

**Purpose:** Global player rankings. First screen the user sees.

**API calls:**
- `api.stats.leaderboard()` → `GET /api/v1/stats/leaderboard`

**Response shape:** `LeaderboardEntry[]` sorted by total_points descending (server-sorted).

**State:** Managed by `useApi(api.stats.leaderboard)`.

**UI:**
- `FlatList` of leaderboard rows with pull-to-refresh
- Each row: rank number (1-based index + 1), player name, total points
- Rank badge: gold background for rank 1, neutral for others
- Tap a row → `router.push('/(tabs)/(home)/player/${entry.player_id}')`
- Empty state: "No sessions logged yet."

**Shared component:** `PlayerRow` — accepts `rank`, `name`, `totalPoints`, `onPress`.

---

### 6.5 Player Profile — `app/(tabs)/(home)/player/[id].tsx`

**Purpose:** Per-player stats screen. Matches the web client's `PlayerProfile` page.

**API calls:**
- `api.players.get(id)` → `GET /api/v1/players/:id` — returns player with `total_points`, `total_sessions`, `wins`, `win_rate`
- `api.sessions.list()` → `GET /api/v1/sessions` — returns all sessions

**Note:** The web client loads all sessions and displays the first 20 without filtering by player. The mobile matches this behaviour exactly.

**State:** Two parallel `useApi` calls. Show `<LoadingScreen />` until both resolve.

**UI:**
- Back button (stack header)
- Player avatar (from `resolveAssetUrl(player.avatar_path)`) — 64×64 circle with fallback initials
- Player name (bold, large) + "Member since YYYY-MM-DD"
- Stat grid (2×2): Total Points, Sessions, Wins, Win Rate
- "Recent Sessions" section: `FlatList` of up to 20 sessions showing date, game name, player count
- Empty state for session list: "No sessions found."

---

### 6.6 Library — `app/(tabs)/library/index.tsx`

**Purpose:** Searchable game list.

**API calls:**
- `api.games.list()` → `GET /api/v1/games` (initial load, alphabetical default)
- `api.games.list(searchQuery)` → `GET /api/v1/games?search=...` (on search input change, debounced 300ms)

**State:**
- `searchQuery: string` — controlled input
- Data via `useApi` — re-triggered when searchQuery changes (debounced)

**UI:**
- `TextInput` search bar at the top
- `FlatList` of game rows with pull-to-refresh
- Each row: cover image thumbnail (48×48, rounded), game name, player count range (e.g. "2–5 players")
- Tap a row → `router.push('/(tabs)/library/${game.id}')`
- Empty state: "Your library is empty. Add games from the web app."
- Cover images via `CoverImage` component (handles null paths gracefully with a placeholder icon)

---

### 6.7 Game Detail — `app/(tabs)/library/[id].tsx`

**Purpose:** Game detail page.

**API calls:**
- `api.games.get(id)` → `GET /api/v1/games/:id`
- `api.sessions.list()` → `GET /api/v1/sessions` (for recent sessions by this game)

**Recent sessions logic:** Filter sessions client-side by `session.game_id === id`, sort by `played_at` descending, take the first 5.

**State:** Two parallel `useApi` calls.

**UI:**
- Back button (stack header)
- Cover image (full width, aspect ratio ~3:2, with placeholder)
- Game name (bold heading), year published, player count range
- "Recent Sessions" section: up to 5 sessions showing date and player count
- Pull-to-refresh triggers both API calls

---

## 7. Log Session Flow

The Log Session tab contains a 3-step flow managed by a React Context. The context persists state across screen transitions within the tab's stack but resets when the tab icon is tapped (§6.3 tabPress handler resets the stack, and the Step 1 screen resets the context on mount).

### 7.1 `context/LogSessionContext.tsx`

```ts
interface LogSessionState {
  game: Game | null
  players: Player[]  // players selected in Step 2
}

interface LogSessionContext extends LogSessionState {
  setGame: (game: Game) => void
  setPlayers: (players: Player[]) => void
  reset: () => void
}
```

**Provider placement:** `app/(tabs)/log/_layout.tsx` wraps the `<Stack>` in `<LogSessionProvider>`.

**Reset trigger:** `app/(tabs)/log/index.tsx` calls `context.reset()` inside a `useFocusEffect` on the initial visit only — specifically when arriving via tab press (stack depth = 0). This ensures pressing the Log tab always starts fresh.

Detecting tab press reset: check `navigation.getState().index === 0` inside the tab press listener and call `context.reset()` there directly.

---

### 7.2 Step 1: Pick a Game — `app/(tabs)/log/index.tsx`

**Purpose:** Game selector. First step of the session log flow.

**API calls:**
- `api.games.list()` → `GET /api/v1/games` on mount

**State:**
- `searchQuery: string` — filters the game list client-side (no server round-trip — list is small enough)
- `context.reset()` called on first mount after tab press

**UI:**
- Search bar (TextInput) at the top
- `FlatList` of games (same row format as Library tab)
- Tapping a game: call `context.setGame(game)`, then `router.push('/(tabs)/log/players')`
- "Cancel" header button: `router.back()` — returns to whatever state the tab was previously in (which is Step 1 since the tab always resets here)

**No loading skeleton during search** — filtering is done client-side on the already-loaded list.

---

### 7.3 Step 2: Select Players — `app/(tabs)/log/players.tsx`

**Purpose:** Multi-select player list.

**API calls:**
- `api.players.list()` → `GET /api/v1/players` on mount — filter to `player_type === 'person'`

**State (local):**
- `selected: Set<number>` — set of selected player IDs

**Validation:** "Next" button disabled unless `selected.size >= 2`. Inline note: "Select at least 2 players." shown when fewer than 2 are selected.

**UI:**
- Header: "Select Players" + "Back" button
- `FlatList` of all person-type players, each row with name and a checkbox (custom — `View` styled as a checkbox or use `Pressable` with a checkmark icon)
- Players with IDs in `selected` show a checkmark; tap toggles selection
- Sticky bottom bar: player count + "Next" button

**On Next:**
```ts
const selectedPlayers = players.filter(p => selected.has(p.id))
context.setPlayers(selectedPlayers)
router.push('/(tabs)/log/results')
```

---

### 7.4 Step 3: Record Results — `app/(tabs)/log/results.tsx`

**Purpose:** Drag-to-reorder ranking, optional date/notes, live points preview, submit.

**Data received from context:** `context.game`, `context.players`

**State (local):**
- `ranked: Player[]` — ordered list (index 0 = rank 1). Initialized from `context.players` on mount.
- `playedAt: Date` — date of session, defaults to `new Date()`
- `notes: string` — optional notes field, defaults to `''`
- `submitting: boolean`
- `showDatePicker: boolean` — iOS date picker visibility toggle

**Live points preview:** Computed inline from `ranked` array:

```ts
const preview = ranked.map((player, index) => ({
  player,
  rank: index + 1,
  points: calcPoints(ranked.length, index + 1),
}))
```

Re-computes on every reorder — no `useMemo` needed (list is tiny).

**Drag-to-reorder:** Use `DraggableFlatList` from `react-native-draggable-flatlist`:

```tsx
<DraggableFlatList
  data={ranked}
  keyExtractor={item => String(item.id)}
  onDragEnd={({ data }) => setRanked(data)}
  renderItem={({ item, drag, isActive, getIndex }) => (
    <ScaleDecorator>
      <ResultRow
        player={item}
        rank={(getIndex() ?? 0) + 1}
        points={calcPoints(ranked.length, (getIndex() ?? 0) + 1)}
        onDrag={drag}
        isActive={isActive}
      />
    </ScaleDecorator>
  )}
/>
```

Each `ResultRow` has:
- Left: drag handle icon (`GripVertical` from `lucide-react-native`)
- Rank badge (gold for rank 1)
- Player name
- Points preview (right-aligned, e.g. "5 pts")

**Date field:** Display current date as `YYYY-MM-DD` formatted string. Tapping opens `@react-native-community/datetimepicker` in `date` mode (modal on iOS, inline on Android). Updates `playedAt` state.

**Notes field:** Single-line `TextInput`, placeholder "Optional notes…". Maps to the `notes` field in the POST payload.

**Submit logic:**

```ts
async function handleSubmit() {
  setSubmitting(true)
  const now = new Date()
  const dateStr = playedAt.toISOString().slice(0, 10)
  const timeStr = now.toTimeString().slice(0, 8)

  try {
    await api.sessions.create({
      game_id: context.game!.id,
      played_at: `${dateStr}T${timeStr}`,
      notes: notes.trim() || undefined,
      results: ranked.map((p, i) => ({ player_id: p.id, rank: i + 1 })),
    })
    Toast.show({ type: 'success', text1: 'Session logged!' })
    context.reset()
    router.replace('/(tabs)/log')
  } catch {
    Toast.show({ type: 'error', text1: 'Something went wrong — try again.' })
  } finally {
    setSubmitting(false)
  }
}
```

**Submit button:** Shows spinner (`ActivityIndicator`) inside the button when `submitting === true`. Disabled while submitting.

**UI layout (top to bottom):**
1. Stack header: "Record Results" + "Back" button
2. Game name subtitle
3. `DraggableFlatList` of ranked players (scrollable, each row ≥ 52pt tall)
4. Date picker row (tap to open native picker)
5. Notes `TextInput`
6. Submit button (full-width, primary style)

---

## 8. Tools Tab

### 8.1 Tool Selector — `app/(tabs)/tools/index.tsx`

**Purpose:** Entry screen for all three tools.

**No API calls.**

**UI:**
- Three cards arranged vertically, each: icon (Lucide), tool name, one-line description
- Tap Timer card → `router.push('/(tabs)/tools/timer')`
- Tap Who Goes First card → `router.push('/(tabs)/tools/first-player')`
- Tap Dice Roller card → `router.push('/(tabs)/tools/dice')`

| Tool | Icon | Description |
|---|---|---|
| Timer | `Timer` | Countdown timer with play, pause, and reset |
| Who Goes First? | `Shuffle` | Random prompt to determine who goes first |
| Dice Roller | `Dices` | Roll any number of any dice |

---

### 8.2 Timer — `app/(tabs)/tools/timer.tsx`

**Port of:** `client/src/pages/Timer.tsx` + `client/src/hooks/useTimer.ts`

**Hook:** `hooks/useTimer.ts` — copy the logic verbatim from the web client. It uses `setInterval`/`clearInterval` which are identical in React Native. No changes required.

**State (from hook):** `state`, `remaining`, `pct`, `start`, `pause`, `resume`, `stop`, `restart`, `addSeconds`

**Local state:**
- `minutes: number` (default 1)
- `seconds: number` (default 0)
- `resetting: boolean` (transient animation flag)

**Two render modes (idle vs running):**

**Idle mode UI:**
- Title: "Turn Timer"
- Minutes/seconds stepper with increment/decrement `Pressable` buttons (+ / -) and numeric `TextInput`
- Preset buttons: 30s, 1m, 2m, 5m
- "Start" button (disabled when total === 0)

**Running mode UI (fill-screen layout):**
- Color-fill background that drains as time runs out:
  - `> 40%` remaining: green (`#22c55e`)
  - `> 20%` remaining: yellow (`#facc15`)
  - `≤ 20%` remaining: red (`#ef4444`)
- Timer display: `MM:SS` in a large font (`fontSize: 80` or `vw`-equivalent using `Dimensions`)
- When expired: timer blinks (toggle opacity every 500ms via `setInterval`)
- Control buttons: Stop, Restart, Play/Pause
- "+10s / +30s / +60s" add-time buttons (disabled when expired)
- Background fill: use `Animated.View` with `height` animated prop, or `react-native-reanimated` with `useSharedValue`

**Implementation note for fill animation:**
Use `useSharedValue` + `useAnimatedStyle` from `react-native-reanimated` (already installed). The fill height is `(1 - pct) * 100%` of the container height.

```ts
const fillHeight = useSharedValue(0)
useEffect(() => {
  fillHeight.value = withTiming((1 - pct) * 100, {
    duration: resetting ? 500 : 1000,
    easing: Easing.linear,
  })
}, [pct, resetting])
```

---

### 8.3 Who Goes First? — `app/(tabs)/tools/first-player.tsx`

**Port of:** `client/src/pages/FirstPlayer.tsx`

**Data:** Copy `client/src/data/firstPlayerPrompts.ts` verbatim to `mobile/data/firstPlayerPrompts.ts`. It is pure data (no imports), no changes needed.

**State:** `phase: 'idle' | 'animating' | 'revealed'`, `displayText: string`, `finalPrompt: Prompt | null`

**Animation logic:** Identical to web — `setInterval` at 60ms swaps `displayText` with a random prompt for 2 seconds, then reveals `finalPrompt`.

**UI:**

- **Idle:** Title "Who Goes First?", subtitle, large "Draw" button
- **Animating / Revealed:**
  - Category badge (shown only when `revealed`)
  - Large prompt text (`fontSize: 32`, centered) — this is the animated slot-machine display
  - "Re-roll" button (shown only when `revealed`)

**Font size requirement:** Prompt text ≥ 32px (logical pixels) per PRD §4.

---

### 8.4 Dice Roller — `app/(tabs)/tools/dice.tsx`

**Port of:** `client/src/pages/Dice.tsx`

**State:** `phase: 'setup' | 'rolling' | 'results'`, `count: number`, `sides: number`, `displayValues: number[]`, `results: number[]`

**Animation logic:** Identical to web — `setInterval` at 16ms, uses `easeOut` + `lerp` to throttle display updates from fast to slow over 1800ms.

**Three render phases:**

1. **Setup:** Count stepper (1–10) + sides stepper (2–999) + preset buttons (d2, d4, d6, d8, d10, d12, d20, d100) + "Roll" button
2. **Rolling:** Grid of `DieCell` components with `animating` pulse effect
3. **Results:** Grid of final dice + total in large text (`fontSize: 72`) + "Roll Again" + "New Roll"

**Die grid layout (mirroring web):**

```ts
function getGridColumns(count: number): number {
  if (count === 1) return 1
  if (count <= 4) return 2
  if (count <= 6) return 3
  return 4
}
```

Render via `FlatList` with `numColumns={getGridColumns(count)}`.

**Font size requirement:** Total result display ≥ 48px logical pixels per PRD §4.

**`DieCell` component:**
- Square `View` with border and rounded corners
- Number displayed with `fontSize: 24`, bold, centered
- When `animating`: use `Animated.View` with `opacity` pulsing (alternate between 1 and 0.5 via `useSharedValue`)

---

## 9. Settings — `app/(tabs)/settings.tsx`

**Purpose:** View and update the saved server URL.

**No API calls** on mount — reads URL from `getServerUrl()` synchronously.

**State:**
- `editing: boolean` — toggles between display and edit mode
- `draftUrl: string` — URL input during edit
- `loading: boolean` — health check in progress
- `error: string | null` — validation error

**UI (display mode):**
- Section header: "Server"
- Row: "Server URL" label + current URL value
- "Edit" button on the right of the row

**UI (edit mode):**
- `TextInput` pre-filled with current URL (`autoCapitalize="none"`, `keyboardType="url"`, `autoCorrect={false}`)
- "Save" button + "Cancel" button
- Inline error text below input when `error` is set

**Save logic:** identical to Setup screen — health check against new URL → save + close editing if success → show error if fail.

---

## 10. Server Changes

### 10.1 New File: `server/src/routes/health.ts`

```ts
import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ status: 'ok' })
})

export default router
```

### 10.2 Modify: `server/src/index.ts`

Add the import and route registration before the existing API routes:

```ts
import healthRouter from './routes/health'
// ...
app.use('/api/health', healthRouter)
```

The `/api/health` route is intentionally outside the `/api/v1/` prefix. It is a meta-endpoint for connectivity probing and should not be versioned.

---

## 11. Root `package.json` Changes

Add to the `scripts` object:

```json
"dev:mobile": "npm run start --prefix mobile",
"install:all": "npm install && npm install --prefix server && npm install --prefix client && npm install --prefix mobile"
```

Replace the existing `install:all` script.

---

## 12. Shared Components

### 12.1 `components/CoverImage.tsx`

Props: `path: string | null`, `size: number | { width: number; height: number }`, `style?: ViewStyle`

Renders an `Image` with URI from `resolveAssetUrl(path)`. When `path` is null: renders a `View` with a `BookOpen` icon centered inside (placeholder). Handles `Image` `onError` by showing the placeholder.

### 12.2 `components/LoadingScreen.tsx`

Full-screen `View` centered. Renders `<ActivityIndicator size="large" color="#0f172a" />`.

### 12.3 `components/ErrorScreen.tsx`

Props: `message: string`, `onRetry: () => void`

Renders the error message and a "Retry" button. Centered `View`.

### 12.4 `components/GameRow.tsx`

Props: `game: Game`, `onPress: () => void`

Renders: `CoverImage` (48×48) + game name + player count string. Height ≥ 52pt. Used in Library and Log > Step 1.

### 12.5 `components/PlayerRow.tsx`

Props: `rank: number`, `name: string`, `totalPoints: number`, `onPress: () => void`

Renders: rank badge + name + points. Height ≥ 52pt. Used in Leaderboard.

---

## 13. Styling Conventions

No styling library (plain `StyleSheet`) per PRD §5.1.

**Colour tokens (slate palette):**

```ts
export const colors = {
  background: '#ffffff',
  foreground: '#0f172a',       // slate-900
  muted: '#f1f5f9',            // slate-100
  mutedForeground: '#94a3b8',  // slate-400
  border: '#e2e8f0',           // slate-200
  primary: '#0f172a',          // slate-900 (matches web dark primary)
  primaryForeground: '#ffffff',
  card: '#ffffff',
  destructive: '#ef4444',      // red-500
}
```

**Typography:**
- No custom fonts — system font (SF Pro on iOS, Roboto on Android)
- Headings: `fontSize: 22, fontWeight: '700'`
- Body: `fontSize: 15, fontWeight: '400'`
- Labels: `fontSize: 13, color: colors.mutedForeground`

**Tap targets:** All interactive elements: minimum `minHeight: 44, minWidth: 44`.

**Radius:** `borderRadius: 12` for cards/rows, `borderRadius: 8` for buttons and inputs.

---

## 14. Navigation Summary

```
app/_layout.tsx                    Root Stack
  ├── setup.tsx                    Setup screen (no server URL)
  └── (tabs)/_layout.tsx           Tab bar
        ├── (home)/_layout.tsx     Stack
        │     ├── index.tsx        Leaderboard
        │     └── player/[id].tsx  Player Profile
        ├── library/_layout.tsx    Stack
        │     ├── index.tsx        Game Library
        │     └── [id].tsx         Game Detail
        ├── log/_layout.tsx        Stack + LogSessionContext.Provider
        │     ├── index.tsx        Step 1: Pick Game
        │     ├── players.tsx      Step 2: Select Players
        │     └── results.tsx      Step 3: Record Results
        ├── tools/_layout.tsx      Stack
        │     ├── index.tsx        Tool Selector
        │     ├── timer.tsx        Timer
        │     ├── first-player.tsx Who Goes First?
        │     └── dice.tsx         Dice Roller
        └── settings.tsx           Settings (single screen, no stack needed)
```

---

## 15. Implementation Sequence

Build in this order to unblock testing at each phase.

### Phase 1 — Foundation (unblocks everything)
1. Initialize Expo project: `npx create-expo-app@latest mobile --template blank-typescript`
2. Install all dependencies (§2.2)
3. Configure `app.json`, `babel.config.js`, `tsconfig.json`
4. Implement `lib/types.ts`
5. Implement `lib/storage.ts`
6. Implement `lib/api.ts`
7. Implement `lib/points.ts`
8. Implement `app/_layout.tsx` (bootstrap)
9. Implement `app/setup.tsx` (server URL entry)
10. **Add `GET /api/health` to the server** (§10) — required before setup screen can validate

### Phase 2 — Tab Shell
11. Implement `app/(tabs)/_layout.tsx` with placeholder screens for all 5 tabs
12. Verify tab bar renders and navigation works

### Phase 3 — Leaderboard + Player Profile
13. Implement `components/LoadingScreen.tsx`, `components/ErrorScreen.tsx`
14. Implement `hooks/useApi.ts`
15. Implement `components/PlayerRow.tsx`
16. Implement `app/(tabs)/(home)/_layout.tsx` + `index.tsx`
17. Implement `app/(tabs)/(home)/player/[id].tsx`

### Phase 4 — Library
18. Implement `components/CoverImage.tsx`
19. Implement `components/GameRow.tsx`
20. Implement `app/(tabs)/library/_layout.tsx` + `index.tsx`
21. Implement `app/(tabs)/library/[id].tsx`

### Phase 5 — Log Session Flow
22. Implement `context/LogSessionContext.tsx`
23. Implement `app/(tabs)/log/_layout.tsx` (Stack + Provider + tab reset)
24. Implement `app/(tabs)/log/index.tsx` (Step 1)
25. Implement `app/(tabs)/log/players.tsx` (Step 2)
26. Implement `app/(tabs)/log/results.tsx` (Step 3 with DraggableFlatList)
27. Configure `react-native-toast-message` in root layout + `components/ToastConfig.tsx`

### Phase 6 — Tools
28. Copy `data/firstPlayerPrompts.ts` from web client
29. Implement `hooks/useTimer.ts` (port from web)
30. Implement `app/(tabs)/tools/_layout.tsx` + `index.tsx`
31. Implement `app/(tabs)/tools/timer.tsx`
32. Implement `app/(tabs)/tools/first-player.tsx`
33. Implement `app/(tabs)/tools/dice.tsx`

### Phase 7 — Settings
34. Implement `app/(tabs)/settings.tsx`

### Phase 8 — Finish
35. Update root `package.json` scripts (§11)
36. End-to-end test all flows against a running server
37. Verify safe area on iPhone with notch and Android with navigation bar

---

## 16. Out of Scope (v10)

Everything in PRD §7. In addition, not implemented in this ERD:

- No `score` field on session results — the server calculates points from rank; the mobile sends only ranks
- No add/edit/delete for games or players
- No avatar upload from mobile
- No BGG import
- No per-game leaderboard filtering (global leaderboard only)
- No landscape orientation layout
- No App Store submission steps

---

*End of Document*
