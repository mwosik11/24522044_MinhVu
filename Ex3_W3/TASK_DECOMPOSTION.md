# TASK DECOMPOSITION — EXERCISE 3

## KRAFTON PUBG VN Live Match Telemetry Widget

**Project:** Exercise 3 — Lab 03  
**Stack:** React 19, Vite, JavaScript ES2024  
**Branch:** `main`

## M0 — Project Initialization & Configuration

- [x] Create the `Ex3_W3` project folder.
- [x] Initialize a React project using Vite.
- [x] Select ESLint during project setup.
- [x] Install npm dependencies.
- [ ] Verify React and React DOM versions.
- [ ] Verify the development server.
- [ ] Run the initial production build.
- [ ] Review the generated project structure.

## M1 — Data Contract & State Machine

- [ ] Define the `PUBG_VN_SQUADS` dataset.
- [ ] Add Cerberus Esports (`ces`), The Expendables (`te`), and Genius Esports (`ge`).
- [ ] Define the telemetry data structure: `id`, `name`, `map`, `phase`, `alive`, `kills`, `wwcdProb`, and `status`.
- [ ] Define the four lifecycle states: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- [ ] Define valid state transitions and the required data for each state.
- [ ] Document the component contract for `PubgMatchTelemetry`.

## M2 — Telemetry Request & AbortController

- [ ] Implement `fetchKraftonPubgTelemetry(squadId, { signal })`.
- [ ] Simulate telemetry loading and a 35% packet-loss failure rate.
- [ ] Pass the `AbortSignal` to the asynchronous request.
- [ ] Create an `AbortController` inside `useEffect`.
- [ ] Abort the previous request in the effect cleanup function.
- [ ] Handle `AbortError` separately from genuine request failures.
- [ ] Prevent stale requests from overwriting the latest squad data.

## M3 — Telemetry UI & Skeleton Radar

- [ ] Implement the `PubgMatchTelemetry` component.
- [ ] Render the `IDLE` state.
- [ ] Render a 220px pulsing Blue-Zone Skeleton during `LOADING`.
- [ ] Add `aria-busy="true"` to the loading region.
- [ ] Render squad telemetry data in `SUCCESS`.
- [ ] Render an accessible error section in `ERROR`.
- [ ] Keep the layout stable while loading to target 0.00 CLS.

## M4 — Squad Switching & Retry Recovery

- [ ] Implement squad selection for CES, TE, and GE.
- [ ] Trigger a new telemetry request when the selected squad changes.
- [ ] Verify that changing squads aborts the previous in-flight request.
- [ ] Implement the `Reconnect Satellite` retry button.
- [ ] Use a retry counter to trigger a new request.
- [ ] Verify that intentional request cancellation never displays a false error.

## M5 — Verification, Accessibility & Final Audit

- [ ] Verify all four state-machine states.
- [ ] Test successful telemetry responses.
- [ ] Test simulated packet-loss failures.
- [ ] Test retry recovery after an error.
- [ ] Use browser DevTools Slow 3G throttling.
- [ ] Verify the Skeleton UI and inspect Cumulative Layout Shift.
- [ ] Rapidly switch CES → TE → GE and verify canceled requests.
- [ ] Inspect the browser console for errors.
- [ ] Verify semantic HTML and accessible error announcements.
- [ ] Run ESLint.
- [ ] Run the production build.
- [ ] Capture screenshots of the required verification evidence.
- [ ] Review Git history and confirm the mandatory commits.

## Mandatory Git Commits

The following two commit messages are required by the Lab 03 Exercise 3 specification. Preserve them exactly.

1. `feat(ex3): implement PUBG VN 4-state telemetry & AbortController`
2. `feat(ex3): add skeleton UI & retry alert`

## Completion Criteria

Exercise 3 is complete when the four-state telemetry flow, squad switching, request cancellation, Skeleton UI, simulated packet-loss handling, and retry recovery have been implemented and verified. The required Git commits must also be present in the repository history.
