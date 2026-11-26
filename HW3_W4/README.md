# Lab 4 · HW3 — Full-Stack Esports Fair-Play Appeal Tribunal

Case study: players **Himass** and **TanVuu** received fair-play sanctions. The tribunal app
lets them review each sanction against published guidelines (disproportionality matrix) and
file an appeal before a server-enforced SLA deadline.

## Stack
React 19 · React Router v7 · Vite — Express 5 · Mongoose 8 · MongoDB — `shared/` ES modules
used by both sides — Vitest · Testing Library · supertest · mongodb-memory-server

## Quick start
Requirements: Node 22+, a running MongoDB.
```bash
npm run install:all
cp server/.env.example server/.env   # set MONGODB_URI; MONGOMS_SYSTEM_BINARY=$(which mongod) for fast tests
npm run seed                         # Himass: ~47 h left · TanVuu: ~50 min left (urgent)
npm run dev                          # API :4100 + client :5173 (proxy /api)
npm test                             # server 27 · client 31
```
Re-run `npm run seed` to reset deadlines and remove filed appeals.

## Requirements → implementation
| Requirement | Where |
|---|---|
| Dynamic dossier routing `/dossier/:playerID` (+ nested `/appeal`) | `client/src/routes.jsx`, `pages/DossierPage.jsx`, `pages/AppealPage.jsx` |
| Context form engine, real-time validation | `client/src/form/FormContext.jsx`, `form/fields.jsx` |
| Client/server validation parity | `shared/appealRules.js` imported by `AppealPage` and `server/src/routes/dossiers.js` |
| Disproportionality derived matrix (`useMemo`) | `shared/matrix.js`, `DossierPage.jsx`, `components/MatrixTable.jsx` |
| Zero-drift SLA countdown + Page Visibility resync | `client/src/hooks/useAppealSlaTimer.js`, `hooks/useServerClock.js` |
| AbortController on fast dossier switching | `client/src/hooks/useDossier.js` |
| Server-enforced deadline (410) | `server/src/routes/dossiers.js` |

## Matrix formula
`expected = round(guideline days × evidence strength)`, `ratio = sanction / expected`;
ratio > 1.25 → **EXCESSIVE**, < 0.75 → **LENIENT**, otherwise **PROPORTIONATE**.

## API
| Method | Path | Result |
|---|---|---|
| GET | `/api/time` | `{ now }` server clock |
| GET | `/api/players` | sidebar list |
| GET | `/api/dossiers/:playerId` | player, case, appeal |
| POST | `/api/dossiers/:playerId/appeals` | 201 · 400 (shared rules) · 404 · 409 · 410 |

## Documentation
- `project-rules.md` — hard constraints
- `TASK_DECOMPOSITION.md` — contracts, WBS, commit map
- `AI_FAILURE_AUDIT.md` — six AI/design defects with evidence and fixes