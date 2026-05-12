# Product Requirements Document
## Mobile Client — Tally v10

**Version:** v10
**Status:** Draft
**Last Updated:** 2026-05-11

---

## 1. Overview

### 1.1 Product Summary

Tally v10 introduces a native mobile client built with React Native (Expo). The mobile app connects to the same self-hosted Express.js backend that already powers the web client, adding no new server infrastructure. It targets the core at-the-table use cases — logging sessions, browsing the leaderboard, and running the in-game tools — in a native mobile experience optimised for a phone held in one hand around a game table.

The mobile app lives in a new top-level `mobile/` directory alongside the existing `client/` and `server/` directories.

### 1.2 Why a dedicated mobile client

The existing web client is already mobile-responsive, so this is worth justifying. The web client is excellent for setup work done in advance (adding games, editing player profiles, uploading BGG data). But at the table, the experience matters more: native scroll physics, tap targets sized for a phone, the tools running without a browser address bar eating screen space, and the app launching instantly from the home screen. These are things a web client cannot match regardless of how well it's tuned. The shared backend means there is no data duplication and no sync problem — both clients read and write the same SQLite database.

### 1.3 Goals

- Deliver a native mobile experience for the highest-value at-the-table flows: logging a session, checking the leaderboard, and running the tools.
- Connect to the user's existing self-hosted Tally server without any new backend work.
- Mirror the web app's visual identity closely enough that switching between clients feels natural.
- Keep scope tight — the web client remains the primary interface for library management and settings.

### 1.4 Non-Goals

- No new backend routes, database schema changes, or server-side logic.
- No assumption about distribution channel — the app is designed to work via Expo Go, a local development build, or App Store / Google Play submission. App Store submission is not in scope for v10 but the architecture does not preclude it.
- No offline mode — the app requires an active connection to the Tally server.
- No push notifications.
- No adding or editing games from mobile — the library is read-only in this version.
- No BGG data import or settings management from mobile.
- No authentication — Tally has no auth layer; the mobile app inherits the same trust model.

---

## 2. User Stories

### Setup & Connection

1. As a new user, I want to enter my Tally server URL on first launch, so that the app knows where to connect.
2. As a user, I want the app to validate the URL and show a clear error if it can't reach the server, so that I can fix connection issues before entering the app.
3. As a user, I want the app to remember my server URL between launches, so that I don't have to re-enter it every time.
4. As a user, I want a way to change the server URL from within the app, so that I can reconnect to a different server if I move my setup.

### Session Logging

5. As a player at the table, I want to start a new session by picking a game from my library, so that I can begin logging immediately.
6. As a player, I want to search my game library by name when starting a session, so that I can find my game quickly without scrolling through the full list.
7. As a player, I want to select which players are participating in the session, so that the right people appear in the results.
8. As a player, I want to rank the players by finish position at the end of the session, so that scores are recorded correctly.
9. As a player, I want to optionally record each player's raw point score alongside their finish position, so that games with explicit scoring are logged accurately.
10. As a player, I want to see a live preview of the Tally points each player will earn before I confirm, so that the group agrees on the result before it's locked in.
11. As a player, I want to submit the session with a single tap after confirming, so that logging is fast and doesn't interrupt the next game.
12. As a player, I want a success confirmation after submitting, so that I know the session was saved.

### Leaderboard

13. As a player, I want to see the global leaderboard on the home screen, so that the standings are the first thing I see when I open the app.
14. As a player, I want to see each player's rank, name, and total Tally points on the leaderboard, so that I can read the standings at a glance.
15. As a player, I want to tap a player on the leaderboard to see their profile, so that I can drill into their individual stats.
16. As a player, I want to see a player's win count, session count, and per-game breakdown on their profile, so that I can see how they've performed across different games.

### Library

17. As a player, I want to browse my game library from the mobile app, so that I can reference game details at the table.
18. As a player, I want to search the library by name, so that I can find a specific game quickly.
19. As a player, I want to tap a game to see its detail page — player count, cover image, and recent sessions — so that I have the game's key information at hand without opening the web app.

### Tools

20. As a player, I want access to all three tools (Timer, Who Goes First?, Dice Roller) from the mobile app, so that I can use them without switching to a browser.
21. As a player, I want the tools to look and behave identically to the web versions, so that there's no learning curve when switching clients.

---

## 3. Features & Requirements

### 3.1 Server Configuration (Onboarding)

The first-run experience for a new install.

**Requirements:**

