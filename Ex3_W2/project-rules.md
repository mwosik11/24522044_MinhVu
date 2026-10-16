# Project Rules — Exercise 3: Resilient State Machine & Skeleton Loader

## 1. General Engineering Principles

- Follow all requirements, constraints, and deliverables specified in Lab 02 slides.
- Follow the four-stage workflow: Functional Slicing → Contract-First Specification → Atomic Generation → Independent Verification.
- Implement one atomic task at a time. Do not generate the entire application in a single step.
- Verify each task before marking it complete or proceeding to the next task.
- Maintain `project-rules.md` and `TASK_DECOMPOSITION.md` throughout development.
- Treat generated code as unverified until it has been tested.

## 2. Coding Standards

### 2.1 Readability and Maintainability

- Write clean, consistent, and well-formatted code.
- Use meaningful variable, function, and component names.
- Keep functions focused on a single responsibility.
- Avoid unnecessarily complex expressions, deeply nested logic, and duplicated code.
- Organize code into appropriate modules to separate state management, data operations, UI rendering, and styling.
- Follow consistent indentation, spacing, and naming conventions.

### 2.2 Code Comments

- Include comments that explain important logic, design decisions, state transitions, and non-obvious implementation details.
- Comments must help another developer understand why the code works as it does.
- Avoid redundant comments that merely repeat the code.
- Keep comments accurate and update them whenever the corresponding implementation changes.

### 2.3 Modern JavaScript

- Use `const` by default and `let` when reassignment is necessary. Never use `var`.
- Use ES modules with `import` and `export` where appropriate.
- Use modern JavaScript syntax and asynchronous patterns such as `async`/`await`.
- Handle errors explicitly; do not silently swallow exceptions.
- Avoid implicit global variables and deprecated event patterns.
- Do not use `keypress` or `event.keyCode`; use `keydown` and `event.key` when keyboard handling is required.
- Do not use inline HTML event-handler attributes.
- Do not inject untrusted content through raw `innerHTML`. Prefer safe DOM APIs and text nodes.

## 3. State Machine Requirements

- The application state must use exactly four lifecycle statuses: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- Each status must have clearly defined rendering behavior.
- `SUCCESS` must contain the successfully retrieved data.
- `ERROR` must contain a human-readable error message.
- `LOADING` must display a skeleton loading interface with a pulsing animation.
- `ERROR` must display an understandable error message and a `Retry Connection` button.
- Retrying must initiate a new loading operation and handle both success and failure.
- Prevent stale asynchronous operations from overwriting newer results.
- Avoid invalid or contradictory UI states.
- Keep data operations, state transitions, and presentation logic clearly separated.

## 4. UI and Visual Design Standards

- Design a professional, modern, and visually consistent interface.
- Use a restrained color palette with sufficient contrast and comfortable readability.
- Establish clear visual hierarchy through typography, spacing, alignment, and component sizing.
- Use consistent styling for buttons, cards, messages, and loading placeholders.
- Implement skeleton placeholders that resemble the structure of the content they represent.
- Use a subtle pulsing animation during loading without excessive visual distraction.
- Make success and error states visually distinguishable without relying on color alone.
- Provide clear labels, accessible controls, visible keyboard focus, and appropriate semantic HTML.
- Ensure the layout works on desktop and mobile screens.
- Avoid unnecessary decorative elements, excessive gradients, and inconsistent colors.

## 5. Error Handling and Asynchronous Operations

- Handle network failures, unsuccessful responses, invalid data, and unexpected exceptions.
- Display useful error messages without exposing sensitive technical details to users.
- Provide a clear retry mechanism when an operation fails.
- Ensure loading indicators do not remain visible after an operation has completed.
- Verify that repeated requests and out-of-order responses cannot corrupt the displayed state.
- Do not report an operation as successful unless the result has been verified.

## 6. Testing and Verification

- Define expected behavior before implementing each task.
- Test all four states: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- Test successful requests, failed requests, and retry behavior.
- Test repeated requests and asynchronous race conditions.
- Verify that the skeleton animation appears only during loading.
- Verify that data is rendered correctly after success.
- Verify that the error message and retry button work correctly after failure.
- Inspect browser DevTools for console errors and unexpected DOM behavior.
- Review the code and `git diff` before committing.
- Never claim that a test passed unless it has actually been executed.

## 7. Git Workflow

- Use small, atomic commits that correspond to completed tasks.
- Use clear commit messages following the Conventional Commits style.
- Required milestone commit:

  `feat(ui): implement multi-state data component with skeleton feedback`

- Do not combine unrelated changes in one commit.
- Do not commit broken or unverified code.
- Update `TASK_DECOMPOSITION.md` as tasks are completed.

## 8. Definition of Done

A task is complete only when:

- Its requirements and expected behavior are clearly defined.
- The implementation follows these project rules and the Lab 02 specifications.
- The code is readable, appropriately commented, and maintainable.
- Relevant tests have been executed and their results recorded.
- The interface meets the visual and usability standards.
- The changes have been reviewed and committed when required.
