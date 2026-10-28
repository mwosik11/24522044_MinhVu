# Project Rules — HW3_W2

## 1. Project Objective

Build a High-Concurrency Flash-Sale E-Commerce Engine simulating a Vietnam mega-sale event, following the HW3 specification in Lab 2.

## 2. Architecture Rules

- Separate business logic from UI rendering.
- Implement the countdown timer and inventory state machine as independent TypeScript modules.
- Define contracts and state transitions before implementing business logic.
- Keep functions focused on a single responsibility.
- Avoid unnecessary dependencies.

## 3. TypeScript Rules

- Use TypeScript for application and test code.
- Prefer `const`; use `let` only when reassignment is necessary.
- Do not use `var` or implicit global variables.
- Define explicit types for domain entities, timer callbacks, inventory states, and events.
- Handle invalid inputs and asynchronous failures explicitly.

## 4. Countdown Timer Rules

- Calculate remaining time from an absolute target timestamp using `Date.now()`.
- Do not decrement the remaining time by a fixed interval.
- Use `requestAnimationFrame` for browser animation updates.
- Provide cleanup to cancel scheduled animation frames.
- Ensure the timer stops at zero and does not continue scheduling frames after completion or disposal.

## 5. Inventory State Machine Rules

- Model inventory reservation, lock expiry, and checkout through explicit states and events.
- Define valid state transitions and reject invalid transitions.
- Never allow available inventory to become negative.
- Prevent the same reservation from being checked out or released more than once.
- Handle concurrent reservation attempts without overselling within the application's execution model.
- Make reservation expiry and checkout behavior deterministic and testable.

## 6. Security and DOM Rules

- Use semantic HTML and accessible form controls.
- Do not use inline event-handler attributes such as `onclick`.
- Do not inject untrusted input through `innerHTML`.
- Use DOM APIs and `textContent` for displaying user-controlled text.
- Validate user inputs before processing them.

## 7. Testing Rules

- Use Vitest for unit tests.
- Test normal behavior, boundary conditions, invalid transitions, and concurrent inventory operations.
- Test timer completion and cleanup.
- Run tests and production builds after meaningful changes.
- Do not claim a requirement is verified unless the corresponding check has been performed.

## 8. Git Rules

- Make at least 8 atomic commits using Conventional Commits.
- Keep each commit focused on one meaningful change.
- Verify changes before committing.
- Do not combine the entire implementation into a single commit.

## 9. AI-Assisted Development Rules

- Decompose the work into small tasks.
- Generate and review one module or isolated change at a time.
- Inspect diffs and verify generated code through tests and browser behavior.
- Document at least 3 actual AI-induced defects in `AI_FAILURE_AUDIT.md`, including their detection methods and verified fixes.
- Never invent defects or claim unperformed tests as completed.
