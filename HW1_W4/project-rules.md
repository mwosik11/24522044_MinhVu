# project-rules.md — Lab 4 HW1: Photo & Evidence Gallery

> AI assistants MUST read this file before proposing any change. Every rule below is a hard constraint.

## 1. Stack

- React 19 + Vite + ES2022 JavaScript (`.jsx`). No TypeScript, no class components.
- Routing: **React Router v7** (`react-router` package) — `createBrowserRouter`, `RouterProvider`, `<Outlet>`, `<NavLink>`, `useSearchParams`.
- Testing: Vitest + Testing Library (jsdom).
- Zero UI libraries (no MUI, Ant Design, Tailwind, Bootstrap, react-modal). Native HTML first.

## 2. Banned APIs (instant reject)

| Banned                                                                              | Use instead                                                                         |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `<Switch>`, `<Redirect>`, `component={...}`, `exact`, `activeClassName` (Router v5) | route objects, `element`, `<Navigate>`, `NavLink className={({ isActive }) => ...}` |
| `react-router-dom` v5/v6 imports                                                    | `react-router` v7                                                                   |
| `Component.defaultProps`                                                            | ES6 default parameters                                                              |
| `ReactDOM.render`, `class extends React.Component`                                  | `createRoot`, function components                                                   |
| `e.keyCode`, `keypress`                                                             | `keydown` + `e.key`                                                                 |
| `window.alert()`                                                                    | `role="alert"` / `role="status"` regions                                            |
| Third-party modal libraries, hand-rolled `div role="dialog"`                        | Native `<dialog>` + `showModal()`                                                   |
| `dangerouslySetInnerHTML`, `innerHTML`                                              | JSX text (auto-escaped)                                                             |

## 3. State rules

1. **The URL is the single source of truth** for gallery view state: `category` and `photoId` live in the query string only. No duplicate `useState` copy of them.
2. Derived data (filtered list, selected photo, prev/next ids) is computed **during render** — never synced with `useEffect`.
3. `useEffect` is allowed only to synchronise with an external system (the `<dialog>` DOM API). Every effect must be idempotent under StrictMode double-invoke.
4. Update search params with the functional form `setSearchParams(prev => ...)` and **preserve unrelated params** (never `setSearchParams({})`).

## 4. Accessibility (WCAG 2.2 AA)

- Exactly one `<h1>` per route; no skipped heading levels.
- Skip link as first focusable element; landmarks `header`/`nav`/`main`/`footer`.
- Every icon-only button has `aria-label`. Every image has meaningful `alt` (or `alt=""` when decorative).
- Text contrast ≥ 4.5:1, UI component contrast ≥ 3:1, visible `:focus-visible` outline, target size ≥ 24×24 px (2.5.8).
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Dialog: opens with `showModal()` (focus trapped natively), labelled via `aria-labelledby`, Esc closes, focus returns to the trigger.

## 5. Performance (Lighthouse 100)

- Route-level code splitting with `React.lazy` + `<Suspense>`; dimension-matched skeleton fallback with `aria-busy="true"`.
- Every `<img>` has explicit `width`/`height` (CLS = 0); below-the-fold images `loading="lazy"`, first image `fetchpriority="high"`.
- No web fonts, no external CDNs, no runtime CSS-in-JS.

## 6. Git

- Conventional commits, one concern per commit, minimum 10 commits.
- Loop per feature: `docs(contract)` → `test` (red) → `feat` (green) → `refactor`.
- Never commit `.env` — only `.env.example`.
