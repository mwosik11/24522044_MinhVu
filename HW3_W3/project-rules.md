# HW3 – PUBG Vietnam Arena

## Project Engineering Rules

### 1. Technology Stack

- React 19.
- Vite.
- JavaScript ES2024.
- Functional Components and React Hooks.
- Vitest and React Testing Library for automated testing.

### 2. Modern React Standards

- Use functional components only.
- Use `createRoot()` from `react-dom/client`.
- Do not use class components.
- Do not use legacy APIs such as `ReactDOM.render()`, `defaultProps`, or deprecated `keyCode`.
- Use stable and meaningful React keys.
- Never use `Math.random()` or array indexes as keys for dynamic collections.

### 3. Semantic HTML and Accessibility

- Avoid unnecessary `<div>` elements and div-based layouts.
- Prefer semantic elements such as `<main>`, `<header>`, `<section>`, `<article>`, `<nav>`, `<output>`, and `<footer>`.
- Every form control must have an associated accessible label.
- Use React `useId()` for generated form-control identifiers.
- Interactive controls must support keyboard navigation and visible focus states.
- Use appropriate ARIA attributes when native HTML semantics are insufficient.

### 4. State Management

- Use immutable state updates.
- Do not mutate React state directly.
- Derive filtered and sorted data during rendering or through `useMemo()`.
- Do not introduce redundant `useState()` and `useEffect()` pairs for derived data.
- Use explicit state transitions for claim and inventory workflows.
- Prevent duplicate claim requests through an in-flight operation lock.

### 5. Effects and Resource Cleanup

- Every `useEffect()` that creates timers or event listeners must return a cleanup function.
- Clear intervals and timeouts during cleanup.
- Remove event listeners during cleanup.
- Use `AbortController` for cancellable network requests.
- Handle component unmounting without allowing stale asynchronous updates.
- Resynchronize countdown calculations when the browser tab becomes visible again.

### 6. Timer Engineering

- Calculate remaining time from an absolute target timestamp.
- Use `Date.now()` rather than decrementing a counter as the source of truth.
- Support a configurable server time offset.
- Do not assume `setInterval()` executes at exact one-second intervals.
- Recalculate the remaining time when `visibilitychange` occurs.

### 7. Inventory and Claim Integrity

- Implement optimistic inventory updates.
- Prevent duplicate submissions.
- Preserve the previous inventory state before an optimistic update.
- Roll back inventory when the simulated or real service returns HTTP 409 Conflict.
- Represent claim lifecycle using explicit states rather than contradictory boolean combinations.
- Never allow inventory to become negative.

### 8. Security and Error Handling

- Never render untrusted content using `innerHTML`.
- Do not expose secrets or API keys in client-side source code.
- Handle network errors and rejected promises explicitly.
- Display meaningful error and success states.
- Do not silently ignore unexpected errors.

### 9. Code Quality and Testing

- Keep components, hooks, domain logic, and data sources separated.
- Write small functions with clear responsibilities.
- Use descriptive variable and function names.
- Test edge cases, not only successful operations.
- Verify timer cleanup, optimistic rollback, duplicate claim prevention, filtering, and sorting.
- Run automated tests and production builds before final submission.

### 10. Git Workflow

- Use Conventional Commits.
- Make meaningful, atomic commits.
- Do not combine unrelated changes into one commit.
- Every implementation milestone must be independently verifiable.
- Maintain at least 10 meaningful HW3 commits, excluding global setup commits.
- Keep `TASK_DECOMPOSITION.md` synchronized with implementation milestones.
