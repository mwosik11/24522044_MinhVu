# Exercise 3 — Resilient State Machine & Skeleton Loader

## Project Goal

Build a resilient asynchronous data component with a strict four-state lifecycle, animated skeleton loading UI, human-readable error feedback, and retry functionality.

## Workflow Rules

- Follow the four-stage workflow defined in Lab 02.
- Implement one atomic task at a time.
- Define interfaces, state contracts, and expected behavior before implementation.
- Test each task independently before proceeding.
- Record test results and update this checklist only after verification.
- Do not include the AI Failure Audit in this exercise; it will be prepared after all three exercises are completed.

---

## Task 1 — Project Setup and State Contract

- [ ] 1.1 Create the `Ex3_W2/` project directory.
- [ ] 1.2 Create `project-rules.md`.
- [ ] 1.3 Create `TASK_DECOMPOSITION.md`.
- [ ] 1.4 Define the four permitted lifecycle states: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- [ ] 1.5 Define the data and error payloads for the corresponding states.
- [ ] 1.6 Document the expected state transitions and invalid transitions.
- [ ] 1.7 Verify that the contract matches the Lab 02 specifications.

## Task 2 — State Machine Implementation

- [ ] 2.1 Implement the state representation and initial `IDLE` state.
- [ ] 2.2 Define the allowed state transitions.
- [ ] 2.3 Implement transition validation.
- [ ] 2.4 Ensure `SUCCESS` contains valid data.
- [ ] 2.5 Ensure `ERROR` contains a human-readable error message.
- [ ] 2.6 Reject invalid or contradictory state updates.
- [ ] 2.7 Test valid and invalid transitions.

## Task 3 — Asynchronous Data Loading

- [ ] 3.1 Define the data-fetching contract.
- [ ] 3.2 Implement the asynchronous data-loading operation.
- [ ] 3.3 Transition to `LOADING` before starting or awaiting the request.
- [ ] 3.4 Transition to `SUCCESS` when valid data is received.
- [ ] 3.5 Transition to `ERROR` when the request fails.
- [ ] 3.6 Handle unsuccessful HTTP responses and invalid data.
- [ ] 3.7 Prevent stale requests from overwriting newer results.
- [ ] 3.8 Test successful, failed, and repeated requests.

## Task 4 — Skeleton Loading UI

- [ ] 4.1 Design the component layout and visual hierarchy.
- [ ] 4.2 Implement semantic HTML for the data component.
- [ ] 4.3 Build skeleton placeholders matching the expected content structure.
- [ ] 4.4 Add a subtle pulsing CSS animation.
- [ ] 4.5 Render the skeleton only while the state is `LOADING`.
- [ ] 4.6 Verify that the loading UI disappears after success or failure.
- [ ] 4.7 Test the layout on desktop and mobile screen sizes.

## Task 5 — Success and Error UI

- [ ] 5.1 Render the retrieved data when the state is `SUCCESS`.
- [ ] 5.2 Render a clear, human-readable error message when the state is `ERROR`.
- [ ] 5.3 Add the `Retry Connection` button.
- [ ] 5.4 Implement retry behavior using the existing loading operation.
- [ ] 5.5 Verify that retry returns the UI to `LOADING`.
- [ ] 5.6 Test recovery from failure to success.
- [ ] 5.7 Test repeated failures and repeated retries.

## Task 6 — Integration and Independent Verification

- [ ] 6.1 Integrate the state machine, data loader, and UI.
- [ ] 6.2 Verify the complete `IDLE → LOADING → SUCCESS` flow.
- [ ] 6.3 Verify the complete `IDLE → LOADING → ERROR` flow.
- [ ] 6.4 Verify the retry flow: `ERROR → LOADING → SUCCESS`.
- [ ] 6.5 Test race conditions and out-of-order responses.
- [ ] 6.6 Inspect browser DevTools for console errors.
- [ ] 6.7 Review code readability, comments, and project rules.
- [ ] 6.8 Review the final Git diff and commit history.
- [ ] 6.9 Record known technical limitations.

## Task 7 — Git Milestone

- [ ] 7.1 Confirm all required Exercise 3 behaviors work.
- [ ] 7.2 Commit the completed implementation using the required message:

  `feat(ui): implement multi-state data component with skeleton feedback`

- [ ] 7.3 Confirm the commit exists in Git history.
- [ ] 7.4 Confirm the working tree is clean.

---

## Expected Deliverables

- `project-rules.md`
- `TASK_DECOMPOSITION.md`
- State machine implementation
- Asynchronous data-loading implementation
- Skeleton loading UI and CSS animation
- Success and error views
- Working `Retry Connection` functionality
- Verified Git milestone commit

## Known Technical Limitations

- [ ] Record limitations discovered during implementation and testing.
- [ ] Distinguish verified limitations from untested assumptions.
- [ ] Defer the cross-exercise AI Failure Audit until all three exercises are complete.
