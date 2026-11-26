# Lab 4 · HW2 — Full-Stack Card-Swipe Deck: "Dating Without Love"

Swipe through fictional situationship profiles with mouse, touch, keyboard or buttons.
Every decision is saved to MongoDB, can be undone in LIFO order, and feeds an asymmetric
score (LIKE +10, NOPE −5, FRIENDZONE −5) that is **derived**, never stored.

## Stack
React 19 · React Router v7 · Vite — Express 5 · Mongoose 8 · MongoDB — Vitest · Testing Library · supertest

## Quick start
Requirements: Node 22+, a running MongoDB (local, Docker or Atlas).
```bash
npm run install:all                 # root + server + client
cp server/.env.example server/.env  # then edit MONGODB_URI if needed
npm run seed                        # 8 demo profiles
npm run dev                         # API :4000 + client :5173 (proxy /api)
npm test                            # server (12) + client (30)
```
For fast server tests, set `MONGOMS_SYSTEM_BINARY` in `server/.env` to the output of `which mongod`.

## Controls
| Input | Action | Score |
|---|---|---|
| → · drag right · "Like" | LIKE | +10 |
| ← · drag left · "Nope" | NOPE | −5 |
| ↑ · drag up · "Friendzone" | FRIENDZONE | −5 |
| Backspace · "Undo" | undo last swipe (LIFO) | reverts |

## REST API
| Method | Path | Result |
|---|---|---|
| GET | `/api/profiles` | deck ordered by `order` |
| GET | `/api/swipes?sessionId=<uuid>` | session history |
| POST | `/api/swipe` | 201 · 400 invalid · 404 unknown profile · 409 duplicate |
| DELETE | `/api/swipe/:clientId?sessionId=<uuid>` | 204 (idempotent) |

## Architecture
```
client/src/
  lib/swipeLogic.js        pure reducer (LIFO stack) + score/stats selectors
  hooks/useSwipeSession.js optimistic POST/DELETE, rollback, undo race guard, hydration
  hooks/useSwipeGesture.js Pointer Events with capture + threshold
  hooks/useKeyboardSwipe.js window keydown via useEffectEvent
  hooks/useProfiles.js     fetch with AbortController + status machine
  context/DeckContext.jsx  one session shared by Deck and Matches routes
server/src/
  app.js                   createApp() — testable without listening
  routes/, models/, middleware/errorHandler.js
```

## Documentation
- `project-rules.md` — hard constraints
- `TASK_DECOMPOSITION.md` — API/state contracts, WBS, commit map
- `AI_FAILURE_AUDIT.md` — six AI defects with evidence and fixes