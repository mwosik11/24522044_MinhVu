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
- [x] Verify React and React DOM versions.
- [x] Verify the development server.
- [x] Run the initial production build.
- [x] Review the generated project structure.

## M1 — Data Contract & State Machine

- [x] Define the `PUBG_VN_SQUADS` dataset.
- [x] Add Cerberus Esports (`ces`), The Expendables (`te`), and Genius Esports (`ge`).
- [x] Define the telemetry data structure: `id`, `name`, `map`, `phase`, `alive`, `kills`, `wwcdProb`, and `status`.
- [x] Define the four lifecycle states: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- [x] Define valid state transitions and the required data for each state.
- [x] Document the component contract for `PubgMatchTelemetry`.

## M2 — Telemetry Request & AbortController

- [x] Implement `fetchKraftonPubgTelemetry(squadId, { signal })`.
- [x] Simulate telemetry loading and a 35% packet-loss failure rate.
- [x] Pass the `AbortSignal` to the asynchronous request.
- [x] Create an `AbortController` inside `useEffect`.
- [x] Abort the previous request in the effect cleanup function.
- [x] Handle `AbortError` separately from genuine request failures.
- [x] Prevent stale requests from overwriting the latest squad data.

## M3 — Telemetry UI & Skeleton Radar

- [x] Implement the `PubgMatchTelemetry` component.
- [x] Render the `IDLE` state.
- [x] Render a 220px pulsing Blue-Zone Skeleton during `LOADING`.
- [x] Add `aria-busy="true"` to the loading region.
- [x] Render squad telemetry data in `SUCCESS`.
- [x] Render an accessible error section in `ERROR`.
- [x] Keep the layout stable while loading to target 0.00 CLS.

## M4 — Squad Switching & Retry Recovery

- [x] Implement squad selection for CES, TE, and GE.
- [x] Trigger a new telemetry request when the selected squad changes.
- [x] Verify that changing squads aborts the previous in-flight request.
- [x] Implement the `Reconnect Satellite` retry button.
- [x] Use a retry counter to trigger a new request.
- [x] Verify that intentional request cancellation never displays a false error.

## M5 — Verification, Accessibility & Final Audit

- [x] Verify all four state-machine states.
- [x] Test successful telemetry responses.
- [x] Test simulated packet-loss failures.
- [x] Test retry recovery after an error.
- [x] Use browser DevTools Slow 3G throttling.
- [x] Verify the Skeleton UI and inspect Cumulative Layout Shift.
- [x] Rapidly switch CES → TE → GE and verify canceled requests.
- [x] Inspect the browser console for errors.
- [x] Verify semantic HTML and accessible error announcements.
- [x] Run ESLint.
- [x] Run the production build.
- [x] Capture screenshots of the required verification evidence.
- [x] Review Git history and confirm the mandatory commits.

## Mandatory Git Commits

The following two commit messages are required by the Lab 03 Exercise 3 specification. Preserve them exactly.

1. `feat(ex3): implement PUBG VN 4-state telemetry & AbortController`
2. `feat(ex3): add skeleton UI & retry alert`

## Completion Criteria

Exercise 3 is complete when the four-state telemetry flow, squad switching, request cancellation, Skeleton UI, simulated packet-loss handling, and retry recovery have been implemented and verified. The required Git commits must also be present in the repository history.
