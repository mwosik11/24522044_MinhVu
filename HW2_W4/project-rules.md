# project-rules.md — Lab 4 HW2: Card-Swipe Deck ('Hen Ho Nhung Khong Yeu')

> AI assistants MUST read this file before proposing any change.

## 1. Stack
- Client: React 19 + Vite + React Router v7, JavaScript (`.jsx`). No UI libraries.
- Server: Node 22, Express 5, Mongoose 8, ES modules, async/await only.
- Tests: Vitest + Testing Library (client), Vitest + supertest + mongodb-memory-server (server).

## 2. Banned APIs
| Banned | Use instead |
|---|---|
| Mongoose callbacks, `.exec(cb)`, `mongoose.connect(uri, { useNewUrlParser, useUnifiedTopology })` | `await` + plain `mongoose.connect(uri)` |
| Hard-coded connection strings | `process.env.MONGODB_URI` + fail-fast guard |
| `Model.create(req.body)` | Whitelist fields first (no mass assignment) |
| `res.status(500).json({ error: err.stack })` | Central error handler, no stack traces |
| `e.keyCode`, `keypress`, `onTouchStart` + `onMouseDown` duplicates | `keydown` + `e.key`, Pointer Events |
| `<div onClick>` / swipe-only interactions | Real `<button>`s for every gesture |
| `window.alert()` | `role="alert"` / `aria-live` regions |
| Class components, `defaultProps`, `<Switch>` | Function components, default params, Router v7 |

## 3. State rules
1. The swipe **history array is the LIFO undo stack**: push on swipe, pop on undo. Managed by a pure reducer.
2. **Score, stats, current card and remaining deck are derived** from the history during render — never stored in `useState`, never synced with `useEffect`.
3. `useEffect` only for external systems (fetch, `window` listeners); every fetch has an `AbortController`.
4. Optimistic UI: update the stack first, persist second, roll back on failure with a visible message.

## 4. Accessibility (WCAG 2.2 AA)
- Every swipe has a keyboard (← → ↑ Backspace) **and** a button alternative (2.5.1, 2.5.7).
- Decisions are announced via an `aria-live="polite"` region.
- Contrast ≥ 4.5:1, focus visible, targets ≥ 24×24 px, `prefers-reduced-motion` respected.

## 5. Git
- Conventional commits, one concern per commit, minimum 10 commits.
- Never commit `.env` — only `server/.env.example`.