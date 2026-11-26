# TASK_DECOMPOSITION.md — Lab 4 HW3: Full-Stack Esports Fair-Play Appeal Tribunal

## 0. Assignment (Lab 4, slides 21 & 33)
1. **Multi-route dossier navigation**: dynamic player case routing via `/dossier/:playerID`.
2. **Appeal form engine**: context-driven form with real-time field validation.
3. **Zero-drift SLA countdown**: `useAppealSlaTimer()` synchronised against the system clock delta, re-synced on `visibilitychange`.
4. **Disproportionality derived matrix**: `useMemo(() => computeMatrix(dossier), [dossier])`.
5. **Post-mortem**: `AI_FAILURE_AUDIT.md`.

## 1. Contract

### 1.1 Client routes
| Path | Element | Notes |
|---|---|---|
| `/` | `TribunalLayout` → `OverviewPage` | Sidebar of players (`NavLink`), `<Outlet>` |
| `/dossier/:playerID` | `DossierPage` | Case summary, SLA timer, matrix, `<Outlet>` |
| `/dossier/:playerID/appeal` | `AppealPage` (nested) | Appeal form |
| unknown `playerID` | `DossierPage` 404 state | `role="alert"`, link back |
| `*` | `NotFoundPage` | |

### 1.2 REST API (`/api`)
| Method & path | Success | Errors |
|---|---|---|
| `GET /health` | 200 `{ ok }` | |
| `GET /time` | 200 `{ now: <epoch ms> }` | |
| `GET /players` | 200 `[{ playerId, handle, team }]` | |
| `GET /dossiers/:playerId` | 200 `{ player, case, appeal \| null }` | 404 |
| `POST /dossiers/:playerId/appeals` | 201 appeal | 400 invalid (same rules as client) · 404 · 409 already appealed · 410 SLA expired |

### 1.3 Data contract
```js
Player { playerId: 'himass', handle: 'Himass', realName, team, game, role }
Case   { playerId, caseRef: 'FP-2026-0417', verdictAt, appealDeadline: ISODate,
         violations: [{ code: 'V1', type: 'aim-assist', matchId, evidenceStrength: 0..1, sanctionDays }] }
Appeal { playerId, caseRef, email, grounds, contestedCodes: ['V1'], statement, evidenceUrl, acknowledged, createdAt }
```

### 1.4 Disproportionality matrix (`shared/matrix.js`)
```
expectedDays = round(GUIDELINES[type].baseDays × evidenceStrength)
ratio        = sanctionDays / expectedDays          (expectedDays = 0 → ratio null, verdict UNSUPPORTED)
verdict      = ratio > 1.25 → EXCESSIVE · ratio < 0.75 → LENIENT · otherwise PROPORTIONATE
rows sorted by ratio desc; totals = { sanctionDays, expectedDays, ratio, excessiveCodes }
```

### 1.5 Appeal rules (`shared/appealRules.js`, used by client AND server)
| Field | Rule |
|---|---|
| `email` | required, valid e-mail |
| `grounds` | one of `false-positive`, `disproportionate-sanction`, `procedural-error` |
| `contestedCodes` | ≥ 1, each must exist in the case |
| `statement` | 50–1000 characters (trimmed) |
| `evidenceUrl` | optional, must be `https://` |
| `acknowledged` | must be `true` |
| **cross-field** | `disproportionate-sanction` → at least one contested code must be EXCESSIVE |
| **cross-field** | `false-positive` → `evidenceUrl` required |

### 1.6 SLA timer contract
```js
const sla = useAppealSlaTimer(deadline, { offsetMs, onResync });
// → { remainingMs, days, hours, minutes, seconds, isExpired, isUrgent /* < 1 h */ }
```
- Stores only `now`; `remainingMs = max(0, deadline − (Date.now() + offsetMs))`.
- Next tick scheduled with `setTimeout` aligned to the next second boundary (no accumulated drift).
- `visibilitychange` → visible: recompute immediately and call `onResync()` (re-measure server offset).
- `useServerClock()` measures `offsetMs = serverNow − (t0 + rtt / 2)` via `GET /api/time`.

## 2. WBS → Commit map
| Task | Commit |
|---|---|
| T-00 Root | `chore: scaffold monorepo root ...` |
| T-01 Contracts | `docs(contract): ...` |
| T-02 Server scaffold + /time | `chore(server): ...` |
| T-03 Failing shared tests | `test(shared): ...` |
| T-04 Shared matrix + rules | `feat(shared): ...` |
| T-05 Models + seed | `feat(server): add Player, Case and Appeal models ...` |
| T-06 Failing API tests | `test(server): ...` |
| T-07 Routes | `feat(server): implement dossier and appeal routes ...` |
| T-08 Client scaffold | `chore(client): ...` |
| T-09 Failing timer tests | `test(client): add failing specs for zero-drift SLA timer` |
| T-10 Clock + timer hooks | `feat(client): implement useServerClock and useAppealSlaTimer` |
| T-11 API + data hooks | `feat(client): add API client and dossier hooks ...` |
| T-12 Form engine | `feat(client): add context-driven appeal form engine` |
| T-13 UI + routes | `feat(client): add tribunal layout ...` |
| T-14 Integration tests | `test(client): add integration specs ...` |
| T-15 Styles | `style(client): ...` |
| T-16 Audit + README | `docs: ...` |

## 3. Definition of Done
- [ ] `npm test` green in `server/` and `client/`.
- [ ] Switching Himass ↔ TanVuu quickly under DevTools "Slow 3G" shows cancelled requests.
- [ ] Hide the tab for 1 minute, come back → countdown jumps to the correct value instantly.
- [ ] Invalid appeal is rejected identically by client and server (try with curl).
- [ ] Console: 0 errors/warnings. 375px without horizontal scroll.