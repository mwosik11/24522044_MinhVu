# TASK_DECOMPOSITION.md

## HW3 — High-Concurrency Flash-Sale E-Commerce Engine

### Milestone 1: Project Foundation

- [x] T1.1 Verify project configuration and dependencies.
- [x] T1.2 Create `project-rules.md`.
- [x] T1.3 Define the work breakdown structure.
- [x] T1.4 Verify the initial project build and test setup.
- [x] T1.5 Commit the project foundation.

### Milestone 2: Anti-Drift Countdown Timer

- [x] T2.1 Define the timer API and lifecycle contract.
- [x] T2.2 Implement target-time-based remaining-time calculation.
- [x] T2.3 Implement animation scheduling with `requestAnimationFrame`.
- [x] T2.4 Implement cancellation and cleanup.
- [x] T2.5 Test timer initialization, ticking, completion, and disposal.
- [ ] T2.6 Commit the timer implementation and tests.

### Milestone 3: Inventory State Machine

- [ ] T3.1 Define inventory entities, reservation records, states, and events.
- [ ] T3.2 Define valid and invalid state transitions.
- [ ] T3.3 Implement inventory reservation.
- [ ] T3.4 Implement lock expiry and inventory release.
- [ ] T3.5 Implement checkout and duplicate-operation protection.
- [ ] T3.6 Test inventory invariants and boundary conditions.
- [ ] T3.7 Commit the inventory state machine and tests.

### Milestone 4: High-Concurrency Behavior

- [ ] T4.1 Define the application's concurrency model.
- [ ] T4.2 Prevent overselling during competing reservation attempts.
- [ ] T4.3 Handle checkout and expiry races deterministically.
- [ ] T4.4 Test simultaneous requests and inventory invariants.
- [ ] T4.5 Commit concurrency handling and tests.

### Milestone 5: Flash-Sale User Interface

- [ ] T5.1 Define the product and flash-sale presentation.
- [ ] T5.2 Display the countdown timer.
- [ ] T5.3 Display available inventory and reservation status.
- [ ] T5.4 Integrate reservation, expiry, and checkout actions.
- [ ] T5.5 Implement loading, success, and error feedback.
- [ ] T5.6 Verify keyboard navigation and responsive layout.
- [ ] T5.7 Commit the UI and styling.

### Milestone 6: Integration and Verification

- [ ] T6.1 Run all unit tests.
- [ ] T6.2 Run TypeScript checks and production build.
- [ ] T6.3 Test timer and inventory integration in the browser.
- [ ] T6.4 Verify invalid transitions, expiry, duplicate checkout, and overselling prevention.
- [ ] T6.5 Review security, accessibility, and resource cleanup.
- [ ] T6.6 Capture screenshots of key behaviors.

### Milestone 7: AI Failure Audit and Finalization

- [ ] T7.1 Identify at least 3 actual AI-induced defects during review.
- [ ] T7.2 Record each defect, detection method, and risk in `AI_FAILURE_AUDIT.md`.
- [ ] T7.3 Document the refactored solution and verification evidence.
- [ ] T7.4 Review Git history for at least 8 atomic Conventional Commits.
- [ ] T7.5 Confirm all required deliverables are complete.

## Completion Rule

A task is complete only after its implementation and relevant verification have been performed. Do not mark unverified tasks as complete.
