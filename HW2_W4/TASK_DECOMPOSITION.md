# TASK_DECOMPOSITION.md — Lab 4 HW2: Full-Stack Interactive Card-Swipe Deck

## 0. Assignment (Lab 4, slides 20, 31, 32)
1. **Dual keyboard / pointer event listener** for the swipe queue on every device.
2. **LIFO undo stack** restoring swiped cards in sequence.
3. **Asymmetric score** computed purely as derived state (LIKE +10, everything else −5).
4. **Full-stack persistence**: Express + Mongoose 8 with async/await models.

## 1. Contract

### 1.1 Input mapping
| Input | Direction | Action | Score |
|---|---|---|---|
| → / drag right > 80px / "Like" button | `right` | `LIKE` | +10 |
| ← / drag left > 80px / "Nope" button | `left` | `NOPE` | −5 |
| ↑ / drag up > 80px / "Friendzone" button | `up` | `FRIENDZONE` | −5 |
| Backspace / "Undo" button | — | pop last entry | reverts |

### 1.2 REST API (`/api`)
| Method & path | Body / query | Success | Errors |
|---|---|---|---|
| `GET /health` | — | 200 `{ ok: true }` | — |
| `GET /profiles` | — | 200 `Profile[]` ordered by `order` | 500 |
| `GET /swipes?sessionId=<uuid>` | — | 200 `Swipe[]` oldest first | 400 bad sessionId |
| `POST /swipe` | `{ clientId, sessionId, profileSlug, action }` | 201 `Swipe` | 400 invalid · 404 unknown profile · 409 duplicate |
| `DELETE /swipe/:clientId?sessionId=<uuid>` | — | 204 (idempotent) | 400 bad sessionId |
| anything else | — | — | 404 JSON |

### 1.3 Data contract
```js
// Profile
{ slug: 'minh-anh', name: 'Minh Anh', age: 24, city: 'Ho Chi Minh City',
  bio: '...', greenFlags: ['...'], redFlags: ['...'], order: 1 }

// Swipe — one decision per profile per session (unique index)
{ clientId: '<uuid from crypto.randomUUID()>', sessionId: '<uuid in localStorage>',
  profileSlug: 'minh-anh', action: 'LIKE' | 'NOPE' | 'FRIENDZONE', createdAt }
```

### 1.4 Client state contract
```js
state = { history: SwipeEntry[] }   // the LIFO stack — the ONLY stored state
// derived every render:
remaining = profiles − decided slugs     current = remaining[0]
score     = Σ SCORE_RULES[entry.action]  stats   = count per action
```
Reducer events: `HYDRATE`, `SWIPE`, `UNDO`, `ROLLBACK_SWIPE`, `RESTORE_ENTRY`.

### 1.5 Persistence flow
1. Swipe → dispatch `SWIPE` (instant UI) → `POST /swipe`. Failure → `ROLLBACK_SWIPE` + alert.
2. Undo → dispatch `UNDO` → **wait for that entry's pending POST** → `DELETE`. Failure → `RESTORE_ENTRY` + alert.
3. Page load → `GET /swipes?sessionId` → `HYDRATE` (refresh keeps progress).

## 2. WBS → Commit map
| Task | Commit |
|---|---|
| T-00 Root scripts | `chore: scaffold monorepo root ...` |
| T-01 Contracts (this file) | `docs(contract): ...` |
| T-02 Server scaffold + env guard | `chore(server): ...` |
| T-03 Models + seed | `feat(server): add Profile and Swipe models ...` |
| T-04 Failing API tests | `test(server): ...` |
| T-05 Routes + error handler | `feat(server): implement ...` |
| T-06 Client scaffold + proxy | `chore(client): ...` |
| T-07 Failing logic tests | `test(client): add failing specs ...` |
| T-08 Reducer + selectors | `feat(client): implement swipe reducer ...` |
| T-09 API client + useProfiles | `feat(client): add API client ...` |
| T-10 useSwipeSession | `feat(client): add useSwipeSession ...` |
| T-11 Gesture + keyboard hooks | `feat(client): add pointer gesture ...` |
| T-12 UI + routes | `feat(client): add deck UI ...` |
| T-13 Integration tests | `test(client): add integration specs ...` |
| T-14 Styles | `style(client): ...` |
| T-15 Audit + README | `docs: ...` |

## 3. Definition of Done
- [ ] `npm test` green in `server/` and `client/`.
- [ ] Swipe with mouse, touch (DevTools device mode), keyboard and buttons.
- [ ] Undo restores cards in reverse order; refresh keeps progress (data in MongoDB).
- [ ] Stop the server → swipe → card comes back with an error message (rollback).
- [ ] Console: 0 errors/warnings. 375px without horizontal scroll.