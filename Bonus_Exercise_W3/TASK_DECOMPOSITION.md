# TASK DECOMPOSITION

## Bonus Exercise – Hẹn Hò Nhưng Không Yêu (Situationship Analyzer)

## 1. Project Overview

Build a Situationship Analyzer using React 19 and a strict Finite State Machine (FSM).

The application models relationship phases, calculates asymmetric effort impact, maintains an immutable effort log, and detects ghosting through a cleanup-safe timer.

## 2. Task Checklist

### Task 1 – Project Initialization

- [x] Initialize React 19 + Vite project.
- [x] Verify the development server.
- [x] Configure the initial project structure.
- [x] Create the initial Git commit.

### Task 2 – Relationship State Machine

- [x] Define relationship phases:
  - FRIENDS
  - DATING_NO_LOVE
  - OFFICIAL_LOVE
  - GHOSTED_EXIT
- [x] Define relationship events.
- [x] Implement a pure relationship reducer.
- [x] Prevent invalid state transitions.
- [x] Write unit tests for valid and invalid transitions.

### Task 3 – Asymmetric Effort Calculator

- [x] Define effort actors: EM and AI_DO.
- [x] Define asymmetric multipliers:
  - EM: 0.1
  - AI_DO: 50.0
- [x] Implement effort signal validation.
- [x] Implement effort impact calculation.
- [x] Test edge cases and calculation accuracy.

### Task 4 – Immutable Effort Log

- [x] Define the initial effort log.
- [x] Implement immutable signal insertion.
- [x] Validate effort signals before appending.
- [x] Test that previous log states remain unchanged.

### Task 5 – Red-Flag Detection

- [x] Calculate myImpact and rivalImpact from effort signals.
- [x] Test effort metrics aggregation.
- [x] Implement the pure Red-Flag detection rule.
- [x] Test red-flag detection edge cases.
- [ ] Derive isRedFlag directly during rendering.
- [ ] Apply the required condition:
      phase === DATING_NO_LOVE && myImpact < rivalImpact
- [ ] Avoid redundant state and useEffect for derived values.

### Task 6 – Ghosting Timer

- [x] Implement the 5-second ghosting timer.
- [x] Trigger GHOSTED_EXIT when the timer expires.
- [x] Cancel the pending timer when the phase changes.
- [x] Clean up the timer when the component unmounts.
- [x] Ensure timer dependencies are correct.

### Task 7 – Analyzer Interface

- [x] Create SituationshipAnalyzer.jsx.
- [x] Connect the FSM reducer to React state.
- [x] Implement effort input controls.
- [x] Display calculated effort impact.
- [x] Display the red-flag status.
- [x] Display the effort history.
- [x] Add relationship phase controls.
- [x] Mount SituationshipAnalyzer in App.jsx.

### Task 8 – Accessibility

- [x] Generate unique input IDs using useId().
- [x] Associate labels with their corresponding inputs.
- [x] Add output role="status".
- [x] Add aria-live="polite" for status announcements.
- [x] Verify keyboard accessibility.

### Task 9 – Responsive Design

- [x] Implement the desktop layout.
- [x] Support a viewport width of 375px.
- [x] Prevent horizontal overflow.
- [x] Verify input and button usability on mobile.

### Task 10 – Testing and Quality Assurance

- [x] Test the relationship state machine.
- [x] Test effort impact calculations.
- [x] Test immutable effort log behavior.
- [x] Test red-flag detection.
- [x] Test ghosting timer expiration.
- [x] Test timer cleanup after phase changes.
- [x] Test component interactions.
- [x] Run all automated tests.
- [x] Run the production build.
- [x] Verify the application at 375px.

### Task 11 – Documentation and Final Review

- [ ] Review the project structure.
- [ ] Review Git commit history.
- [ ] Complete AI_FAILURE_AUDIT.md.
- [ ] Capture required screenshots.
- [ ] Verify all Bonus Exercise requirements.

## 3. Git Commit Requirements

- Every meaningful implementation milestone must have its own atomic commit.
- Preserve commit messages explicitly required by the Lab 3 slides.
- Use Conventional Commits for milestones without prescribed messages.
- Global project initialization commits do not count toward the minimum of 10 meaningful commits.
- Do not combine unrelated code changes into one commit.

## 4. Required Commit Messages

- [x] feat(fsm): model HenHoKhongYeu state machine
- [ ] feat(ui): add derived red-flag meter & ghosting cleanup

## 5. Progress Summary

Completed:

- React 19 + Vite initialization.
- Relationship State Machine.
- Asymmetric Effort Calculator.
- Immutable Effort Log.

Remaining:

- Unit tests.
- Red-flag detection.
- Ghosting timer and cleanup.
- React analyzer interface.
- Accessibility.
- Responsive design.
- Final testing and documentation.