- On first launch (no saved server URL), show a full-screen setup screen asking for the Tally server URL.
- URL field with a "Connect" button. On submit, make a lightweight health-check request to the server (e.g. `GET /api/health` or any existing endpoint that returns 200).
- If the server responds: save the URL to device storage and proceed to the main app.
- If the server does not respond or returns an error: show an inline error message ("Could not reach the server — check the URL and try again."). Do not proceed.
- Once inside the app, a "Server" entry in the Settings tab allows the user to view and update the saved URL. Changing the URL repeats the same validation flow.

---

### 3.2 Navigation Structure

**Requirements:**

- Bottom tab bar with four tabs: **Home** (Leaderboard), **Library**, **Log Session**, **Tools**.
- **Log Session** tab is the session-logging flow (stack navigator inside the tab).
- Tapping "Log Session" always starts a fresh session — no draft state is preserved between taps.
- **Tools** tab contains a tool selector screen that navigates to each tool (stack navigator inside the tab).
- A fifth tab **Settings** holds only the server URL configuration.
- Standard back navigation (hardware back / swipe gesture) works correctly within each tab's stack.

---

### 3.3 Leaderboard (Home Tab)

**Requirements:**

- Full-page list of all players ranked by total Tally points, descending.
- Each row: rank number, player name, total points.
- Pull-to-refresh to reload.
- Tapping a row navigates to that player's profile screen (same data as the web `PlayerProfile` page).
- Empty state: "No sessions logged yet." if there are no sessions.

---

### 3.4 Library Tab

**Requirements:**

- Searchable list of all games in the library, sorted alphabetically by default.
- Each row: game cover image (thumbnail), game name, player count range.
- Tapping a game navigates to a game detail screen showing: cover image, name, year, player count, and the five most recent sessions that included this game.
- No add, edit, or delete actions — read-only.
- Pull-to-refresh on both the list and the detail screen.
- Empty state: "Your library is empty. Add games from the web app."

---

### 3.5 Log Session Flow (Log Session Tab)

A three-step flow, each step on its own screen within the tab's stack navigator.

#### Step 1 — Pick a Game

- Searchable list of games from the library (same data as Library tab, different purpose).
- Tapping a game advances to Step 2 with that game selected.
- A "Cancel" button in the header discards the session and returns to the tab root (which also shows Step 1 — so effectively a reset).

#### Step 2 — Select Players

- List of all players with a checkbox next to each name.
- At least 2 players must be selected to proceed (the "Next" button is disabled otherwise, with an inline note: "Select at least 2 players.").
- A "Back" button returns to Step 1.

#### Step 3 — Record Results

- Shows the selected players in a ranked list (position 1 at top). Players can be reordered by dragging a handle on each row.
- Each player row has an optional numeric input for their raw score (blank = no score recorded).
- Below the ranked list, a live preview shows the Tally points each player will earn, recalculating on every reorder.
- A "Submit" button at the bottom. On tap: POST to the sessions endpoint, show a loading state on the button, then on success show a brief toast ("Session logged!") and reset the flow back to Step 1.
- On error: show a toast ("Something went wrong — try again.") and remain on Step 3.

---

### 3.6 Tools Tab

**Requirements:**

- Tool selector screen lists the three tools: **Timer**, **Who Goes First?**, **Dice Roller**. Each is a card with its icon and a one-line description — mirrors the web Tools hub.
- Tapping a card navigates to that tool's screen.
- Each tool screen is a self-contained React Native port of the corresponding web page component, preserving all interaction behaviour described in the v7–v9 PRDs:
  - **Timer** — countdown timer with configurable duration, play/pause/reset.
  - **Who Goes First?** — slot-machine animation landing on a random prompt.
  - **Dice Roller** — die picker, count stepper, animated roll, results display.
- No changes to the tool logic; the ports translate Tailwind + shadcn/ui to React Native StyleSheet equivalents.

---

### 3.7 Settings Tab

**Requirements:**

- Single screen with one section: **Server**.
  - Displays the currently saved server URL.
  - An "Edit" button (or tapping the URL row) opens an inline edit field with a "Save" button that re-runs the health-check validation before accepting the new URL.
- No other settings in v10.

---

## 4. UI/UX Guidelines

