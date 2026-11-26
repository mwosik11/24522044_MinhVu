# project-rules.md — Lab 4 HW3: Esports Fair-Play Appeal Tribunal

> AI assistants MUST read this file before proposing any change.

## 1. Stack
- Client: React 19 + Vite + React Router v7 (`.jsx`). No UI or form libraries.
- Server: Node 22, Express 5, Mongoose 8, ES modules, async/await only.
- `shared/`: pure ES modules imported by BOTH client and server (validation parity).
- Tests: Vitest (+ Testing Library on the client, supertest + mongodb-memory-server on the server).

## 2. Banned
| Banned | Use instead |
|---|---|
| Hard-coded routes per player (`/dossier/himass`) | One dynamic route `/dossier/:playerID` + `useParams` |
| `useEffect` chains to validate forms | Synchronous validation during render inside a Context provider |
| One `useId()` shared by every field | One `useId()` per field component |
| `setInterval(() => setSeconds(s => s - 1), 1000)` countdowns | Remaining time = `deadline − (Date.now() + serverOffset)` on every tick |
| `visibilitychange` listener without cleanup | Add/remove inside the same effect |
| Duplicated validation rules in client and server | Import from `shared/appealRules.js` |
| `Model.create(req.body)`, hard-coded Mongo URI, Mongoose callbacks | Whitelist fields, `process.env.MONGODB_URI`, async/await |
| `window.alert()`, `e.keyCode`, class components, `<Switch>` | `role="alert"`, `e.key`, function components, Router v7 |

## 3. State rules
1. Server data (players, dossier) is fetched by custom hooks with an `AbortController`; switching dossiers aborts the in-flight request.
2. The disproportionality matrix is **derived** from the dossier with `useMemo` — never stored.
3. Form errors and validity are **derived** from values during render — never stored in state.
4. The SLA timer stores only a "now" tick; remaining time is always recomputed from absolute timestamps.

## 4. Accessibility (WCAG 2.2 AA)
- Every input has a `<label>` bound through `useId()`; errors use `aria-invalid` + `aria-describedby`.
- Errors appear after a field is touched or after a submit attempt; submit summary uses `role="alert"`.
- The countdown is NOT a live region (no announcement every second); urgency changes are announced once.
- Contrast ≥ 4.5:1, visible focus, targets ≥ 24×24 px, reduced motion respected.

## 5. Git
- Conventional commits, minimum 10 commits, use `git add .` inside this folder only.
- Never commit `.env` — only `server/.env.example`.