# PROJECT RULES — EXERCISE 3

## 1. Technology Stack

- Use React 19, Vite, and modern JavaScript (ES2024).
- Use functional components and React Hooks.

## 2. No Legacy APIs

- Do not use class components (`class extends React.Component`).
- Do not use `ReactDOM.render`.
- Do not use `defaultProps`.
- Do not use deprecated keyboard properties such as `keyCode`.
- Never use `window.alert()`.

## 3. Semantic HTML

- Avoid unnecessary `<div>` wrappers ("div-soup").
- Prefer semantic elements such as `<main>`, `<section>`, `<article>`, `<header>`, `<dl>`, `<dt>`, `<dd>`, `<figure>`, and `<output>` where appropriate.

## 4. Accessibility

- Every `<input>` and `<select>` must have an associated `<label htmlFor={id}>`.
- Use `useId()` to generate stable IDs for form controls.
- Loading regions must expose their busy state.
- Errors must be announced through an accessible `role="alert"` region.

## 5. State Management

- Use immutable state updates.
- Model telemetry lifecycle explicitly with `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- Do not store values that can be derived directly from existing state.

## 6. Effect Cleanup & Network Resilience

- Every effect that starts a fetch request must use an `AbortController`.
- Pass the controller's signal to the request.
- Return a cleanup function that calls `controller.abort()`.
- Handle intentional `AbortError` cancellation separately; it must not display a false error state.
- Prevent stale requests from replacing the latest selected squad's data.

## 7. Git Workflow

- Work directly on the `main` branch.
- Make small, atomic commits.
- Preserve the two mandatory Exercise 3 commit messages exactly.
- Stage only Exercise 3 files when committing from the parent repository.
- Verify the Git diff and status before every commit.

## 8. Verification

- Run ESLint and the production build.
- Test the loading, success, error, retry, and cancellation flows.
- Verify behavior under Slow 3G network throttling.
- Inspect accessibility and browser console output.