- **Visual identity:** Match the web app's neutral palette (white backgrounds, slate text, subtle borders). Use the same colour tokens wherever possible so the two clients feel like siblings.
- **Typography:** System font (SF Pro on iOS, Roboto on Android). Same type scale relationships as the web app — headings bold and large, body text comfortable at arm's length.
- **Tap targets:** Minimum 44×44pt per Apple HIG / Android guidelines. Row items in lists should be at least 52pt tall.
- **Tools legibility:** The tools are designed to be read from across a table. Minimum font sizes from the web PRDs (≥ 32px for results, ≥ 48px for totals) apply equally to the native ports, measured in logical pixels.
- **Loading states:** All data-fetching screens show a spinner (ActivityIndicator) centred on screen while the initial load is in flight. Pull-to-refresh handles subsequent refreshes.
- **Error states:** Network errors show an inline message with a "Retry" button rather than crashing or showing an empty list.
- **No modal dialogs:** Confirmations and errors use toasts (brief, non-blocking) rather than modal alerts, consistent with the web client's use of Sonner.
- **Safe area:** Respect iOS and Android safe areas throughout (status bar, home indicator, notch).
- **Drag-to-reorder in Step 3:** Use a long-press handle (three horizontal lines) on the right side of each player row. Dragging the row reorders the list and instantly recalculates the points preview.

---

## 5. Technical Considerations

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | React Native via Expo (managed workflow) | Expo simplifies builds and OTA updates; managed workflow is sufficient for this feature set |
| Language | TypeScript | Same as server and client |
| Navigation | Expo Router v4 (file-based routing, built on React Navigation) | Modern Expo default; tab and stack layouts defined by directory structure |
| Styling | React Native StyleSheet | Plain StyleSheet for v10 — no additional build steps |
| Icons | `lucide-react-native` | Same icon vocabulary as the web client's `lucide-react` |
| HTTP | Native `fetch` | Same pattern as the web client — no new data-fetching library |
| Storage | `expo-secure-store` or `AsyncStorage` | For persisting the server URL between launches |
| Drag-to-reorder | `react-native-reanimated` + `react-native-gesture-handler` | Required by React Navigation anyway; `DraggableFlatList` or a hand-rolled gesture suffices |
| Toasts | `react-native-toast-message` | Lightweight, similar role to Sonner in the web client |

### 5.2 Project Structure

```
tally/
├── client/          # Existing React + Vite web client
├── server/          # Existing Express.js API
├── mobile/          # New — React Native (Expo) mobile client
│   ├── app/                        # Expo Router file-based routes
│   │   ├── (tabs)/                 # Bottom tab layout
│   │   │   ├── _layout.tsx         # Tab bar definition
│   │   │   ├── index.tsx           # Leaderboard (Home)
│   │   │   ├── library/            # Library tab stack
│   │   │   ├── log/                # Log Session tab stack
│   │   │   ├── tools/              # Tools tab stack
│   │   │   └── settings.tsx        # Settings tab
│   │   ├── setup.tsx               # First-run server URL screen
│   │   └── _layout.tsx             # Root layout
│   ├── components/                 # Shared UI primitives
│   ├── hooks/                      # Data-fetching hooks
│   ├── lib/                        # API client, storage helpers
│   ├── package.json
│   └── app.json                    # Expo config
└── package.json     # Root — add mobile to dev/install scripts
```

The root `package.json` scripts should be extended to include the mobile project:

```json
"dev:mobile": "npm run start --prefix mobile",
"install:all": "npm install && npm install --prefix server && npm install --prefix client && npm install --prefix mobile"
```

### 5.3 API Client

The mobile app talks to the existing server API. A thin API client module (`mobile/lib/api.ts`) wraps `fetch`, prefixing every request with the saved server URL. This is the only mobile-specific infrastructure needed — no new server routes.

```ts
// Conceptual shape
const api = {
  get: (path: string) => fetch(`${serverUrl}${path}`).then(r => r.json()),
  post: (path: string, body: unknown) => fetch(`${serverUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json()),
}
```

### 5.4 Server Health Check

The server does not currently have a `/api/health` endpoint. A new `GET /api/health` route will be added, returning `{ status: 'ok' }`. The mobile app uses this as its connection probe during onboarding and server URL changes.

### 5.5 Data Models

No new data models. The mobile app consumes the same API responses as the web client. Response shapes are defined by the existing server routes and are not modified.

The session POST payload for Step 3 must match the existing `/api/sessions` contract exactly — same field names, same ranking structure.

### 5.6 Key Constraints & Decisions

- **Self-hosted URL discovery:** The user must know their server's local IP or hostname. No mDNS/Bonjour discovery in v10 — a simple URL input is sufficient for the target audience (people who self-host).
- **No auth:** The app sends no credentials. The server trusts all requests, same as the web client accessed on the local network.
- **Expo managed workflow:** Avoids native code — no Xcode or Android Studio required for the initial build. If native modules are needed in future versions, ejecting to a bare workflow is always available.
- **No shared code between client and mobile:** The web client uses browser APIs (Tailwind, Vite, React DOM) that are incompatible with React Native. Sharing code would require a monorepo transform layer. In v10, the mobile app duplicates the API-fetching logic — this is acceptable given the small surface area.
- **Read-only library:** Adding/editing games involves file uploads (cover images, rulebook PDFs) which are awkward on mobile. The web client handles this well; duplicating it in mobile is not worth the scope increase in v10.

### 5.7 Modules to Build

| Module | Type | Notes |
|---|---|---|
| `mobile/` | New project | Expo managed workflow, initialised with `npx create-expo-app` |
| `mobile/lib/api.ts` | New | Thin fetch wrapper, reads server URL from storage |
| `mobile/lib/storage.ts` | New | AsyncStorage/SecureStore wrapper for server URL persistence |
| `mobile/screens/Setup.tsx` | New | First-run server URL entry and validation |
| `mobile/screens/Leaderboard.tsx` | New | Global rankings list |
| `mobile/screens/PlayerProfile.tsx` | New | Per-player stats |
| `mobile/screens/Library.tsx` | New | Searchable game list |
| `mobile/screens/GameDetail.tsx` | New | Game detail — cover, info, recent sessions |
| `mobile/screens/LogSession/PickGame.tsx` | New | Step 1 of log flow |
| `mobile/screens/LogSession/SelectPlayers.tsx` | New | Step 2 of log flow |
| `mobile/screens/LogSession/RecordResults.tsx` | New | Step 3 with drag-to-reorder and live points preview |
| `mobile/screens/Tools.tsx` | New | Tool selector screen |
| `mobile/screens/Timer.tsx` | New | Native port of Timer tool |
| `mobile/screens/FirstPlayer.tsx` | New | Native port of Who Goes First? tool |
| `mobile/screens/Dice.tsx` | New | Native port of Dice Roller tool |
| `mobile/screens/Settings.tsx` | New | Server URL management |
| `mobile/app/_layout.tsx` | New | Root Expo Router layout |
| `mobile/app/(tabs)/_layout.tsx` | New | Bottom tab bar definition |
| `server/src/routes/health.ts` | New (server) | `GET /api/health` returning `{ status: 'ok' }` |
| `server/src/index.ts` | Modify (server) | Register the health route |
| Root `package.json` | Modify | Add `dev:mobile` and update `install:all` |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| App launch to interactive | < 2 seconds on a mid-range device (2022+) |
| Leaderboard load time | < 1 second on a local network connection |
| Session submission | < 2 seconds round-trip on a local network connection |
| Tool animation start latency | < 50ms from tap (same as web target — all logic is client-side) |
| Minimum iOS version | iOS 16 |
| Minimum Android version | Android 10 (API 29) |
| Orientation | Portrait-only for session logging and tools; portrait preferred throughout |
| Accessibility | Minimum: all interactive elements have accessible labels; tap targets ≥ 44pt |

---

## 7. Out of Scope (v10)

- Adding, editing, or deleting games from mobile.
- BGG data import from mobile.
- Player management (adding/editing/deleting players) from mobile.
- Settings beyond server URL.
- App Store / Google Play submission and review process (not in scope for v10, but the architecture supports it).
- Offline caching or background sync.
- Push notifications.
- Biometric lock or any auth layer.
- iPad layout optimisation (phone-first; iPad will work but may look stretched).
- Per-game leaderboard filtering from mobile (global leaderboard only in v10).
- Mixed-device session logging (web + mobile simultaneously).

---

## 8. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | ~~Should the mobile app use Expo Router (file-based routing) or a manual React Navigation setup?~~ Resolved: **Expo Router**. | Engineering | Resolved |
| 2 | ~~Is NativeWind the right styling choice?~~ Resolved: **plain React Native StyleSheet** for v10. Can revisit NativeWind in a future version. | Engineering | Resolved |
| 3 | ~~Should the server health-check endpoint be `GET /api/health` (new) or piggyback on an existing endpoint?~~ Resolved: **new `GET /api/health` endpoint** returning `{ status: 'ok' }`. | Engineering | Resolved |
| 4 | ~~Does the drag-to-reorder in Step 3 need to feel identical to the web's dnd-kit implementation?~~ Resolved: **native drag handle** (three-line handle on each row, drag to reorder — no long-press required). | Product | Resolved |
| 5 | ~~What icon set should the mobile app use?~~ Resolved: **`lucide-react-native`** — same icon vocabulary as the web client. | Design | Resolved |

---

*End of Document*
